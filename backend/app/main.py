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
    yield
    pass

app = FastAPI(title="AdaptCode API Phase 2 (Modular)", lifespan=lifespan)

import os
env = os.environ.get("ENV", "development").lower()

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
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            r = await client.get(f"{settings.PISTON_URL}/api/v2/runtimes")
            piston_ok = r.status_code == 200
    except Exception:
        piston_ok = False

    return {
        "status": "ok",
        "piston_reachable": piston_ok,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_SERVICE_KEY),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
