import httpx
from typing import List, Dict, Any
from app.core.config import settings

# Treat PISTON_URL strictly as the base URL
PISTON_BASE_URL = getattr(settings, "PISTON_URL", "http://localhost:2000").rstrip("/")
PISTON_EXECUTE_URL = f"{PISTON_BASE_URL}/api/v2/execute"

LANGUAGE_MAP = {
    "python": {"language": "python", "version": "3.10"},
    "python3": {"language": "python", "version": "3.10"},
    "java": {"language": "java", "version": "15"},
    "c": {"language": "c", "version": "10"},
    "cpp": {"language": "c++", "version": "10"},
    "javascript": {"language": "javascript", "version": "18.15.0"},
}

async def execute_on_piston(code: str, language: str, stdin: str = "") -> dict:
    """Execute code on Piston and return stdout, stderr, exit code."""
    lang_config = LANGUAGE_MAP.get(language, LANGUAGE_MAP["python"])
    
    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [{"content": code}],
        "stdin": stdin,
        "run_timeout": 5000,       # 5 seconds
        "compile_timeout": 10000,  # 10 seconds
        "run_memory_limit": 128_000_000,  # 128 MB
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(PISTON_EXECUTE_URL, json=payload)
        response.raise_for_status()
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
