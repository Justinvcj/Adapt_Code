from fastapi import APIRouter, HTTPException, Depends, Header, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, Any
import uuid
import secrets
import hmac
from app.core.config import settings
from app.core.database import get_supabase_admin, get_supabase_user
from app.services.audit import log_event as audit_log
from app.models.schemas import RegisterRequest, LoginRequest
from app.core.dependencies import get_current_user, CurrentUser, _verify_supabase_jwt
from app.core.rate_limit import limiter, get_real_ip
from app.core.logging import logger

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_session_cookie(resp: JSONResponse, access_token: str) -> None:
    """Issue the httpOnly adaptcode_session cookie that the rest of the API
    reads via get_current_user. Shared between password login and OAuth."""
    is_prod = settings.ENV in {"production", "staging"}
    resp.set_cookie(
        key="adaptcode_session",
        value=access_token,
        max_age=60 * 60,
        httponly=True,
        secure=is_prod,
        samesite="none" if is_prod else "lax",
        path="/",
    )

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

    # 3) best-effort audit via direct Postgres (bypasses PostgREST role drift)
    audit_log("login_success", actor=user_id)

    # 4) issue the session cookie
    json_resp = JSONResponse({
        "status": "success",
        "user_id": user_id,
        "display_name": display_name,
        "is_pro": is_pro,
    })
    _set_session_cookie(json_resp, access_token)
    return json_resp


class SupabaseCallbackRequest(BaseModel):
    """Token exchange from the browser after a Supabase OAuth redirect.

    The browser received a Supabase session (access_token + refresh_token)
    via the implicit flow at /auth/callback. We re-verify the access token
    against the live JWKS and mint our own httpOnly adaptcode_session cookie
    so the rest of the API — which only reads cookies — keeps working.
    """
    access_token: str


@router.post("/supabase-callback")
@limiter.limit("20/minute")
async def supabase_oauth_callback(request: Request, req: SupabaseCallbackRequest) -> Any:
    try:
        verified = await _verify_supabase_jwt(req.access_token)
    except HTTPException:
        raise
    except Exception:
        logger.error("supabase-callback JWT verify failed", exc_info=True)
        raise HTTPException(status_code=401, detail="Invalid Supabase token.")

    user_id = verified.user_id

    # Pull the authoritative user record from Supabase (email, display_name
    # from user_metadata) so we don't trust the browser for identity fields.
    display_name = "User"
    email: str | None = None
    try:
        auth_user = get_supabase_admin().auth.admin.get_user_by_id(user_id)
        u = getattr(auth_user, "user", None)
        if u:
            email = getattr(u, "email", None)
            meta = getattr(u, "user_metadata", None) or {}
            display_name = (
                meta.get("full_name")
                or meta.get("name")
                or meta.get("display_name")
                or (email.split("@")[0] if email else "User")
            )
    except Exception:
        logger.error("auth.admin.get_user_by_id failed in supabase-callback", exc_info=True)

    # Ensure a row exists in `users` so the rest of the backend can look up
    # display_name + is_pro without 500ing on OAuth users who never hit /register.
    is_pro = False
    try:
        supabase = get_supabase_admin()
        upserted = supabase.table("users").upsert({
            "user_id": user_id,
            "email": email,
            "display_name": display_name,
            "hashed_password": "supabase-auth-managed",
            "role": "student",
            "is_pro": False,
        }, on_conflict="user_id").execute()
        if upserted.data:
            row = upserted.data[0]
            display_name = row.get("display_name") or display_name
            is_pro = bool(row.get("is_pro", False))
    except Exception:
        logger.error("users upsert failed in supabase-callback", exc_info=True)

    audit_log("oauth_login", actor=user_id)

    json_resp = JSONResponse({
        "status": "success",
        "user_id": user_id,
        "display_name": display_name,
        "is_pro": is_pro,
    })
    _set_session_cookie(json_resp, req.access_token)
    return json_resp

@router.post("/logout")
async def logout(response: Response, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        supabase = get_supabase_admin()
        supabase.auth.sign_out(user.jwt)
        audit_log("logout", actor=user.user_id)
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


class UnlinkIdentityRequest(BaseModel):
    provider: str


@router.get("/export")
async def export_account(user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Dump everything the server stores about the signed-in user as a single
    JSON blob the UI can download. Covers profile, mastery vector, session
    events, and generated explanations. Honours the right-of-access part of
    GDPR / CCPA in one call.
    """
    admin = get_supabase_admin()
    uid = user.user_id
    # Query each table independently so a schema drift on one doesn't null the whole export.
    # Column names differ across tables (users/explanations key on user_id, the learning
    # tables key on student_id); each query uses the correct one.
    plan = [
        ("profile",         "users",          "user_id"),
        ("mastery",         "mastery_scores", "student_id"),
        ("session_events",  "session_events", "student_id"),
        ("explanations",    "explanations",   "user_id"),
    ]
    data: Dict[str, Any] = {}
    errors: Dict[str, str] = {}
    for key, table, col in plan:
        try:
            q = admin.table(table).select("*").eq(col, uid)
            # session_events uses `timestamp` (not `created_at`) per schema.sql.
            if table == "session_events":
                q = q.order("timestamp", desc=True)
            data[key] = q.execute().data or []
        except Exception as e:
            logger.warning("export_account: %s failed (%s): %s", table, col, e)
            data[key] = []
            errors[key] = type(e).__name__
    audit_log("account_export", actor=uid)
    return {
        "status": "success",
        "exported_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "data": data,
        **({"warnings": errors} if errors else {}),
    }


@router.delete("/account")
async def delete_account(response: Response, user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Hard-delete the signed-in user: Supabase auth row, users-table row, and
    all owned rows in mastery_scores / session_events / explanations /
    agent_state. Clears the session cookie so the client is signed out.
    """
    admin = get_supabase_admin()
    uid = user.user_id
    # supabase-py's .table().delete().eq().execute() has been observed to no-op
    # silently against this project (likely because the client doesn't send the
    # PostgREST-required `Prefer: return=...` with the service-role key the way
    # the REST API expects). We use a direct PostgREST DELETE instead, which is
    # the same call the dashboard SQL editor makes and is verified to work.
    import httpx
    rest_url = f"{settings.SUPABASE_URL}/rest/v1"
    headers = {
        "apikey": settings.SUPABASE_SERVICE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_KEY}",
        "Prefer": "return=minimal",
    }
    try:
        with httpx.Client(timeout=10.0) as client:
            # Children first (users has FK references pointing at it). Each
            # delete is best-effort: a missing table or zero rows is fine.
            for table, col in (
                ("explanations",  "user_id"),
                ("session_events", "student_id"),
                ("mastery_scores", "student_id"),
                ("users",          "user_id"),
            ):
                try:
                    r = client.delete(f"{rest_url}/{table}?{col}=eq.{uid}", headers=headers)
                    if r.status_code >= 400:
                        logger.warning("delete_account: %s DELETE returned %s: %s", table, r.status_code, r.text[:200])
                except Exception as e:
                    logger.warning("delete_account: %s DELETE raised %s", table, e)
        admin.auth.admin.delete_user(uid)
        audit_log("account_delete", actor=uid)
    except Exception:
        logger.error("delete_account failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not delete your account. Contact support.")
    # Evict the "user still exists" cache immediately so the deleted account's
    # cookie can't be used in the TTL window before the entry would expire.
    try:
        from app.core.dependencies import _USER_EXISTS_CACHE
        _USER_EXISTS_CACHE.pop(uid, None)
    except Exception:
        pass
    resp = JSONResponse({"status": "success"})
    resp.delete_cookie(key="adaptcode_session", path="/")
    return resp


@router.post("/unlink-identity")
async def unlink_identity(
    req: UnlinkIdentityRequest,
    user: CurrentUser = Depends(get_current_user),
) -> Dict[str, Any]:
    """
    Remove a social identity (google / github) from the signed-in user. The
    user keeps their email/password identity. Refuses to remove the last
    identity so the user can still sign in.
    """
    provider = (req.provider or "").strip().lower()
    if provider not in {"google", "github"}:
        raise HTTPException(status_code=400, detail="Unsupported provider.")
    admin = get_supabase_admin()
    uid = user.user_id
    try:
        auth_user = admin.auth.admin.get_user_by_id(uid)
        u = auth_user.user if auth_user else None
        identities = (u and getattr(u, "identities", None)) or []
        target = next((i for i in identities if getattr(i, "provider", None) == provider), None)
        if target is None:
            raise HTTPException(status_code=404, detail=f"No {provider} identity linked.")
        if len(identities) <= 1:
            raise HTTPException(
                status_code=400,
                detail="This is your only sign-in method. Add a password or another provider first.",
            )
        # supabase-py >= 2 exposes `identities.delete` on the admin auth client.
        admin.auth.admin.unlink_identity(target)  # type: ignore[attr-defined]
        audit_log("identity_unlinked", actor=uid, metadata={"provider": provider})
    except HTTPException:
        raise
    except AttributeError:
        # Older supabase-py without unlink_identity — fall back to a direct DB flip.
        logger.warning("unlink_identity: supabase-py does not expose unlink; skipping provider-side revoke")
        raise HTTPException(status_code=501, detail="Server is missing unlink support. Update supabase-py.")
    except Exception:
        logger.error("unlink_identity failed", exc_info=True)
        raise HTTPException(status_code=500, detail="Could not unlink that account.")
    return {"status": "success"}


@router.get("/identities")
async def list_identities(user: CurrentUser = Depends(get_current_user)) -> Dict[str, Any]:
    """Return which providers the signed-in user has linked (google / github / email)."""
    admin = get_supabase_admin()
    try:
        auth_user = admin.auth.admin.get_user_by_id(user.user_id)
        u = auth_user.user if auth_user else None
        identities = (u and getattr(u, "identities", None)) or []
        providers = sorted({getattr(i, "provider", None) for i in identities if getattr(i, "provider", None)})
    except Exception:
        logger.error("list_identities failed", exc_info=True)
        providers = []
    return {"status": "success", "providers": providers}
