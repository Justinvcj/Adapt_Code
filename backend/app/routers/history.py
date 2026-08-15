from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["history"])
supabase = get_supabase()

@router.get("/history")
async def get_history(page: int = 1, limit: int = 20, user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        limit = max(1, min(limit, 50))
        offset = (page - 1) * limit
        
        # Supabase API joins using select("..., problems(title)")
        res = supabase.table("session_events").select(
            "event_id, concept_tag, difficulty_level, final_verdict, timestamp, problems(title)"
        ).eq("student_id", user_id).order("timestamp", desc=True).range(offset, offset + limit - 1).execute()
        
        return {"status": "success", "data": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
