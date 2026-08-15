from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])
supabase = get_supabase()

@router.get("/users")
async def get_all_users(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    # Check if the user is an admin
    user_res = supabase.table("users").select("role").eq("user_id", user_id).execute()
    if not user_res.data or user_res.data[0].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Admin access required.")
        
    try:
        users = supabase.table("users").select("user_id, email, display_name, created_at, role").execute()
        return {"status": "success", "data": users.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_platform_stats(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    # Check if the user is an admin
    user_res = supabase.table("users").select("role").eq("user_id", user_id).execute()
    if not user_res.data or user_res.data[0].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Admin access required.")
        
    try:
        users = supabase.table("users").select("user_id", count="exact").execute()
        sessions = supabase.table("sessions").select("session_id", count="exact").execute()
        events = supabase.table("session_events").select("event_id", count="exact").execute()
        
        return {
            "status": "success", 
            "data": {
                "total_users": users.count if hasattr(users, "count") else len(users.data or []),
                "total_sessions": sessions.count if hasattr(sessions, "count") else len(sessions.data or []),
                "total_submissions": events.count if hasattr(events, "count") else len(events.data or [])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
