import re

with open("backend/research/simulator.py", "r", encoding="utf-8") as f:
    sim_code = f.read()

# Replace the tautological logic
old_logic = """            # Action impact: harder problem => lower p_correct, easier => higher p_correct
            # action mapping: 0=easier, 1=same, 2=harder, 3=redirect_prereq, 4=revisit
            if action == 0:
                p_correct = min(1.0, p_correct * 1.5)
            elif action == 2:
                p_correct = max(0.01, p_correct * 0.5)"""

new_logic = """            # Authentic knowledge state mapping
            # Action 0 (easier) is more likely correct if mastery is low
            # Action 2 (harder) requires high mastery to be correct
            if action == 0:
                p_correct = min(1.0, p_correct + 0.2 * (1 - p_correct))
            elif action == 2:
                p_correct = max(0.01, p_correct - 0.2 * p_correct)
            elif action == 3:
                # Redirect prereq increases chance on current focus concept
                p_correct = min(1.0, p_correct + 0.15)"""

sim_code = sim_code.replace(old_logic, new_logic)

with open("backend/research/simulator.py", "w", encoding="utf-8") as f:
    f.write(sim_code)

print("Fixed simulator rigged logic.")
