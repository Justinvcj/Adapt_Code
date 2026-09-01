import httpx
from app.core.config import settings

LANGUAGE_MAP = {
    "python": {"language": "python", "version": "3.10"},
    71: {"language": "python", "version": "3.10"},
    "java": {"language": "java", "version": "15"},
    62: {"language": "java", "version": "15"},
    "c": {"language": "c", "version": "10"},
    "cpp": {"language": "c++", "version": "10"},
}

async def execute_code(code: str, language: str, stdin: str = "") -> dict:
    """
    Execute code via Piston running in Docker on this same machine.
    PISTON_URL defaults to http://localhost:2000 for the spare-laptop deployment.
    """
    lang_config = LANGUAGE_MAP.get(language, LANGUAGE_MAP["python"])

    payload = {
        "language": lang_config["language"],
        "version": lang_config["version"],
        "files": [{"content": code}],
        "stdin": stdin,
        "run_timeout": 5000,
        "compile_timeout": 10000,
        "run_memory_limit": 128_000_000,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{settings.PISTON_URL}/api/v2/execute",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
    except httpx.ConnectError:
        raise RuntimeError(
            "Cannot reach Piston. Confirm Docker is running and the Piston "
            "container is up: run 'docker ps' and check for a container named 'piston'."
        )
    except httpx.TimeoutException:
        return {
            "stdout": "", "stderr": "Execution timed out",
            "exit_code": -1, "timed_out": True, "is_compile_error": False
        }

    run = data.get("run", {})
    compile_result = data.get("compile", {})

    if compile_result.get("code") and compile_result["code"] != 0:
        return {
            "stdout": "",
            "stderr": compile_result.get("stderr", "Compilation failed"),
            "exit_code": compile_result["code"],
            "timed_out": False,
            "is_compile_error": True
        }

    return {
        "stdout": run.get("stdout", ""),
        "stderr": run.get("stderr", ""),
        "exit_code": run.get("code", 0),
        "timed_out": run.get("signal") == "SIGKILL",
        "is_compile_error": False
    }
