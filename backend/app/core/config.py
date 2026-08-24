import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    JUDGE0_URL: str = os.environ.get("JUDGE0_URL", "http://localhost:2358")
    JUDGE0_API_KEY: str = os.environ.get("JUDGE0_API_KEY", "")
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    DEBUG: bool = os.environ.get("DEBUG", "false").lower() == "true"
    TEST_MODE: bool = os.environ.get("TEST_MODE", "false").lower() == "true"
    GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")

import logging

settings = Settings()

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("adaptcode")

BKT_PARAMS_BY_TIER = {
    1: {"p_learn": 0.2, "p_guess": 0.1, "p_slip": 0.1},
    2: {"p_learn": 0.15, "p_guess": 0.1, "p_slip": 0.15},
    3: {"p_learn": 0.1, "p_guess": 0.05, "p_slip": 0.2}
}
