from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase_admin, get_supabase_user
from app.core.dependencies import get_current_user, CurrentUser

router = APIRouter(prefix="/api", tags=["history"])


@router.get("/history")
async def get_history(page: int = 1, limit: int = 20, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    user_id = user.user_id
    try:
        limit = max(1, min(limit, 50))
        offset = (page - 1) * limit
        
        # Supabase API joins using select("..., problems(title)")
        supabase = get_supabase_user(user.jwt)
        res = supabase.table("session_events").select(
            "event_id, concept_tag, difficulty_level, final_verdict, timestamp, problems(title)"
        ).eq("student_id", user_id).order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
        
        return {"status": "success", "data": res.data}
    except Exception as e:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="An internal error occurred.")
