from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings

# Import routers
from app.routers.auth import router as auth_router
from app.routers.problems import router as problems_router
from app.routers.execution import router as execution_router
from app.routers.mastery import router as mastery_router
from app.routers.session import router as session_router
from app.routers.stats import router as stats_router
from app.routers.history import router as history_router
from app.routers.admin import router as admin_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.potd import router as potd_router
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
setup_rate_limiting(app)

app.add_middleware(SecurityHeadersMiddleware)

# Configure CORS strictly
origins = [settings.FRONTEND_URL]
if settings.DEBUG:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# Include routers
app.include_router(auth_router)
app.include_router(problems_router)
app.include_router(execution_router)
app.include_router(mastery_router)
app.include_router(session_router)
app.include_router(stats_router)
app.include_router(history_router)
app.include_router(leaderboard_router)
app.include_router(potd_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "AdaptCode API is running."}

@app.get("/health")
async def health_check():
    supabase_ok = bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    gemini_ok = bool(settings.GEMINI_API_KEY)
    return {
        "status": "ok",
        "supabase_configured": supabase_ok,
        "gemini_configured": gemini_ok,
    }
