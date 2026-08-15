import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    JUDGE0_URL: str = os.environ.get("JUDGE0_URL", "http://localhost:2358")
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    TEST_MODE: bool = os.environ.get("TEST_MODE", "false").lower() == "true"
    ZHIPU_API_KEY: str = os.environ.get("ZHIPU_API_KEY", "")

import logging

settings = Settings()

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("adaptcode")
