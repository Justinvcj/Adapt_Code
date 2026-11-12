import os

# Sentry must initialise BEFORE the FastAPI app is created so its ASGI
# middleware wraps every route. No-op when SENTRY_DSN is unset.
_sentry_dsn = os.environ.get("SENTRY_DSN")
if _sentry_dsn:
    import sentry_sdk
    from sentry_sdk.integrations.fastapi import FastApiIntegration
    from sentry_sdk.integrations.starlette import StarletteIntegration

    sentry_sdk.init(
        dsn=_sentry_dsn,
        environment=os.environ.get("ENV", "development"),
        traces_sample_rate=float(os.environ.get("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        profiles_sample_rate=0.0,
        send_default_pii=False,
        integrations=[
            StarletteIntegration(transaction_style="endpoint"),
            FastApiIntegration(transaction_style="endpoint"),
        ],
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings

# Import routers
from app.routers.auth import router as auth_router
from app.routers.problems import router as problems_router
from app.routers.mastery import router as mastery_router
from app.routers.session import router as session_router
from app.routers.stats import router as stats_router
from app.routers.history import router as history_router
from app.routers.admin import router as admin_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.potd import router as potd_router
from app.routers.checkout import router as checkout_router
from app.core.rate_limit import setup_rate_limiting

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

@asynccontextmanager
async def lifespan(app: FastAPI):
    # One-shot: log the Piston runtime catalogue so operators can pin specific
    # versions without needing Tailscale CLI access. Suppressed if the fetch
    # fails — we don't want a flaky sandbox to block the API from booting.
    try:
        import httpx
        from app.services.piston import PISTON_BASE_URL
        async with httpx.AsyncClient(timeout=5.0) as c:
            r = await c.get(f"{PISTON_BASE_URL}/api/v2/runtimes")
            if r.status_code == 200:
                pairs = [{"language": x.get("language"), "version": x.get("version")} for x in r.json()]
                import json as _json
                from app.core.logging import logger as _lg
                _lg.info("piston_runtimes_catalog=%s", _json.dumps(pairs))
    except Exception:
        pass
    yield
    pass

env = os.environ.get("ENV", "development").lower()

# In prod/staging, hide the FastAPI auto-generated interactive docs. They're
# a reconnaissance gift to attackers (full route + schema catalog). Keep them
# on in dev so we don't lose the DX.
_is_public_env = env in ("production", "staging")
app = FastAPI(
    title="AdaptCode API Phase 2 (Modular)",
    lifespan=lifespan,
    docs_url=None if _is_public_env else "/docs",
    redoc_url=None if _is_public_env else "/redoc",
    openapi_url=None if _is_public_env else "/openapi.json",
)

setup_rate_limiting(app)

app.add_middleware(SecurityHeadersMiddleware)

from urllib.parse import urlparse

# Configure CORS.
# FRONTEND_URL may be a single origin or a comma-separated list, so prod can
# include the main domain + Vercel preview URLs without a code change.
# A regex can be set via FRONTEND_URL_REGEX for Vercel's preview subdomains
# (e.g. "^https://adaptcode-[a-z0-9-]+\.vercel\.app$").
allowed: list[str] = [o.strip() for o in (settings.FRONTEND_URL or "").split(",") if o.strip()]
if settings.ENV not in {"production", "staging"}:
    if "http://localhost:3000" not in allowed:
        allowed.append("http://localhost:3000")

for origin in allowed:
    if not origin:
        continue
    parsed = urlparse(origin)
    assert parsed.scheme == "https" or settings.ENV not in {"production", "staging"}, f"Insecure CORS origin: {origin}"
    assert parsed.netloc, f"Malformed CORS origin: {origin}"

_frontend_url_regex = os.environ.get("FRONTEND_URL_REGEX", "")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_origin_regex=_frontend_url_regex or None,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-Request-Id"],
)

# Include routers
app.include_router(auth_router)
app.include_router(problems_router)
app.include_router(mastery_router)
app.include_router(session_router)
app.include_router(stats_router)
app.include_router(history_router)
app.include_router(leaderboard_router)
app.include_router(potd_router)
app.include_router(checkout_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "AdaptCode API is running."}

import httpx
@app.get("/health")
async def health_check():
    piston_ok = False
    piston_err = None
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(f"{settings.PISTON_URL}/api/v2/runtimes")
            piston_ok = r.status_code == 200
    except Exception as e:
        piston_ok = False
        piston_err = f"{type(e).__name__}: {str(e)}"

    return {
        "status": "ok",
        "piston_reachable": piston_ok,
        "piston_error": piston_err,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
