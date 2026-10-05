import httpx
from typing import List, Dict, Any
from app.core.config import settings

# Treat PISTON_URL strictly as the base URL
PISTON_BASE_URL = getattr(settings, "PISTON_URL", "http://localhost:2000").rstrip("/")
PISTON_EXECUTE_URL = f"{PISTON_BASE_URL}/api/v2/execute"

# Piston rejects a request if "version" does not match an installed runtime.
# "*" tells Piston to pick the latest installed version — robust across runtime upgrades.
LANGUAGE_MAP = {
    "python":     {"language": "python",     "version": "*"},
    "python3":    {"language": "python",     "version": "*"},
    "java":       {"language": "java",       "version": "*"},
    "c":          {"language": "c",          "version": "*"},
    "cpp":        {"language": "c++",        "version": "*"},
    "c++":        {"language": "c++",        "version": "*"},
    "javascript": {"language": "javascript", "version": "*"},
    "js":         {"language": "javascript", "version": "*"},
    "node":       {"language": "javascript", "version": "*"},
}

async def execute_on_piston(code: str, language: str, stdin: str = "") -> dict:
    """Execute code on Piston and return stdout, stderr, exit code."""
    lang_config = LANGUAGE_MAP.get(language, LANGUAGE_MAP["python"])
    
    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [{"content": code}],
        "stdin": stdin,
        # Our EC2 Piston instance caps run_timeout at 3000ms and compile_timeout at 10000ms.
        # Memory limit also capped — omit to use the instance default rather than guess.
        "run_timeout": 3000,
        "compile_timeout": 10000,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(PISTON_EXECUTE_URL, json=payload)
        if response.status_code >= 400:
            # Surface Piston's own error message so debugging isn't blind.
            raise httpx.HTTPStatusError(
                f"Piston {response.status_code}: {response.text[:400]}",
                request=response.request,
                response=response,
            )
        return response.json()

async def run_test_cases(code: str, language: str, test_cases: List[Dict[str, Any]]) -> dict:
    """
    Run student code against all test cases.
    Piston doesn't have built-in test comparison — we handle it.
    
    Strategy: For each test case, send code + stdin, compare stdout with expected.
    """
    passed = 0
    total = len(test_cases)
    first_failure = None
    compile_error = False
    
    for tc in test_cases:
        result = await execute_on_piston(code, language, stdin=tc.get("input", ""))
        
        run_result = result.get("run", {})
        compile_result = result.get("compile", {})
        
        # Check compile error
        if compile_result.get("code") and compile_result["code"] != 0:
            compile_error = True
            first_failure = {
                "input": tc.get("input", ""),
                "expected": tc.get("expected_output", ""),
                "actual": compile_result.get("stderr", "Compilation failed"),
                "verdict": "compile_error"
            }
            break
        
        # Check runtime error
        if run_result.get("code") and run_result["code"] != 0:
            if not first_failure:
                first_failure = {
                    "input": tc.get("input", ""),
                    "expected": tc.get("expected_output", ""),
                    "actual": run_result.get("stderr", "Runtime error"),
                    "verdict": "runtime_error"
                }
            continue
        
        # Compare output
        actual_output = run_result.get("stdout", "").strip()
        expected_output = tc.get("expected_output", "").strip()
        
        if actual_output == expected_output:
            passed += 1
        elif not first_failure:
            first_failure = {
                "input": tc.get("input", ""),
                "expected": expected_output,
                "actual": actual_output,
                "verdict": "wrong_answer"
            }
    
    if compile_error:
        verdict = "compile_error"
    elif passed == total and total > 0:
        verdict = "accepted"
    else:
        verdict = first_failure.get("verdict", "wrong_answer") if first_failure else "wrong_answer"
    
    return {
        "verdict": verdict,
        "passed": passed,
        "total": total,
        "first_failure": first_failure,
        "error_output": first_failure.get("actual", "") if first_failure else ""
    }
