import os
import logging
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    SUPABASE_SERVICE_KEY: str = os.environ.get("SUPABASE_SERVICE_KEY", "")
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
    PISTON_URL: str = os.environ.get("PISTON_URL", "http://localhost:2000")
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "")
    TEST_MODE: bool = os.environ.get("TEST_MODE", "false").lower() == "true"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

logger = logging.getLogger("uvicorn")
