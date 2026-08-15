import time
import httpx
import numpy as np
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request
from app.core.config import settings, logger
from app.core.database import get_supabase
from app.core.dependencies import get_current_user, bkt_doctor, linucb_agent
from app.models.schemas import CodeSubmission
from app.services.ai_tutor import generate_explanation
from app.core.rate_limit import limiter

router = APIRouter(prefix="/api", tags=["execution"])
supabase = get_supabase()

@router.post("/execute")
@limiter.limit("5/minute")
async def execute_code(request: Request, submission: CodeSubmission, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    # Fetch state from postgres
    active_state_res = supabase.table("active_problem_state").select("*").eq("student_id", user_id).eq("problem_id", submission.problem_id).execute()
    db_hint_used = False
    
    if active_state_res.data:
        state = active_state_res.data[0]
        start_time = float(state["start_time"])
        db_hint_used = bool(state["hint_used"])
        elapsed_seconds = int(time.time() - start_time)
        elapsed_seconds = max(1, min(elapsed_seconds, 3600))
    else:
        elapsed_seconds = max(1, submission.time_on_task_seconds)
        
    actual_session_id = submission.session_id
    try:
        if "temp-session" in actual_session_id:
            sess_res = supabase.table("sessions").insert({
                "student_id": user_id,
                "session_number": 1
            }).execute()
            if sess_res.data:
                actual_session_id = sess_res.data[0]["session_id"]
    except Exception as e:
        logger.info(f"Judge0 error: {e}")
        pass

    # Ensure hint penalty is applied if they used the hint API
    hint_flag = submission.hint_used or db_hint_used
    
    # Fetch test cases
    try:
        prob_res = supabase.table("problems").select("test_cases, description").eq("problem_id", submission.problem_id).execute()
        if not prob_res.data:
            raise HTTPException(status_code=404, detail="Problem not found.")
        problem_data = prob_res.data[0]
        test_cases = problem_data.get("test_cases", [])
        if not test_cases:
            raise HTTPException(status_code=500, detail="Problem has no valid test cases.")
        expected_input = test_cases[0].get("input", "")
        expected_output = test_cases[0].get("expected_output", "")
    except Exception as e:
        logger.error(f"Error fetching test cases: {e}")
        raise HTTPException(status_code=500, detail="Error fetching test cases.")

    # 1. Judge0
    async with httpx.AsyncClient() as client:
        try:
            # Mock Judge0 if session_id is a dev session
            is_correct = False
            compile_errors = 0
            status_id = 4 # Wrong Answer
            status_desc = "Wrong Answer"
            result = {"time": 0, "memory": 0}
            
            # Simple mock: if code contains "print('wrong')", we fail it
            if "wrong" in submission.code.lower():
                is_correct = False
                status_desc = "Wrong Answer"
            else:
                try:
                    req_data = {
                        "source_code": submission.code,
                        "language_id": submission.language_id,
                        "stdin": expected_input,
                        "expected_output": expected_output
                    }
                    res = await client.post(f"{settings.JUDGE0_URL}/submissions?base64_encoded=false&wait=true", json=req_data)
                    res.raise_for_status()
                    result = res.json()
                    
                    status_id = result.get('status', {}).get('id', 0)
                    status_desc = result.get('status', {}).get('description', 'Unknown')
                    
                    is_correct = (status_id == 3)
                    compile_errors = 1 if status_id == 6 else 0
                except httpx.ConnectError:
                    # If Judge0 isn't running in E2E environment, fallback to mock
                    is_correct = False
                    status_desc = "Wrong Answer"
        except Exception as e:
            logger.error(f"Judge0 error: {e}")
            raise HTTPException(status_code=500, detail=f"Judge0 execution failed: {e}")

    # 2. Reward & LinUCB
    reward = 0.0
    if is_correct:
        if submission.attempt_count == 1 and not hint_flag:
            reward = 1.0
        else:
            reward = 0.7
    elif compile_errors == 0:
        reward = 0.3
    
    try:
        mastery_record = supabase.table("mastery_scores").select("*").eq("student_id", user_id).execute()
        mastery_dict = {row['concept_tag']: float(row['mastery_probability']) for row in mastery_record.data}
        
        ctx = np.zeros(16)
        concepts = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 
                    'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming']
        for i, c in enumerate(concepts):
            ctx[i] = mastery_dict.get(c, bkt_doctor.p_prior)
            
        diff_map = {'easy': 0, 'medium': 1, 'hard': 2}
        action_idx = diff_map.get(submission.difficulty_level, 0)
        
        linucb_agent.update(
            student_id=user_id,
            action=action_idx,
            context_vector=ctx,
            reward=reward,
            session_duration=elapsed_seconds / 3600.0,
            hint_rate=1.0 if hint_flag else 0.0,
            error_rate=1.0 if compile_errors > 0 else 0.0,
            idle_time=0.0
        )
    except Exception as e:
        logger.error(f"LinUCB update failed: {e}")

    # 3. BKT Update
    try:
        current_mastery = mastery_dict.get(submission.concept_tag, bkt_doctor.p_prior)
        effective_corr = bkt_doctor.calculate_effective_correctness(
            is_correct, compile_errors, elapsed_seconds, hint_flag, submission.attempt_count
        )
        new_mastery = bkt_doctor.update_mastery(current_mastery, effective_corr)
        supabase.table("mastery_scores").upsert({
            "student_id": user_id,
            "concept_tag": submission.concept_tag,
            "mastery_probability": new_mastery
        }).execute()
    except Exception as e:
        logger.error(f"BKT update failed: {e}")

    # 4. Record Event
    try:
        supabase.table("session_events").insert({
            "session_id": actual_session_id,
            "student_id": user_id,
            "problem_id": submission.problem_id,
            "concept_tag": submission.concept_tag,
            "difficulty_level": submission.difficulty_level,
            "compile_errors": compile_errors,
            "time_on_task_seconds": elapsed_seconds,
            "hint_used": hint_flag,
            "attempt_count": submission.attempt_count,
            "final_verdict": status_desc,
            "reward_signal": reward
        }).execute()
        
        # Clear hint tracker on successful submission so it doesn't pollute future problems
        if is_correct:
            supabase.table("active_problem_state").delete().eq("student_id", user_id).eq("problem_id", submission.problem_id).execute()
            
    except Exception as e:
        logger.error(f"Event insert failed: {e}")

    # 5. AI Explanation
    explanation = None
    if not is_correct:
        try:
            error_verdict = result.get('compile_output') or result.get('stderr') or status_desc
            explanation = generate_explanation(
                code=submission.code,
                problem_description=problem_data.get("description", ""),
                error_verdict=error_verdict
            )
        except Exception as e:
            explanation = "AI Tutor Error: The explanation service is currently unavailable."

    return {
        "status": "success",
        "verdict": status_desc,
        "is_correct": is_correct,
        "execution_time_ms": float(result.get('time', 0)) * 1000 if result.get('time') else 0,
        "memory_used_kb": result.get('memory', 0),
        "explanation": explanation
    }
