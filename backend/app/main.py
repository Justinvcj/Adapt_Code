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
from app.core.rate_limit import setup_rate_limiting

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    pass

app = FastAPI(title="AdaptCode API Phase 2 (Modular)", lifespan=lifespan)
setup_rate_limiting(app)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(problems_router)
app.include_router(execution_router)
app.include_router(mastery_router)
app.include_router(session_router)
app.include_router(stats_router)
app.include_router(history_router)
app.include_router(admin_router)

@app.get("/")
def read_root():
    return {"message": "AdaptCode API is running."}

import httpx

@app.get("/health")
async def health_check():
    judge0_ok = False
    try:
        async with httpx.AsyncClient(timeout=3.0) as c:
            r = await c.get(f"{settings.JUDGE0_URL}/about")
            judge0_ok = r.status_code == 200
    except Exception:
        pass
    return {
        "status": "ok",
        "judge0": judge0_ok,
        "zhipu_configured": bool(settings.ZHIPU_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    }
