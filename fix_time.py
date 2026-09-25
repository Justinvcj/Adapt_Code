import re

with open("backend/app/routers/problems.py", "r", encoding="utf-8") as f:
    problems_code = f.read()

start_endpoint = """
from pydantic import BaseModel

class StartRequest(BaseModel):
    problem_id: str

@router.post("/start")
async def start_problem(req: StartRequest, user_id: str = Depends(get_current_user)):
    import time
    supabase = get_supabase()
    supabase.table("active_problem_state").upsert({
        "student_id": user_id,
        "problem_id": req.problem_id,
        "start_time": time.time(),
        "hint_used": False
    }).execute()
    return {"status": "success"}
"""

if "@router.post(\"/start\")" not in problems_code:
    problems_code = problems_code.replace("class SubmitRequest(BaseModel):", start_endpoint + "\nclass SubmitRequest(BaseModel):")

# Modify submit to use active_problem_state
time_logic = """
    import time
    res = supabase.table("active_problem_state").select("start_time").eq("student_id", user_id).eq("problem_id", req.problem_id).execute()
    server_time = int(req.time_on_task_seconds)
    if res.data:
        server_time = int(time.time() - float(res.data[0]["start_time"]))
        # clamp
        if server_time < 0: server_time = 1
        if server_time > 3600: server_time = 3600
"""

problems_code = problems_code.replace("time_seconds=req.time_on_task_seconds", "time_seconds=server_time")
problems_code = problems_code.replace("    w = compute_effective_weight(", time_logic + "\n    w = compute_effective_weight(")
problems_code = problems_code.replace('"time_on_task_seconds": int(req.time_on_task_seconds),', '"time_on_task_seconds": server_time,')

with open("backend/app/routers/problems.py", "w", encoding="utf-8") as f:
    f.write(problems_code)

print("Added server-side time tracking.")
