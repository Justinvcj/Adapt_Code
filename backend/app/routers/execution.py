import time
import httpx
import numpy as np
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request
from app.core.config import settings, logger
from app.core.database import get_supabase
from app.core.dependencies import get_current_user, bkt_doctor, linucb_agent
from app.models.schemas import CodeSubmission, CodeCustomSubmission
from app.services.ai_tutor import generate_explanation, analyze_complexity
from app.core.rate_limit import limiter

router = APIRouter(prefix="/api", tags=["execution"])
supabase = get_supabase()

@router.post("/execute_custom")
@limiter.limit("10/minute")
async def execute_custom(request: Request, submission: CodeCustomSubmission, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    async with httpx.AsyncClient() as client:
        try:
            req_data = {
                "source_code": submission.code,
                "language_id": submission.language_id,
                "stdin": submission.custom_input,
                "expected_output": ""
            }
            res = await client.post(f"{settings.JUDGE0_URL}/submissions?base64_encoded=false&wait=true", json=req_data)
            res.raise_for_status()
            result = res.json()
            
            status_id = result.get('status', {}).get('id', 0)
            status_desc = result.get('status', {}).get('description', 'Unknown')
            
            # For custom execution, anything that compiles and runs is "successful" execution
            # but we just return the output.
            output = result.get('stdout') or result.get('compile_output') or result.get('stderr') or status_desc
            
            return {
                "status": "success",
                "verdict": output,
                "is_correct": status_id == 3,
                "execution_time_ms": float(result.get('time', 0)) * 1000 if result.get('time') else 0,
                "memory_used_kb": result.get('memory', 0),
                "explanation": None
            }
        except httpx.ConnectError:
            return {
                "status": "error",
                "verdict": "Execution Service Down",
                "is_correct": False,
                "execution_time_ms": 0,
                "memory_used_kb": 0,
                "explanation": "Judge0 execution engine is currently unreachable."
            }
        except Exception as e:
            logger.error(f"Judge0 error: {e}")
            raise HTTPException(status_code=500, detail=f"Judge0 execution failed: {e}")

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
        else:
            session_check = supabase.table("sessions").select("session_id").eq("session_id", actual_session_id).eq("student_id", user_id).execute()
            if not session_check.data:
                raise HTTPException(status_code=403, detail="Session does not belong to this user.")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Session validation error: {e}")

    # Ensure hint penalty is applied if they used the hint API
    hint_flag = submission.hint_used or db_hint_used
    
    # Fetch test cases
    try:
        prob_res = supabase.table("problems").select("test_cases, description").eq("problem_id", submission.problem_id).execute()
        if not prob_res.data:
            raise HTTPException(status_code=404, detail="Problem not found.")
        problem_data = prob_res.data[0]
        test_cases = problem_data.get("test_cases", [])
    except Exception as e:
        logger.error(f"Failed to fetch problem: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch problem data.")
        
    if not isinstance(test_cases, list) or len(test_cases) == 0:
        raise HTTPException(status_code=422, detail="This problem has no valid test cases.")

    # 1. Execution for ALL test cases
    judge0_down = False
    failed_input = ""
    failed_expected = ""
    is_correct = False
    compile_errors = 0
    status_desc = "No test cases"
    result = {}
    
    from app.core.executor import run_code_locally
    
    try:
        for i, tc in enumerate(test_cases):
            expected_in = tc.get("input", "")
            expected_out = tc.get("expected_output", "")
            
            stdout, stderr, retcode = run_code_locally(submission.code, submission.language_id, expected_in)
            
            compile_errors = 1 if retcode != 0 else 0
            
            if retcode == 124:
                status_desc = "Time Limit Exceeded"
                is_correct = False
            elif retcode != 0 or stderr.strip():
                status_desc = "Runtime Error / Compilation Error"
                is_correct = False
            else:
                if stdout.strip() == expected_out.strip():
                    is_correct = True
                    status_desc = "Accepted"
                else:
                    is_correct = False
                    status_desc = "Wrong Answer"
            
            if not is_correct:
                status_desc = f"Failed on Test Case {i+1}: {status_desc}"
                failed_input = expected_in
                failed_expected = expected_out
                result = {"stdout": stdout, "stderr": stderr, "compile_output": stderr}
                break
        else:
            compile_errors = 0
            result = {"stdout": stdout, "stderr": stderr, "time": 0.05, "memory": 1024}
                
    except Exception as e:
        compile_errors = 1
        judge0_down = True
        logger.error(f"Execution error: {e}")

    if judge0_down:
        return {
            "status": "error",
            "verdict": "Execution Service Down",
            "is_correct": False,
            "execution_time_ms": 0,
            "memory_used_kb": 0,
            "explanation": "Judge0 execution engine is currently unreachable."
        }

    # 2. Reward & LinUCB (Zone of Proximal Development)
    reward = 0.0
    if is_correct:
        if elapsed_seconds < 60 and submission.attempt_count == 1 and not hint_flag:
            reward = 0.2  # Trivial, no real learning
        elif elapsed_seconds > 1200 or submission.attempt_count > 10:
            reward = 0.4  # Exhausting, borderline frustration
        else:
            # Optimal struggle (ZPD)
            reward = 1.0
            if hint_flag:
                reward -= 0.2
            if submission.attempt_count > 3:
                reward -= 0.1 * (submission.attempt_count - 3)
            reward = max(0.5, reward)
    else:
        if elapsed_seconds > 900 or submission.attempt_count > 5:
            reward = -0.5  # Frustration zone
        elif compile_errors == 0:
            reward = 0.1   # Still trying, logical error
        else:
            reward = 0.0   # Syntax errors
    
    mastery_dict = {}
    try:
        mastery_record = supabase.table("mastery_scores").select("*").eq("student_id", user_id).execute()
        mastery_dict = {row['concept_tag']: float(row['mastery_probability']) for row in mastery_record.data}
        
        ctx = np.zeros(16)
        concepts = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 
                    'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming']
        for i, c in enumerate(concepts):
            ctx[i] = mastery_dict.get(c, bkt_doctor.p_prior)
            
        # Dynamic features from session_events
        events_res = supabase.table("session_events").select("*").eq("student_id", user_id).order("timestamp", desc=True).limit(20).execute()
        events = events_res.data or []
        
        avg_time = np.mean([e['time_on_task_seconds'] for e in events]) if events else elapsed_seconds
        hrate = np.mean([1.0 if e['hint_used'] else 0.0 for e in events]) if events else (1.0 if hint_flag else 0.0)
        srate = np.mean([1.0 if e['final_verdict'] == 'Accepted' else 0.0 for e in events]) if events else (1.0 if is_correct else 0.0)
        avg_attempts = np.mean([e['attempt_count'] for e in events]) if events else submission.attempt_count
        
        ctx[12] = min(1.0, avg_time / 1800.0)
        ctx[13] = hrate
        ctx[14] = srate
        ctx[15] = min(1.0, avg_attempts / 10.0)
            
        diff_map = {'easy': 0, 'medium': 1, 'hard': 2}
        action_idx = diff_map.get(submission.difficulty_level, 0)
        
        linucb_agent.update(
            student_id=user_id,
            action=action_idx,
            context_vector=ctx,
            reward=reward,
            session_duration=ctx[12],
            hint_rate=ctx[13],
            error_rate=1.0 - ctx[14],
            idle_time=ctx[15]
        )
    except Exception as e:
        logger.warning(f"LinUCB update failed: {e}")
        try:
            supabase.table("system_failures").insert({"stage": "linucb_update", "context": {"user_id": user_id, "problem_id": submission.problem_id, "error": str(e)}}).execute()
        except:
            pass

    # 3. BKT Update
    try:
        if not mastery_dict:
            mastery_record = supabase.table("mastery_scores").select("*").eq("student_id", user_id).execute()
            mastery_dict = {row['concept_tag']: float(row['mastery_probability']) for row in mastery_record.data}
        current_mastery = mastery_dict.get(submission.concept_tag, bkt_doctor.p_prior)
        effective_corr = bkt_doctor.calculate_effective_correctness(
            is_correct, compile_errors, elapsed_seconds, hint_flag, submission.attempt_count
        )
        new_mastery = bkt_doctor.update_mastery(current_mastery, effective_corr, submission.concept_tag)
        supabase.table("mastery_scores").upsert({
            "student_id": user_id,
            "concept_tag": submission.concept_tag,
            "mastery_probability": new_mastery
        }).execute()
    except Exception as e:
        logger.warning(f"BKT update failed: {e}")
        try:
            supabase.table("system_failures").insert({"stage": "bkt_update", "context": {"user_id": user_id, "problem_id": submission.problem_id, "error": str(e)}}).execute()
        except:
            pass

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
        logger.warning(f"Event insert failed: {e}")
        try:
            supabase.table("system_failures").insert({"stage": "session_events_insert", "context": {"user_id": user_id, "problem_id": submission.problem_id, "error": str(e)}}).execute()
        except:
            pass

    # 5. AI Explanation
    explanation = None
    if not is_correct:
        try:
            error_verdict = result.get('compile_output') or result.get('stderr') or status_desc
            actual_out = result.get('stdout') or ""
            explanation = generate_explanation(
                code=submission.code,
                problem_description=problem_data.get("description", ""),
                error_verdict=error_verdict,
                expected_output=failed_expected,
                actual_output=actual_out,
                input_case=failed_input
            )
        except Exception as e:
            explanation = "AI Tutor Error: The explanation service is currently unavailable."
    else:
        try:
            explanation = analyze_complexity(submission.code)
        except Exception as e:
            explanation = "Complexity analysis unavailable."

    return {
        "status": "success",
        "verdict": status_desc,
        "is_correct": is_correct,
        "execution_time_ms": float(result.get('time', 0)) * 1000 if result.get('time') else 0,
        "memory_used_kb": result.get('memory', 0),
        "explanation": explanation
    }
