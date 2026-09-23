old_stats = """from typing import Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["stats"])
supabase = get_supabase()"""

new_stats = """from typing import Dict, Any, List
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from app.core.database import get_supabase
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/api", tags=["stats"])
supabase = get_supabase()

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
    return streak"""

old_get_stats = """        # Total Solved
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
                today = datetime.utcnow().date()
                last_active = datetime.strptime(dates[0], "%Y-%m-%d").date()
                if (today - last_active).days > 1:
                    streak = 0
                else:
                    streak = 1
                    curr_date = last_active
                    for i in range(1, len(dates)):
                        prev_date = datetime.strptime(dates[i], "%Y-%m-%d").date()
                        if (curr_date - prev_date).days == 1:
                            streak += 1
                            curr_date = prev_date
                        else:
                            break"""

new_get_stats = """        # Total Solved
        solved_res = supabase.table("session_events").select("problem_id").eq("student_id", user_id).eq("final_verdict", "Accepted").execute()
        total_solved = len(set(e["problem_id"] for e in solved_res.data)) if solved_res.data else 0
        
        # Total Sessions
        sessions_res = supabase.table("sessions").select("session_id").eq("student_id", user_id).execute()
        total_sessions = len(sessions_res.data) if sessions_res.data else 0
        
        # Streaks
        events_res = supabase.table("session_events").select("timestamp").eq("student_id", user_id).order("timestamp", desc=True).execute()
        streak = _compute_streak(events_res.data or [])"""

old_get_badges = """        # Streak badges
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
                        break"""

new_get_badges = """        # Streak badges
        events_res = supabase.table("session_events").select("timestamp").eq("student_id", user_id).order("timestamp", desc=True).execute()
        streak = _compute_streak(events_res.data or [])"""


with open("backend/app/routers/stats.py", "r") as f:
    content = f.read()

content = content.replace(old_stats, new_stats)
content = content.replace(old_get_stats, new_get_stats)
content = content.replace(old_get_badges, new_get_badges)

with open("backend/app/routers/stats.py", "w") as f:
    f.write(content)
print("Done fixing stats.py")
