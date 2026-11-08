from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.config import settings
from app.core.database import get_supabase_admin, get_supabase_user
from app.core.dependencies import get_current_user, CurrentUser

router = APIRouter(prefix="/api/checkout", tags=["checkout"])


@router.post("/mock-upgrade")
async def mock_upgrade(user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    """Dev-only shortcut that marks the signed-in user as Pro without Stripe.

    Previously gated on require_admin, which was wrong twice over — self-
    upgrade is a per-user action, and in production we don't want any
    endpoint that flips is_pro without a payment. Now refuses outside
    development and uses the user's own JWT so the write still goes
    through RLS.
    """
    if settings.ENV in {"production", "staging"}:
        raise HTTPException(status_code=404, detail="Not found.")
    user_id = user.user_id
    try:
        supabase = get_supabase_user(user.jwt)
        supabase.table("users").update({"is_pro": True}).eq("user_id", user_id).execute()
        return {"status": "success", "message": "Upgraded to AdaptCode Pro (dev)."}
    except Exception:
        from app.core.logging import logger
        logger.error("operation failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process upgrade.")

@router.get("/status")
async def get_status(user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    user_id = user.user_id
    """
    Check if the user is a Pro subscriber.
    """
    try:
        supabase = get_supabase_user(user.jwt)
        res = supabase.table("users").select("is_pro").eq("user_id", user_id).execute()
        is_pro = False
        if res.data:
            is_pro = res.data[0].get("is_pro", False)
        return {"status": "success", "is_pro": is_pro}
    except Exception as e:
        return {"status": "error", "is_pro": False}
