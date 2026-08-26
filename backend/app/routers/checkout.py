from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api/checkout", tags=["checkout"])
supabase = get_supabase()

@router.post("/mock-upgrade")
async def mock_upgrade(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Mock endpoint to instantly upgrade a user to Pro tier without Stripe.
    """
    try:
        res = supabase.table("users").update({"is_pro": True}).eq("user_id", user_id).execute()
        return {"status": "success", "message": "Successfully upgraded to AdaptCode Pro!"}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Failed to upgrade user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to process upgrade.")

@router.get("/status")
async def get_status(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Check if the user is a Pro subscriber.
    """
    try:
        res = supabase.table("users").select("is_pro").eq("user_id", user_id).execute()
        is_pro = False
        if res.data:
            is_pro = res.data[0].get("is_pro", False)
        return {"status": "success", "is_pro": is_pro}
    except Exception as e:
        return {"status": "error", "is_pro": False}
