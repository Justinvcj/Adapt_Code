import hashlib
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["potd"])


@router.get("/problem/potd")
async def get_potd(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        supabase = get_supabase()
        res = supabase.table("problems").select(
            "problem_id, title, description, concept_tag, difficulty_level, hint_text"
        ).execute()
        
        all_problems = res.data or []
        if not all_problems:
            raise HTTPException(status_code=404, detail="No problems found.")
            
        # Deterministically select POTD based on current date
        today_str = datetime.utcnow().date().isoformat()
        hash_val = int(hashlib.md5(today_str.encode()).hexdigest(), 16)
        
        potd_idx = hash_val % len(all_problems)
        potd = all_problems[potd_idx]
        
        # Determine if current user solved it
        solved_res = supabase.table("session_events").select("event_id").eq("student_id", user_id).eq("problem_id", potd["problem_id"]).eq("final_verdict", "Accepted").execute()
        potd["is_solved"] = len(solved_res.data) > 0 if solved_res.data else False
        
        return {"status": "success", "data": potd}
        
    except Exception as e:
        from app.core.config import logger
        logger.error(f"POTD fetch failed: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
