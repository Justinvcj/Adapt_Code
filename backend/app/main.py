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
from app.core.rate_limit import setup_rate_limiting

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    # The LinUCB agent now handles state fetching directly from Supabase per student_id
    # so we don't need to load the global agent state here anymore.
    yield
    # Shutdown logic
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

@app.get("/")
def read_root():
    return {"message": "AdaptCode API is running."}

@app.get("/health")
def health_check():
    return {"status": "ok"}
