import sys
import uuid
import time
import httpx

BASE_URL = "http://localhost:8000"

def run_test():
    print("Starting E2E Smoke Test...")
    unique_id = str(uuid.uuid4())[:8]
    email = f"testuser_{unique_id}@example.com"
    password = "password123"
    
    with httpx.Client(base_url=BASE_URL) as client:
        # 1. Register
        print(f"1. Registering user: {email}")
        res = client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "display_name": f"Test User {unique_id}",
            "role": "student"
        })
        
        if res.status_code != 200:
            if "rate limit" in res.text.lower():
                print(f"[WARN] Supabase email rate limit exceeded. Falling back to known test user.")
                email = "student_a@adaptcode.com"
                password = "password123"
            else:
                print("[FAIL] Registration failed:", res.text)
                sys.exit(1)
        else:
            print("[OK] Registered successfully")
        
        # 2. Login
        print(f"2. Logging in as {email}")
        res = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        if res.status_code != 200:
            # If the fallback user doesn't exist, we can't proceed
            if email == "test_user_1786408565@gmail.com" and "Invalid" in res.text:
                print("[FAIL] Fallback user does not exist or wrong password. Please register it manually or wait for rate limits to reset.")
            print("[FAIL] Login failed:", res.text)
            sys.exit(1)
        token = res.json()["access_token"]
        print("[OK] Logged in successfully")
        
        client.headers.update({"Authorization": f"Bearer {token}"})
        
        # 3. Start Session
        print("3. Starting practice session")
        res = client.post("/api/session/start")
        if res.status_code != 200:
            print("[FAIL] Session start failed:", res.text)
            sys.exit(1)
        session_id = res.json()["session_id"]
        print(f"[OK] Session started: {session_id}")
        
        # 4. Get Problem
        print("4. Fetching next problem")
        res = client.get("/api/problem/next")
        if res.status_code != 200:
            print("[FAIL] Fetch problem failed:", res.text)
            sys.exit(1)
        problem = res.json().get("problem")
        if not problem:
            print("[FAIL] No problem returned")
            sys.exit(1)
        print(f"[OK] Received problem: {problem['title']} (Tag: {problem['concept_tag']})")
        
        # 5. Execute Code (Incorrect)
        print("5. Executing incorrect code")
        res = client.post("/api/execute", json={
            "code": "print('wrong')",
            "language_id": 71, # Python
            "problem_id": problem["problem_id"],
            "concept_tag": problem["concept_tag"],
            "difficulty_level": problem["difficulty_level"],
            "session_id": session_id,
            "time_on_task_seconds": 10,
            "hint_used": False,
            "attempt_count": 1
        })
        if res.status_code != 200:
            print("[FAIL] Execution failed:", res.text)
            sys.exit(1)
        exec_res = res.json()
        print(f"[OK] Executed. Correct? {exec_res['is_correct']}. Verdict: {exec_res['verdict']}")
        
        # 6. Check Mastery
        print("6. Checking mastery dashboard")
        res = client.get("/api/mastery")
        if res.status_code != 200:
            print("[FAIL] Mastery fetch failed:", res.text)
            sys.exit(1)
        mastery = res.json()["data"]
        print(f"[OK] Mastery data fetched. Total concepts: {len(mastery)}")
        
        print("\n[SUCCESS] All E2E smoke tests passed successfully!")

if __name__ == "__main__":
    try:
        run_test()
    except Exception as e:
        print(f"[FAIL] Unhandled Exception: {e}")
        sys.exit(1)
