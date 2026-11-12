import httpx
import json
import os
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.core.logging import logger

# Treat PISTON_URL strictly as the base URL
PISTON_BASE_URL = getattr(settings, "PISTON_URL", "http://localhost:2000").rstrip("/")
PISTON_EXECUTE_URL = f"{PISTON_BASE_URL}/api/v2/execute"

# Piston rejects a request if "version" does not match an installed runtime.
# "*" tells Piston to pick the latest installed version — robust across
# runtime upgrades, but means a silent Piston runtime upgrade with a fresh
# CVE lands in prod with no code change here.
#
# `PISTON_PINNED_VERSIONS` (JSON object) overrides specific languages with a
# known-good version string, e.g.:
#   PISTON_PINNED_VERSIONS='{"python":"3.12.0","java":"15.0.2","c++":"10.2.0","javascript":"18.15.0"}'
#
# Get the actual version strings installed on the sandbox with:
#   curl http://100.114.155.33:2000/api/v2/runtimes | jq '[.[] | {language, version}]'
# (from a tailnet-connected machine — the sandbox has no public port.)
#
# Unpinned languages still get "*". A wrong version string makes Piston 400
# on every request for that language, so pin from an actual runtimes listing
# — never guess.


def _load_pinned_versions() -> Dict[str, str]:
    raw = os.environ.get("PISTON_PINNED_VERSIONS", "").strip()
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError as e:
        logger.warning("PISTON_PINNED_VERSIONS ignored (invalid JSON): %s", e)
        return {}
    if not isinstance(parsed, dict):
        logger.warning("PISTON_PINNED_VERSIONS ignored (not an object)")
        return {}
    # Normalise to str/str — Piston rejects anything else anyway.
    return {str(k): str(v) for k, v in parsed.items() if v}


_PINNED = _load_pinned_versions()


def _version_for(lang: str) -> str:
    # Lookup order: exact alias -> Piston canonical name -> "*"
    if lang in _PINNED:
        return _PINNED[lang]
    canonical = {
        "python3":    "python",
        "cpp":        "c++",
        "js":         "javascript",
        "node":       "javascript",
    }.get(lang, lang)
    return _PINNED.get(canonical, "*")


LANGUAGE_MAP = {
    "python":     {"language": "python",     "version": _version_for("python")},
    "python3":    {"language": "python",     "version": _version_for("python3")},
    "java":       {"language": "java",       "version": _version_for("java")},
    "c":          {"language": "c",          "version": _version_for("c")},
    "cpp":        {"language": "c++",        "version": _version_for("cpp")},
    "c++":        {"language": "c++",        "version": _version_for("c++")},
    "javascript": {"language": "javascript", "version": _version_for("javascript")},
    "js":         {"language": "javascript", "version": _version_for("js")},
    "node":       {"language": "javascript", "version": _version_for("node")},
}

if _PINNED:
    logger.info("Piston runtime pins active: %s", _PINNED)

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
