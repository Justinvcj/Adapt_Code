import re

with open("backend/research/simulator.py", "r", encoding="utf-8") as f:
    sim_code = f.read()

sim_code = sim_code.replace("action = agent.select_action(student_id, ctx, allowed_actions)", "action = agent.select_action(ctx, allowed_actions)")
sim_code = sim_code.replace("agent.update(student_id, action, ctx, reward)", "agent.update(action, ctx, reward)")

with open("backend/research/simulator.py", "w", encoding="utf-8") as f:
    f.write(sim_code)
print("Fixed simulator arguments.")
