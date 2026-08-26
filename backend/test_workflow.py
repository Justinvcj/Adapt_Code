import asyncio
import httpx
import os
import uuid
import uuid as uuid_pkg
import json

from dotenv import load_dotenv

load_dotenv()

BASE_URL = "http://localhost:8000/api"
test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
test_password = "testpassword123"
test_display_name = "Test User"
session_id = None
problem_id = None
concept_tag = None
difficulty_level = None

async def run_tests():
    print(f"--- Starting Integration Tests ---")
    
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as client:
        # 1. Register
        print("1. Testing Registration...")
        res = await client.post("/auth/register", json={
            "email": test_email,
            "password": test_password,
            "display_name": test_display_name
        })
        assert res.status_code == 200, f"Registration failed: {res.text}"
        data = res.json()
        assert "access_token" in data
        assert "user_id" in data
        token = data["access_token"]
        
        headers = {"Authorization": f"Bearer {token}"}
        
        # 2. Login
        print("2. Testing Login...")
        res = await client.post("/auth/login", json={
            "email": test_email,
            "password": test_password
        })
        assert res.status_code == 200, f"Login failed: {res.text}"
        assert res.json()["access_token"]
        
        # 3. Session Start
        print("3. Testing Session Start...")
        res = await client.post("/session/start", headers=headers)
        assert res.status_code == 200, f"Session start failed: {res.text}"
        session_id = res.json()["session_id"]
        assert session_id
        
        # 4. Get Problem
        print("4. Testing Next Problem (LinUCB Action)...")
        res = await client.get("/problem/next", headers=headers)
        assert res.status_code == 200, f"Get problem failed: {res.text}"
        problem = res.json()["problem"]
        problem_id = problem["problem_id"]
        concept_tag = problem["concept_tag"]
        difficulty_level = problem["difficulty_level"]
        assert problem_id
        
        # 5. Execute Code (Mock fail)
        print("5. Testing Execute Code (Fail)...")
        res = await client.post("/execute", headers=headers, json={
            "code": "print('wrong')",
            "language_id": 71,
            "problem_id": problem_id,
            "concept_tag": concept_tag,
            "difficulty_level": difficulty_level,
            "session_id": session_id,
            "time_on_task_seconds": 30,
            "hint_used": False,
            "attempt_count": 1
        })
        assert res.status_code == 200, f"Execute failed: {res.text}"
        exec_data = res.json()
        print("Exec Data:", exec_data)
        assert exec_data["is_correct"] == False
        
        # 6. Execute Custom Code
        print("6. Testing Custom Code Execution...")
        res = await client.post("/execute_custom", headers=headers, json={
            "code": "print('hello')",
            "language_id": 71,
            "problem_id": problem_id,
            "custom_input": ""
        })
        assert res.status_code == 200, f"Custom Execute failed: {res.text}"
        
        # 7. Check Dashboard / Mastery
        print("7. Testing Dashboard Stats (BKT Update Check)...")
        res = await client.get("/stats", headers=headers)
        assert res.status_code == 200, f"Stats failed: {res.text}"
        stats = res.json()
        
        res = await client.get("/mastery", headers=headers)
        assert res.status_code == 200, f"Mastery failed: {res.text}"
        mastery = res.json()
        
        # 8. Phase 4 Gamification Endpoints
        print("8. Testing Gamification Endpoints...")
        res = await client.get("/stats/heatmap", headers=headers)
        assert res.status_code == 200, f"Heatmap failed: {res.text}"
        
        res = await client.get("/badges", headers=headers)
        assert res.status_code == 200, f"Badges failed: {res.text}"
        
        res = await client.get("/leaderboard", headers=headers)
        assert res.status_code == 200, f"Leaderboard failed: {res.text}"
        
        res = await client.get("/problem/potd", headers=headers)
        assert res.status_code == 200, f"POTD failed: {res.text}"

        print("All Tests Passed! 🎉")

if __name__ == "__main__":
    # Note: Backend must be running on port 8000 for these tests to work
    try:
        asyncio.run(run_tests())
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Test failed with error: {e}")
