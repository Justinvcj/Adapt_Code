import re

with open("backend/app/routers/problems.py", "r", encoding="utf-8") as f:
    problems_code = f.read()

# Diagnostic override
diagnostic_logic = """
    action_idx = agent.select_action(x, allowed)
    
    # FR-5: Diagnostic Escalation Thresholds
    if req.attempt_count >= 3 or req.compile_error_count >= 5 or server_time > 1200:
        if 3 in allowed:
            action_idx = 3
"""

problems_code = problems_code.replace("    action_idx = agent.select_action(x, allowed)", diagnostic_logic)

with open("backend/app/routers/problems.py", "w", encoding="utf-8") as f:
    f.write(problems_code)

print("Implemented Diagnostic Escalation.")
