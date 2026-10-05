from fastapi import APIRouter, HTTPException, Depends, Header, Request, Response
from fastapi.responses import JSONResponse
from typing import Dict, Any
import uuid
import secrets
import hmac
from app.core.config import settings
from app.core.database import get_supabase_admin, get_supabase_user
from app.models.schemas import RegisterRequest, LoginRequest
from app.core.dependencies import get_current_user, CurrentUser
from app.core.rate_limit import limiter, get_real_ip
from app.core.logging import logger

router = APIRouter(prefix="/api/auth", tags=["auth"])

GENERIC_LOGIN_ERROR = HTTPException(status_code=401, detail="Invalid credentials.")

@router.post("/register")
@limiter.limit("10/minute")
async def register(request: Request, req: RegisterRequest) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin()
        res = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        
        if res.user:
            user_id = res.user.id
            # Try the register_user RPC; if it fails (missing RPC, schema drift, etc.)
            # fall back to a plain upsert on the users table so the account still gets a profile row.
            # Previously a failed RPC rolled back the auth user, which left register silently broken.
            rpc_ok = False
            try:
                supabase.rpc("register_user", {
                    "p_email": req.email,
                    "p_display_name": req.display_name,
                    "p_auth_uid": user_id
                }).execute()
                rpc_ok = True
            except Exception:
                logger.error("register_user RPC failed; falling back to users upsert", exc_info=True)
            if not rpc_ok:
                try:
                    # Supabase Auth owns the real password. Our legacy users table has a
                    # NOT NULL hashed_password column — insert a sentinel so the row writes.
                    supabase.table("users").upsert({
                        "user_id": user_id,
                        "email": req.email,
                        "display_name": req.display_name or "User",
                        "hashed_password": "supabase-auth-managed",
                        "role": "student",
                        "is_pro": False,
                    }, on_conflict="user_id").execute()
                except Exception:
                    logger.error("users upsert fallback also failed", exc_info=True)
                
    except Exception as e:
        logger.error("operation failed", exc_info=True)
        pass
    
    return {"status": "success", "message": "If this email is available, we've sent a confirmation link."}

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, req: LoginRequest, response: Response) -> Any:
    import traceback as _tb
    request.state.login_email = req.email.lower().strip()

    # 1) authenticate — this is the only part that MUST succeed
    try:
        supabase = get_supabase_admin()
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
    except Exception:
        logger.error("sign_in_with_password raised", exc_info=True)
        raise GENERIC_LOGIN_ERROR

    if not getattr(res, "session", None) or not getattr(res, "user", None):
        raise GENERIC_LOGIN_ERROR

    user_id = res.user.id
    access_token = res.session.access_token

    # 2) best-effort profile lookup — missing table/row must not break login
    display_name = "User"
    is_pro = False
    try:
        user_record = supabase.table("users").select("display_name, is_pro").eq("user_id", user_id).execute()
        if user_record.data:
            display_name = user_record.data[0].get("display_name") or "User"
            is_pro = bool(user_record.data[0].get("is_pro", False))
    except Exception:
        logger.error("users lookup failed", exc_info=True)

    # 3) best-effort audit — missing table must not break login
    try:
        supabase.table("audit_log").insert({"actor": user_id, "action": "login_success"}).execute()
    except Exception:
        logger.error("audit_log insert failed", exc_info=True)

    # 4) issue the session cookie
    json_resp = JSONResponse({
        "status": "success",
        "user_id": user_id,
        "display_name": display_name,
        "is_pro": is_pro,
    })
    json_resp.set_cookie(
        key="adaptcode_session",
        value=access_token,
        max_age=60 * 60,
        httponly=True,
        secure=settings.ENV in {"production", "staging"},
        samesite="lax",
        path="/",
    )
    return json_resp

@router.post("/logout")
async def logout(response: Response, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin()
        supabase.auth.sign_out(user.jwt)
        supabase.table("audit_log").insert({"actor": user.user_id, "action": "logout"}).execute()
    except Exception as e:
        pass
    resp = JSONResponse({"status": "success"})
    resp.delete_cookie(key="adaptcode_session", path="/")
    return resp

@router.get("/me")
async def get_me(user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    # If the users-table row exists we return it. If not (demo-mode registration
    # couldn't upsert because of schema drift), return a stub derived from the JWT
    # claims so the frontend still has a signed-in user to render against.
    try:
        supabase = get_supabase_admin()
        res = supabase.table("users").select("user_id, email, display_name, role, is_pro, created_at").eq("user_id", user.user_id).execute()
        if res.data:
            return {"status": "success", "user": res.data[0]}
    except Exception:
        logger.error("users table lookup failed in /me", exc_info=True)

    # Fallback — pull what we can from the Supabase auth user record.
    try:
        auth_user = get_supabase_admin().auth.admin.get_user_by_id(user.user_id)
        u = auth_user.user if auth_user else None
        return {"status": "success", "user": {
            "user_id": user.user_id,
            "email": (u and u.email) or None,
            "display_name": (u and u.user_metadata.get("display_name")) or "User",
            "role": "student",
            "is_pro": False,
            "created_at": (u and str(u.created_at)) or None,
        }}
    except Exception:
        logger.error("auth.admin.get_user_by_id failed in /me", exc_info=True)
        return {"status": "success", "user": {
            "user_id": user.user_id, "email": None, "display_name": "User",
            "role": "student", "is_pro": False, "created_at": None,
        }}
