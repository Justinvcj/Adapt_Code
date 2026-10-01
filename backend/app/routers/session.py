from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase_admin, get_supabase_user
from app.core.dependencies import get_current_user, CurrentUser
from app.models.schemas import SessionStart, SessionEnd

router = APIRouter(prefix="/api/session", tags=["session"])


@router.post("/start")
async def start_session(req: Optional[SessionStart] = None, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    user_id = user.user_id
    try:
        session_num = req.session_number if req else 1
        supabase = get_supabase_user(user.jwt)
        res = supabase.table("sessions").insert({
            "student_id": user_id,
            "session_number": session_num
        }).execute()
        if res.data:
            return {"status": "success", "session_id": res.data[0]["session_id"]}
        raise HTTPException(status_code=500, detail="Failed to create session.")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error when creating session.")

@router.post("/end")
async def end_session(req: SessionEnd, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    user_id = user.user_id
    try:
        supabase = get_supabase_user(user.jwt)
        supabase.table("sessions").update({
            "ended_at": "now()"
        }).eq("session_id", req.session_id).eq("student_id", user_id).execute()
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database error when ending session.")
