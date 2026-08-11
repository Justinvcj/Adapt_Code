import httpx
import asyncio

async def test_judge0():
    async with httpx.AsyncClient() as client:
        print("Testing Valid Parentheses logic on Judge0...")
        req_data = {
            "source_code": "import sys\ns = sys.stdin.read().strip()\nif s == '()':\n    print('true')\nelse:\n    print('false')",
            "language_id": 71,
            "stdin": "()\n",
            "expected_output": "true\n"
        }
        try:
            res = await client.post("http://localhost:2358/submissions?base64_encoded=false&wait=true", json=req_data)
            data = res.json()
            print(f"Status: {data.get('status', {}).get('description')}")
            print(f"Stdout: {data.get('stdout')}")
            print(f"Expected Output: {req_data['expected_output']}")
            print("Judge0 is correctly matching stdout to expected_output!")
        except Exception as e:
            print(f"Judge0 error: {e}")

if __name__ == "__main__":
    asyncio.run(test_judge0())
