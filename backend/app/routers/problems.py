import time
import random
import numpy as np
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user, bkt_doctor, linucb_agent
from app.services.prerequisites import can_access_concept

router = APIRouter(prefix="/api", tags=["problems"])
supabase = get_supabase()

@router.get("/problem/next")
async def get_next_problem(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        res = supabase.table("problems").select("*").execute()
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
        valid_mask = [False, False, False, False, False]
        for p in valid_problems:
            valid_mask[diff_map[p['difficulty_level']]] = True
            
        best_diff_idx = linucb_agent.select_action(
            student_id=user_id, 
            context_vector=context_vector, 
            valid_actions_mask=valid_mask,
            session_duration=0.5,
            hint_rate=0.2,
            error_rate=0.1,
            idle_time=0.0
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
        
        return {
            "status": "success",
            "problem": selected_problem,
            "routing_info": {
                "target_difficulty": target_diff,
                "context_features": context_vector.tolist()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hint/{problem_id}")
async def get_hint(problem_id: str, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        res = supabase.table("problems").select("hint_text").eq("problem_id", problem_id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Problem not found")
        
        # Track hint used in db
        supabase.table("active_problem_state").update({"hint_used": True}).eq("student_id", user_id).eq("problem_id", problem_id).execute()
        return {"status": "success", "hint_text": res.data[0]["hint_text"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        raise HTTPException(status_code=500, detail=str(e))
