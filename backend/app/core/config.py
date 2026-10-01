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
    ENV: str = os.environ.get("ENV", "development")
    TRUSTED_PROXY_CIDRS: str = os.environ.get("TRUSTED_PROXY_CIDRS", "127.0.0.1/32")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

