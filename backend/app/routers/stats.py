from typing import Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["stats"])


def _compute_streak(events: List[Dict[str, Any]]) -> int:
    if not events:
        return 0
    dates = sorted(list(set([e['timestamp'][:10] for e in events])), reverse=True)
    if not dates:
        return 0
    today = datetime.utcnow().date()
    last_active = datetime.strptime(dates[0], "%Y-%m-%d").date()
    if (today - last_active).days > 1:
        return 0
    streak = 1
    curr_date = last_active
    for i in range(1, len(dates)):
        prev_date = datetime.strptime(dates[i], "%Y-%m-%d").date()
        if (curr_date - prev_date).days == 1:
            streak += 1
            curr_date = prev_date
        else:
            break
    return streak

@router.get("/stats")
async def get_stats(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        # Total Solved
        supabase = get_supabase()
        solved_res = supabase.table("session_events").select("problem_id").eq("student_id", user_id).eq("final_verdict", "Accepted").execute()
        total_solved = len(set(e["problem_id"] for e in solved_res.data)) if solved_res.data else 0
        
        # Total Sessions
        sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).execute()
        total_sessions = len(sessions_res.data) if sessions_res.data else 0
        
        # Streaks
        events_res = supabase.table("session_events").select("timestamp").eq("student_id", user_id).order("timestamp", desc=True).execute()
        streak = _compute_streak(events_res.data or [])
        
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

@router.get("/stats/heatmap")
async def get_heatmap(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        supabase = get_supabase()
        events_res = supabase.table("session_events").select("timestamp").eq("student_id", user_id).execute()
        counts = {}
        if events_res.data:
            for e in events_res.data:
                date_str = e['timestamp'][:10]
                counts[date_str] = counts.get(date_str, 0) + 1
                
        # Format as list of {date, count} for frontend
        data = [{"date": k, "count": v} for k, v in counts.items()]
        return {"status": "success", "data": data}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Heatmap fetch failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")

@router.get("/badges")
async def get_badges(user_id: str = Depends(get_current_user)) -> Dict[str, Any]:
    try:
        badges = []
        
        # Total Solved
        supabase = get_supabase()
        solved_res = supabase.table("session_events").select("problem_id").eq("student_id", user_id).eq("final_verdict", "Accepted").execute()
        unique_solved = len(set(e["problem_id"] for e in solved_res.data)) if solved_res.data else 0
        
        if unique_solved >= 1:
            badges.append({"id": "first_blood", "name": "First Blood", "description": "Solved your first problem.", "icon": "Star"})
        if unique_solved >= 10:
            badges.append({"id": "novice_coder", "name": "Novice Coder", "description": "Solved 10 problems.", "icon": "Award"})
        if unique_solved >= 50:
            badges.append({"id": "seasoned_dev", "name": "Seasoned Developer", "description": "Solved 50 problems.", "icon": "Trophy"})
            
        # Mastery based badges
        mastery_res = supabase.table("mastery_scores").select("concept_tag, mastery_probability").eq("student_id", user_id).execute()
        if mastery_res.data:
            mastered_concepts = [m["concept_tag"] for m in mastery_res.data if float(m["mastery_probability"]) > 0.85]
            for concept in mastered_concepts:
                name = concept.replace("_", " ").title()
                badges.append({"id": f"master_{concept}", "name": f"{name} Master", "description": f"Achieved >85% mastery in {name}.", "icon": "CheckBadge"})
                
        # Streak badges
        events_res = supabase.table("session_events").select("timestamp").eq("student_id", user_id).order("timestamp", desc=True).execute()
        streak = _compute_streak(events_res.data or [])
        
        if streak >= 3:
            badges.append({"id": "streak_3", "name": "On Fire", "description": "3-day streak.", "icon": "Flame"})
        if streak >= 7:
            badges.append({"id": "streak_7", "name": "Unstoppable", "description": "7-day streak.", "icon": "Flame"})
            
        return {"status": "success", "data": badges}
    except Exception as e:
        from app.core.config import logger
        logger.error(f"Badges fetch failed for user {user_id}: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
