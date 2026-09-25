from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase

router = APIRouter(prefix="/api", tags=["leaderboard"])


@router.get("/leaderboard")
async def get_leaderboard() -> Dict[str, Any]:
    try:
        # We utilize the get_leaderboard_stats RPC defined in schema.sql
        # to offload aggregation to the Postgres engine and prevent O(N) memory blowouts.
        supabase = get_supabase()
        res = supabase.rpc("get_leaderboard_stats").execute()
        
        leaderboard = []
        if res.data:
            for row in res.data:
                leaderboard.append({
                    "user_id": row["user_id"],
                    "display_name": row["display_name"],
                    "solved_count": row["solved_count"],
                    "avg_mastery": round(float(row["avg_mastery"]), 3)
                })
        
        return {"status": "success", "data": leaderboard}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Leaderboard fetch failed: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
