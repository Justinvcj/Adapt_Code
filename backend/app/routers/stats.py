from typing import Dict, Any
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["stats"])
supabase = get_supabase()

@router.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        # Total Solved
        solved_res = supabase.table("session_events").select("event_id").eq("student_id", user_id).eq("final_verdict", "Accepted").execute()
        total_solved = len(solved_res.data) if solved_res.data else 0
        
        # Total Sessions
        sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).execute()
        total_sessions = len(sessions_res.data) if sessions_res.data else 0
        
        # Streaks (Basic calculation)
        events_res = supabase.table("session_events").select("timestamp").eq("student_id", user_id).order("timestamp", desc=True).execute()
        streak = 0
        if events_res.data:
            dates = sorted(list(set([e['timestamp'][:10] for e in events_res.data])), reverse=True)
            if dates:
                streak = 1
                curr_date = datetime.strptime(dates[0], "%Y-%m-%d").date()
                for i in range(1, len(dates)):
                    prev_date = datetime.strptime(dates[i], "%Y-%m-%d").date()
                    if (curr_date - prev_date).days == 1:
                        streak += 1
                        curr_date = prev_date
                    else:
                        break
        
        # Mastery aggregates
        mastery_res = supabase.table("mastery_scores").select("concept_tag, mastery_probability").eq("student_id", user_id).execute()
        strongest = None
        weakest = None
        avg = 0.0
        
        if mastery_res.data:
            scores = [(m['concept_tag'], float(m['mastery_probability'])) for m in mastery_res.data]
            strongest = max(scores, key=lambda x: x[1])[0]
            # Weakest above 0
            above_zero = [s for s in scores if s[1] > 0]
            if above_zero:
                weakest = min(above_zero, key=lambda x: x[1])[0]
            avg = sum(s[1] for s in scores) / len(scores)
            
        return {
            "status": "success",
            "data": {
                "total_problems_solved": total_solved,
                "total_sessions": total_sessions,
                "current_streak": streak,
                "strongest_concept": strongest,
                "weakest_concept": weakest,
                "avg_mastery": round(avg, 3)
            }
        }
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Stats fetch failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
