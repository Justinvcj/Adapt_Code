from fastapi import Header, HTTPException
import httpx
import uuid
from app.core.config import settings
from app.core.database import get_supabase
from app.services.bkt import BKTDoctor
from app.services.linucb import LinUCBAgent

supabase = get_supabase()
bkt_doctor = BKTDoctor()
linucb_agent = LinUCBAgent(n_actions=3, context_dim=16)

async def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    
    token = authorization.split(" ")[1]
    
    # E2E test bypass
    if settings.TEST_MODE and token.startswith("DEV_TOKEN_"):
        dev_email = token.replace("DEV_TOKEN_", "")
        user_record = supabase.table("users").select("user_id").eq("email", dev_email).execute()
        if user_record.data:
            return user_record.data[0]["user_id"]
        # If user doesn't exist, create it in users table
        dev_id = str(uuid.uuid4())
        supabase.table("users").insert({
            "user_id": dev_id,
            "email": dev_email,
            "display_name": "Dev User",
            "hashed_password": "dev"
        }).execute()
        return dev_id
        
    async with httpx.AsyncClient() as client:
        res = await client.get(
            f"{settings.SUPABASE_URL}/auth/v1/user", 
            headers={"Authorization": f"Bearer {token}", "apikey": settings.SUPABASE_KEY}
        )
        if res.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        user_data = res.json()
        return user_data["id"]
