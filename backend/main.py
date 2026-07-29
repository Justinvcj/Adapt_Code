import os
import json
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from supabase import create_client, Client
from dotenv import load_dotenv

# Import our custom modules
from ai_tutor import generate_explanation
from bkt import BKTDoctor
from linucb import LinUCBAgent
from prerequisites import can_access_concept

load_dotenv()

# Initialize Supabase
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Initialize Judge0 URL
JUDGE0_URL = "http://localhost:2358"

app = FastAPI(title="AdaptCode API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeSubmission(BaseModel):
    code: str
    language_id: int # Judge0 language ID (e.g., 62 for Java, 71 for Python)
    problem_id: str
    student_id: str
    concept_tag: str
    difficulty_level: str
    session_id: str
    
    # Observer signals passed from frontend
    time_on_task_seconds: int
    hint_used: bool
    attempt_count: int

# Initialize AI modules
bkt_doctor = BKTDoctor()
linucb_agent = LinUCBAgent(n_actions=5, context_dim=16)

@app.get("/")
def read_root():
    return {"status": "AdaptCode Backend is running"}

@app.post("/api/execute")
async def execute_code(submission: CodeSubmission):
    """
    Component 2 (Sandbox) + Component 4 (Observer) + Component 5 (Doctor) + Component 7 (Tutor)
    """
    
    # 1. Send to Judge0 (Component 2)
    async with httpx.AsyncClient() as client:
        try:
            # We assume a mock problem payload for now (in reality, fetch test cases from DB)
            req_data = {
                "source_code": submission.code,
                "language_id": submission.language_id,
                # Example standard input/expected output. You would loop through test cases here.
                "expected_output": "0 1\n" # Mock for two sum
            }
            
            res = await client.post(f"{JUDGE0_URL}/submissions?base64_encoded=false&wait=true", json=req_data)
            result = res.json()
            
            status_id = result.get('status', {}).get('id', 0)
            status_desc = result.get('status', {}).get('description', 'Unknown')
            
            is_correct = (status_id == 3) # 3 = Accepted in Judge0
            compile_errors = 1 if status_id == 6 else 0 # 6 = Compilation Error
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")

    # 2. Record Event (Component 4)
    try:
        supabase.table("session_events").insert({
            "session_id": submission.session_id,
            "student_id": submission.student_id,
            "problem_id": submission.problem_id,
            "concept_tag": submission.concept_tag,
            "difficulty_level": submission.difficulty_level,
            "compile_errors": compile_errors,
            "time_on_task_seconds": submission.time_on_task_seconds,
            "hint_used": submission.hint_used,
            "attempt_count": submission.attempt_count,
            "final_verdict": status_desc
        }).execute()
    except Exception as e:
        print("Supabase logging failed, but proceeding...", e)

    # 3. Diagnose Mastery (Component 5)
    try:
        # Get current mastery
        mastery_record = supabase.table("mastery_scores").select("*").eq("student_id", submission.student_id).eq("concept_tag", submission.concept_tag).execute()
        current_mastery = float(mastery_record.data[0]['mastery_probability']) if mastery_record.data else bkt_doctor.p_prior
        
        # Calculate new mastery
        effective_corr = bkt_doctor.calculate_effective_correctness(
            is_correct, compile_errors, submission.time_on_task_seconds, 
            submission.hint_used, submission.attempt_count
        )
        new_mastery = bkt_doctor.update_mastery(current_mastery, effective_corr)
        
        # Upsert mastery score
        supabase.table("mastery_scores").upsert({
            "student_id": submission.student_id,
            "concept_tag": submission.concept_tag,
            "mastery_probability": new_mastery
        }).execute()
    except Exception as e:
        print("BKT Update failed:", e)

    # 4. Generate AI Explanation if Failed (Component 7)
    explanation = None
    if not is_correct:
        problem_desc = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target." # Mocked
        error_verdict = result.get('compile_output', result.get('stderr', status_desc))
        
        explanation = generate_explanation(
            code=submission.code,
            problem_description=problem_desc,
            error_verdict=error_verdict
        )

    return {
        "status": "success",
        "verdict": status_desc,
        "is_correct": is_correct,
        "execution_time_ms": float(result.get('time', 0)) * 1000 if result.get('time') else 0,
        "memory_used_kb": result.get('memory', 0),
        "explanation": explanation
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
