import re

GLOBAL_UUID = "00000000-0000-0000-0000-000000000000"

# Fix problems.py to use GLOBAL_UUID for agent_state
with open("backend/app/routers/problems.py", "r") as f:
    problems_code = f.read()

# I already modified it to use global_agent_state and id=1. Let me revert that part.
problems_code = problems_code.replace('supabase.table("global_agent_state").select("*").eq("id", 1)', f'supabase.table("agent_state").select("*").eq("student_id", "{GLOBAL_UUID}")')
problems_code = problems_code.replace('supabase.table("global_agent_state").upsert({\n        "id": 1,', f'supabase.table("agent_state").upsert({{\n        "student_id": "{GLOBAL_UUID}",')

with open("backend/app/routers/problems.py", "w") as f:
    f.write(problems_code)

print("Reverted to agent_state table using a global UUID.")
