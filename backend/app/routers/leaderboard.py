from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase

router = APIRouter(prefix="/api", tags=["leaderboard"])
supabase = get_supabase()

@router.get("/leaderboard")
async def get_leaderboard() -> Dict[str, Any]:
    try:
        # Since we don't have a direct "users" table with solved count exposed easily without complex joins,
        # we can fetch all users and their mastery scores/session events, but it's slow.
        # Alternatively, we can use a RPC if we had one.
        # Let's aggregate locally for MVP (not fully scalable, but works for MVP).
        # We fetch users from the public schema if we created one, but we are using auth.users which we can't query easily.
        # Wait, how to get usernames? The `users` table exists in `public`!
        users_res = supabase.table("users").select("user_id, display_name").execute()
        
        events_res = supabase.table("session_events").select("student_id, problem_id").eq("final_verdict", "Accepted").execute()
        
        mastery_res = supabase.table("mastery_scores").select("student_id, mastery_probability").execute()
        
        users_data = users_res.data or []
        events_data = events_res.data or []
        mastery_data = mastery_res.data or []
        
        user_stats = {}
        for u in users_data:
            user_stats[u["user_id"]] = {
                "display_name": u["display_name"],
                "solved": set(),
                "mastery_sum": 0.0,
                "mastery_count": 0
            }
            
        for e in events_data:
            sid = e["student_id"]
            if sid in user_stats:
                user_stats[sid]["solved"].add(e["problem_id"])
                
        for m in mastery_data:
            sid = m["student_id"]
            if sid in user_stats:
                user_stats[sid]["mastery_sum"] += float(m["mastery_probability"])
                user_stats[sid]["mastery_count"] += 1
                
        leaderboard = []
        for uid, stats in user_stats.items():
            solved_count = len(stats["solved"])
            avg_mastery = stats["mastery_sum"] / stats["mastery_count"] if stats["mastery_count"] > 0 else 0
            if solved_count > 0 or avg_mastery > 0:
                leaderboard.append({
                    "user_id": uid,
                    "display_name": stats["display_name"],
                    "solved_count": solved_count,
                    "avg_mastery": round(avg_mastery, 3)
                })
            
        # Sort by solved count desc, then avg mastery desc
        leaderboard.sort(key=lambda x: (x["solved_count"], x["avg_mastery"]), reverse=True)
        
        return {"status": "success", "data": leaderboard[:50]}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Leaderboard fetch failed: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
