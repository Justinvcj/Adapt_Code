import os
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
supabase: Client = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_KEY"))

def test_system():
    # 1. Fetch problems
    res = supabase.table("problems").select("*").execute()
    problems = res.data
    
    print(f"Found {len(problems)} problems.")
    
    for p in problems:
        print(f"\n--- Testing Problem: {p['title']} ---")
        test_cases = p['test_cases']
        print(f"First Test Case Input: {repr(test_cases[0]['input'])}")
        print(f"First Test Case Expected Output: {repr(test_cases[0]['expected_output'])}")
        
        # We will submit a hardcoded Python solution just to print the input so we can see what Judge0 sees.
        # Actually, let's just make it always fail first so we can see the expected vs actual output in Judge0.
        
        code = "import sys\nprint('Wrong Answer')\n"
        
        payload = {
            "code": code,
            "language_id": 71, # Python 3
            "problem_id": p['problem_id'],
            "student_id": "student_a",
            "concept_tag": p['concept_tag'],
            "difficulty_level": p['difficulty_level'],
            "session_id": "temp-session-123",
            "time_on_task_seconds": 30,
            "hint_used": False,
            "attempt_count": 1
        }
        
        try:
            resp = httpx.post("http://localhost:8000/api/execute", json=payload, timeout=10.0)
            print(f"API Response Status: {resp.status_code}")
            print(f"Execution Result: {resp.json()}")
        except Exception as e:
            print(f"API call failed: {e}")

if __name__ == "__main__":
    test_system()
