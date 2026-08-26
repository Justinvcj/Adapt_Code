from fastapi import APIRouter, HTTPException, Depends, Header, Request
from typing import Dict, Any
import uuid
from app.core.config import settings
from app.core.database import get_supabase
from app.models.schemas import RegisterRequest, LoginRequest
from app.core.dependencies import get_current_user
from app.core.rate_limit import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])
supabase = get_supabase()

@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, req: RegisterRequest) -> Dict[str, Any]:
    try:
        # Dev bypass for e2e tests
        if settings.TEST_MODE and req.email.startswith("dev_"):
            # Mock successful registration for end-to-end tests
            user_id = str(uuid.uuid4())
            supabase.table("users").insert({
                "user_id": user_id,
                "email": req.email,
                "display_name": req.display_name
            }).execute()
            return {
                "status": "success",
                "user_id": user_id,
                "access_token": f"DEV_TOKEN_{req.email}",
                "display_name": req.display_name,
                "is_pro": False
            }
            
        res = supabase.auth.sign_up({
            "email": req.email,
            "password": req.password
        })
        
        if res.user and not res.session:
            raise HTTPException(status_code=400, detail="Registration successful, but email confirmation is required. Please check your email or disable 'Confirm Email' in Supabase.")
        elif not res.user:
            raise HTTPException(status_code=400, detail="Registration failed.")
            
        user_id = res.user.id
        # Insert into public users table
        supabase.table("users").insert({
            "user_id": user_id,
            "email": req.email,
            "display_name": req.display_name
        }).execute()
        
        return {
            "status": "success",
            "user_id": user_id,
            "access_token": res.session.access_token if res.session else None,
            "display_name": req.display_name
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, req: LoginRequest) -> Dict[str, Any]:
    try:
        # Dev bypass for e2e tests
        if settings.TEST_MODE and "testuser_" in req.email:
            user_record = supabase.table("users").select("user_id, display_name, is_pro").eq("email", req.email).execute()
            if not user_record.data:
                raise HTTPException(status_code=401, detail="Invalid credentials")
            return {
                "status": "success",
                "user_id": user_record.data[0]["user_id"],
                "access_token": f"DEV_TOKEN_{req.email}",
                "display_name": user_record.data[0]["display_name"],
                "is_pro": user_record.data[0].get("is_pro", False)
            }
            
        res = supabase.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        if not res.session:
            raise HTTPException(status_code=401, detail="Invalid credentials or Email not confirmed. Please check your email or disable 'Confirm Email' in Supabase.")
            
        user_id = res.user.id
        user_record = supabase.table("users").select("display_name, is_pro").eq("user_id", user_id).execute()
        display_name = user_record.data[0]["display_name"] if user_record.data else "User"
        is_pro = user_record.data[0].get("is_pro", False) if user_record.data else False
        
        return {
            "status": "success",
            "user_id": user_id,
            "access_token": res.session.access_token,
            "display_name": display_name,
            "is_pro": is_pro
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.post("/logout")
async def logout(authorization: str = Header(None)) -> Dict[str, Any]:
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            supabase.auth.sign_out(token)
        except Exception as e:
            from app.core.config import logger
            logger.error(f"Logout failed: {e}")
    return {"status": "success"}

@router.get("/me")
async def get_me(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        res = supabase.table("users").select("user_id, email, display_name, role, is_pro, created_at").eq("user_id", user_id).execute()
        if res.data:
            return {"status": "success", "user": res.data[0]}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        from app.core.config import logger
        logger.error(f"get_me failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
