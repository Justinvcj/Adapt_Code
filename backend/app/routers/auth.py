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
@limiter.limit("5/minute")
async def register(request: Request, req: RegisterRequest) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin()
        res = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        
        if res.user:
            user_id = res.user.id
            try:
                supabase.rpc("register_user", {
                    "p_email": req.email,
                    "p_display_name": req.display_name,
                    "p_auth_uid": user_id
                }).execute()
            except Exception as e:
                logger.error("operation failed", exc_info=True)
                # rollback
                try:
                    supabase.auth.admin.delete_user(user_id)
                except Exception as ex:
                    logger.error("operation failed", exc_info=True)
                
    except Exception as e:
        logger.error("operation failed", exc_info=True)
        pass
    
    return {"status": "success", "message": "If this email is available, we've sent a confirmation link."}

@router.post("/login")
@limiter.limit("5/minute", key_func=get_real_ip)
@limiter.limit("10/hour", key_func=lambda r: getattr(r.state, 'login_email', 'unknown'))
async def login(request: Request, req: LoginRequest, response: Response) -> Any:
    request.state.login_email = req.email.lower().strip()
    try:
        supabase = get_supabase_admin()
        res = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        if not res.session:
            raise GENERIC_LOGIN_ERROR
            
        user_id = res.user.id
        user_record = supabase.table("users").select("display_name, is_pro").eq("user_id", user_id).execute()
        display_name = user_record.data[0]["display_name"] if user_record.data else "User"
        is_pro = user_record.data[0].get("is_pro", False) if user_record.data else False
        
        supabase.table("audit_log").insert({"actor": user_id, "action": "login_success"}).execute()
        
        json_resp = JSONResponse({
            "status": "success",
            "user_id": user_id,
            "display_name": display_name,
            "is_pro": is_pro,
        })
        json_resp.set_cookie(
            key="adaptcode_session",
            value=res.session.access_token,
            max_age=60 * 60,
            httponly=True,
            secure=settings.ENV in {"production", "staging"},
            samesite="strict",
            path="/",
        )
        return json_resp

    except HTTPException:
        raise
    except Exception as e:
        hmac.compare_digest(secrets.token_bytes(32), secrets.token_bytes(32))
        try:
            get_supabase_admin().table("audit_log").insert({"action": "login_failure", "metadata": {"email": request.state.login_email}}).execute()
        except Exception:
            pass
        raise GENERIC_LOGIN_ERROR

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
    try:
        supabase = get_supabase_user(user.jwt)
        res = supabase.table("users").select("user_id, email, display_name, role, is_pro, created_at").eq("user_id", user.user_id).execute()
        if res.data:
            return {"status": "success", "user": res.data[0]}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail="An internal error occurred.")
