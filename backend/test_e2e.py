import requests
import json
import time

BASE_URL = "http://localhost:8000"

def run_tests():
    print("--- Starting End-to-End Tests ---")
    
    # 1. Register a new user
    email = f"test_user_{int(time.time())}@gmail.com"
    print(f"Registering {email}...")
    res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "email": email,
        "password": "password123",
        "display_name": "Test User"
    })
    
    assert res.status_code == 200, f"Registration failed: {res.text}"
    token = res.json().get("access_token")
    assert token, "No access token received"
    print("✅ Registration successful")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Start a session
    res = requests.post(f"{BASE_URL}/api/session/start", headers=headers)
    assert res.status_code == 200, f"Session start failed: {res.text}"
    session_id = res.json().get("session_id")
    assert session_id, "No session ID received"
    print("✅ Session started")
    
    # 3. Get next problem
    res = requests.get(f"{BASE_URL}/api/problem/next", headers=headers)
    assert res.status_code == 200, f"Get problem failed: {res.text}"
    problem = res.json().get("problem")
    assert problem, "No problem received"
    print(f"✅ Received problem: {problem['title']}")
    
    # 4. Execute code (Dummy Python code for FizzBuzz or whatever it is)
    # We don't know the exact problem, so we'll just send a dummy script
    # It might fail the test cases, but it should execute.
    print("Executing code...")
    res = requests.post(f"{BASE_URL}/api/execute", headers=headers, json={
        "code": "print('Hello World')",
        "language_id": 71,
        "problem_id": problem["problem_id"],
        "concept_tag": problem["concept_tag"],
        "difficulty_level": problem["difficulty_level"],
        "session_id": session_id,
        "time_on_task_seconds": 10,
        "hint_used": False,
        "attempt_count": 1
    })
    assert res.status_code == 200, f"Execution failed: {res.text}"
    print(f"✅ Execution returned verdict: {res.json().get('verdict')}")
    
    # 5. Check Mastery Dashboard
    res = requests.get(f"{BASE_URL}/api/mastery", headers=headers)
    assert res.status_code == 200, f"Mastery failed: {res.text}"
    print("✅ Mastery dashboard loaded")
    
    # 6. Check History
    res = requests.get(f"{BASE_URL}/api/history", headers=headers)
    assert res.status_code == 200, f"History failed: {res.text}"
    print("✅ History loaded")
    
    # 7. Check Stats
    res = requests.get(f"{BASE_URL}/api/stats", headers=headers)
    assert res.status_code == 200, f"Stats failed: {res.text}"
    print("✅ Stats loaded")
    
    print("--- All End-to-End Tests Passed! ---")

if __name__ == "__main__":
    run_tests()
