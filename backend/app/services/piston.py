import httpx
import json
from typing import List, Dict, Any, Optional
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

def _python_harness(student_code: str, function_name: str, n_params: int) -> str:
    """Wrap student's Solution class with a stdin driver that calls their function
    and prints the JSON result. One JSON value per line of stdin, in order."""
    return f"""import sys, json

{student_code}

def _ac_main():
    data = sys.stdin.read()
    lines = [l for l in data.split('\\n') if l.strip() != '']
    args = []
    for ln in lines[:{n_params}]:
        try:
            args.append(json.loads(ln))
        except Exception:
            args.append(ln)
    _sol = Solution()
    _result = _sol.{function_name}(*args)
    print(json.dumps(_result, separators=(',', ':')))

_ac_main()
"""


def _javascript_harness(student_code: str, function_name: str, n_params: int) -> str:
    return f"""{student_code}

(function() {{
    const data = require('fs').readFileSync(0, 'utf8');
    const lines = data.split('\\n').filter(l => l.trim() !== '');
    const args = lines.slice(0, {n_params}).map(l => {{ try {{ return JSON.parse(l); }} catch {{ return l; }} }});
    const result = {function_name}(...args);
    process.stdout.write(JSON.stringify(result));
}})();
"""


def wrap_code(student_code: str, language: str, function_meta: Optional[dict]) -> str:
    """Wrap function-style student code so it reads stdin and prints result.
    Returns code unchanged when meta is missing or language is unsupported."""
    if not function_meta or not function_meta.get("function_name"):
        return student_code
    fn = function_meta["function_name"]
    n = len(function_meta.get("parameters") or [])
    if language in ("python", "python3"):
        return _python_harness(student_code, fn, n)
    if language in ("javascript", "js", "node"):
        return _javascript_harness(student_code, fn, n)
    # Java / C++ harnessing is non-trivial — fall through unchanged for now.
    return student_code


def _normalize_for_compare(s: str) -> str:
    """Make the output / expected comparable: parse as JSON when possible so
    [0, 1] matches [0,1], and 'true' matches true."""
    s = s.strip()
    try:
        return json.dumps(json.loads(s), separators=(",", ":"))
    except Exception:
        return s


async def run_test_cases(code: str, language: str, test_cases: List[Dict[str, Any]], function_meta: Optional[dict] = None) -> dict:
    """Run harnessed student code against all test cases and compute a verdict."""
    wrapped = wrap_code(code, language, function_meta)
    passed = 0
    total = len(test_cases)
    first_failure = None
    compile_error = False

    for tc in test_cases:
        try:
            result = await execute_on_piston(wrapped, language, stdin=tc.get("input", ""))
        except httpx.HTTPStatusError as e:
            # Piston itself refused this request — treat as runtime error so the
            # whole submit doesn't 500.
            first_failure = {
                "input": tc.get("input", ""),
                "expected": tc.get("expected_output", ""),
                "actual": str(e)[:400],
                "verdict": "runtime_error",
            }
            break

        run_result = result.get("run", {}) or {}
        compile_result = result.get("compile", {}) or {}

        if compile_result.get("code") and compile_result["code"] != 0:
            compile_error = True
            first_failure = {
                "input": tc.get("input", ""),
                "expected": tc.get("expected_output", ""),
                "actual": compile_result.get("stderr", "Compilation failed"),
                "verdict": "compile_error",
            }
            break

        if run_result.get("code") and run_result["code"] != 0:
            if not first_failure:
                first_failure = {
                    "input": tc.get("input", ""),
                    "expected": tc.get("expected_output", ""),
                    "actual": run_result.get("stderr", "Runtime error"),
                    "verdict": "runtime_error",
                }
            continue

        actual = _normalize_for_compare(run_result.get("stdout", ""))
        expected = _normalize_for_compare(tc.get("expected_output", ""))

        if actual == expected:
            passed += 1
        elif not first_failure:
            first_failure = {
                "input": tc.get("input", ""),
                "expected": expected,
                "actual": actual,
                "verdict": "wrong_answer",
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
        "error_output": first_failure.get("actual", "") if first_failure else "",
    }
