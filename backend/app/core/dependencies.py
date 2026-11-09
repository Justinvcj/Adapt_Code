import time, httpx
from jose import jwt, JWTError
from functools import lru_cache
from dataclasses import dataclass
from fastapi import Request, HTTPException, Depends
from app.core.config import settings
from app.core.database import get_supabase_admin

# Short-lived cache of "user_id → last time we confirmed this account still exists".
# Without this, a stale JWT whose Supabase auth row was deleted (DELETE /api/auth/account)
# keeps working until the JWT itself expires (up to an hour). With it, the cache window
# bounds the exposure to _USER_EXISTS_TTL seconds.
_USER_EXISTS_CACHE: dict = {}
_USER_EXISTS_TTL = 30  # seconds

JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/.well-known/jwks.json"
_JWKS_CACHE: dict = {"keys": None, "fetched_at": 0}
_JWKS_TTL   = 3600  # 1 hour

async def _get_jwks():
    now = time.time()
    if _JWKS_CACHE["keys"] and now - _JWKS_CACHE["fetched_at"] < _JWKS_TTL:
        return _JWKS_CACHE["keys"]
    async with httpx.AsyncClient(timeout=5.0) as client:
        # Supabase's /auth/v1/keys endpoint requires an API key header.
        r = await client.get(JWKS_URL, headers={
            "apikey": settings.SUPABASE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_KEY}",
        })
        r.raise_for_status()
        _JWKS_CACHE["keys"] = r.json()
        _JWKS_CACHE["fetched_at"] = now
        return _JWKS_CACHE["keys"]

@dataclass
class CurrentUser:
    user_id: str
    jwt: str

async def _verify_supabase_jwt(token: str) -> CurrentUser:
    try:
        jwks = await _get_jwks()
        claims = jwt.decode(
            token, jwks,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=f"{settings.SUPABASE_URL}/auth/v1",
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return CurrentUser(user_id=claims["sub"], jwt=token)

def _confirm_user_exists(user_id: str) -> None:
    """
    Verify the user_id in the JWT still corresponds to an active account. The JWT
    itself is stateless and stays valid until expiry, so without this check a
    deleted account's cookie would keep working for up to an hour. We check the
    public.users row (deleted first by DELETE /api/auth/account), which is a
    plain PostgREST select — no "user not found" exception ambiguity, just a
    zero-row result. Cached per user for a short window.
    """
    now = time.time()
    last = _USER_EXISTS_CACHE.get(user_id)
    if last and now - last < _USER_EXISTS_TTL:
        return
    admin = get_supabase_admin()
    try:
        res = admin.table("users").select("user_id").eq("user_id", user_id).limit(1).execute()
    except Exception:
        # Transient PostgREST / network error: don't lock everyone out. The next
        # request retries. Worst case the stale-session window is slightly longer.
        return
    rows = getattr(res, "data", None) or []
    if not rows:
        _USER_EXISTS_CACHE.pop(user_id, None)
        raise HTTPException(status_code=401, detail="Account no longer exists")
    _USER_EXISTS_CACHE[user_id] = now


async def get_current_user(request: Request) -> CurrentUser:
    token = request.cookies.get("adaptcode_session")
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

    user = await _verify_supabase_jwt(token)
    _confirm_user_exists(user.user_id)
    return user

async def require_admin(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    supabase = get_supabase_admin()
    user_res = supabase.table("users").select("role").eq("user_id", user.user_id).execute()
    if not user_res.data or user_res.data[0].get("role") != "admin":
        raise HTTPException(status_code=403, detail="Forbidden. Admin access required.")
    return user
