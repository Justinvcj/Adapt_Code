import time
import random
import numpy as np
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Request
from app.core.database import get_supabase
from app.core.dependencies import get_current_user, bkt_doctor, linucb_agent
from app.services.prerequisites import can_access_concept
from app.core.rate_limit import limiter

router = APIRouter(prefix="/api", tags=["problems"])
supabase = get_supabase()

@router.get("/problem/next")
@limiter.limit("30/minute")
async def get_next_problem(request: Request, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        res = supabase.table("problems").select(
            "problem_id, title, description, concept_tag, difficulty_level, test_cases, hint_text"
        ).execute()
        all_problems = res.data
        if not all_problems:
            raise HTTPException(status_code=404, detail="No problems found.")
            
        mastery_res = supabase.table("mastery_scores").select("*").eq("student_id", user_id).execute()
        mastery_dict = {row['concept_tag']: float(row['mastery_probability']) for row in mastery_res.data}
        
        valid_problems = [p for p in all_problems if can_access_concept(p['concept_tag'], mastery_dict)]
        if not valid_problems:
            valid_problems = all_problems
            
        context_vector = np.zeros(16)
        concepts = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 
                    'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming']
        
        for i, c in enumerate(concepts):
            context_vector[i] = mastery_dict.get(c, bkt_doctor.p_prior)
            
        diff_map = {'easy': 0, 'medium': 1, 'hard': 2}
        valid_mask = [False, False, False]
        for p in valid_problems:
            valid_mask[diff_map[p['difficulty_level']]] = True
            
        # Dynamic features from session_events
        events_res = supabase.table("session_events").select("*").eq("student_id", user_id).order("timestamp", desc=True).limit(20).execute()
        events = events_res.data or []
        
        avg_time = np.mean([e['time_on_task_seconds'] for e in events]) if events else 0.5 * 1800
        hrate = np.mean([1.0 if e['hint_used'] else 0.0 for e in events]) if events else 0.2
        srate = np.mean([1.0 if e['final_verdict'] == 'Accepted' else 0.0 for e in events]) if events else 0.9
        avg_attempts = np.mean([e['attempt_count'] for e in events]) if events else 1.0
        
        session_duration_feat = min(1.0, avg_time / 1800.0)
        hint_rate_feat = hrate
        error_rate_feat = 1.0 - srate
        idle_time_feat = min(1.0, avg_attempts / 10.0)
            
        best_diff_idx = linucb_agent.select_action(
            student_id=user_id, 
            context_vector=context_vector, 
            valid_actions_mask=valid_mask,
            session_duration=session_duration_feat,
            hint_rate=hint_rate_feat,
            error_rate=error_rate_feat,
            idle_time=idle_time_feat
        )
        reverse_map = {0: 'easy', 1: 'medium', 2: 'hard'}
        target_diff = reverse_map.get(best_diff_idx, 'easy')
        
        target_problems = [p for p in valid_problems if p['difficulty_level'] == target_diff]
        if not target_problems:
            target_problems = valid_problems
            
        selected_problem = random.choice(target_problems)
        
        supabase.table("active_problem_state").upsert({
            "student_id": user_id,
            "problem_id": selected_problem['problem_id'],
            "start_time": time.time(),
            "hint_used": False
        }).execute()
        
        visible_cases = selected_problem.get("test_cases", [])[:2]
        visible_examples = [{"input": tc.get("input", "")} for tc in visible_cases]
        
        problem_response = {k: v for k, v in selected_problem.items() if k not in ("solution_code", "solution_explanation", "test_cases")}
        problem_response["examples"] = visible_examples
        
        return {
            "status": "success",
            "problem": problem_response,
            "routing_info": {
                "target_difficulty": target_diff,
                "context_features": context_vector.tolist()
            }
        }
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Failed to fetch next problem for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

@router.post("/hint/{problem_id}")
@limiter.limit("20/minute")
async def get_hint(request: Request, problem_id: str, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        res = supabase.table("problems").select("hint_text").eq("problem_id", problem_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        # Track hint used in db
        supabase.table("active_problem_state").update({"hint_used": True}).eq("student_id", user_id).eq("problem_id", problem_id).execute()
        return {"status": "success", "hint_text": res.data[0]["hint_text"]}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Failed to fetch hint for problem {problem_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

@router.get("/problems")
async def get_all_problems(concept_tag: str = None, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        query = supabase.table("problems").select("*")
        if concept_tag:
            query = query.eq("concept_tag", concept_tag)
        res = query.execute()
        
        all_problems = res.data or []
        
        # Determine solved status from session_events
        events_res = supabase.table("session_events").select("problem_id, final_verdict").eq("student_id", user_id).eq("final_verdict", "Accepted").execute()
        solved_problem_ids = {event["problem_id"] for event in (events_res.data or [])}
        
        for p in all_problems:
            p["is_solved"] = p["problem_id"] in solved_problem_ids
            # Exclude full test_cases to keep payload small, just send basic info
            if "test_cases" in p:
                del p["test_cases"]
                
        return {"status": "success", "data": all_problems}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Failed to fetch all problems: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
