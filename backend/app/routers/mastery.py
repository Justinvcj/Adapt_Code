from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase_admin, get_supabase_user
from app.core.dependencies import get_current_user, CurrentUser
from app.services.bkt import get_bkt_params
from app.services.prerequisites import can_access_concept, PREREQUISITE_GRAPH

router = APIRouter(prefix="/api", tags=["mastery"])

@router.get("/mastery")
async def get_mastery(user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    user_id = user.user_id
    try:
        supabase = get_supabase_user(user.jwt)
        mastery_res = supabase.table("mastery_scores").select("*").eq("student_id", user_id).execute()
        mastery_dict = {row['concept_tag']: float(row['mastery_probability']) for row in mastery_res.data}
        
        events_res = supabase.table("session_events").select("concept_tag, final_verdict").eq("student_id", user_id).execute()
        events = events_res.data
        
        concepts = ['basic_syntax', 'loops', 'arrays', 'strings', 'hashing', 'two_pointers', 
                    'sliding_window', 'recursion', 'backtracking', 'binary_search', 'trees', 'dynamic_programming']
        
        result = []
        for c in concepts:
            c_events = [e for e in events if e['concept_tag'] == c]
            attempted = len(c_events)
            solved = len([e for e in c_events if e['final_verdict'] == 'Accepted'])
            
            prereqs = PREREQUISITE_GRAPH.get(c, [])
            
            bkt_params = get_bkt_params(c)
            concept_L0 = bkt_params["L0"]
            
            result.append({
                "concept_tag": c,
                "mastery_probability": mastery_dict.get(c, concept_L0),
                "is_unlocked": can_access_concept(c, mastery_dict),
                "prerequisites": prereqs,
                "problems_attempted": attempted,
                "problems_solved": solved
            })
            
        return {"status": "success", "data": result}
    except Exception as e:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")

from pydantic import BaseModel

class OnboardingRequest(BaseModel):
    mastered_concepts: list[str]

@router.post("/onboarding/complete")
async def complete_onboarding(req: OnboardingRequest, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    user_id = user.user_id
    try:
        from app.services.prerequisites import MASTERY_THRESHOLD
        supabase = get_supabase_user(user.jwt)
        
        records = []
        for c in req.mastered_concepts:
            records.append({
                "student_id": user_id,
                "concept_tag": c,
                "mastery_probability": MASTERY_THRESHOLD
            })
            
        if records:
            # Need to specify on_conflict but supabase-py rest client handles it via upsert automatically 
            # if we just pass the records (assuming unique constraint on student_id, concept_tag)
            supabase.table("mastery_scores").upsert(records).execute()
            
        return {"status": "success", "message": "Onboarding completed successfully"}
    except Exception as e:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")
