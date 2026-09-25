import re
import os

with open("backend/schema.sql", "r", encoding="utf-8") as f:
    schema = f.read()

bkt_table = """-- BKT Params Table
CREATE TABLE IF NOT EXISTS bkt_params (
    concept_tag TEXT PRIMARY KEY,
    l0 NUMERIC(4,3) NOT NULL,
    p_t NUMERIC(4,3) NOT NULL,
    p_g NUMERIC(4,3) NOT NULL,
    p_s NUMERIC(4,3) NOT NULL
);
"""

if "bkt_params" not in schema:
    schema += "\n" + bkt_table

with open("backend/schema.sql", "w", encoding="utf-8") as f:
    f.write(schema)


with open("backend/app/services/bkt.py", "r", encoding="utf-8") as f:
    bkt_code = f.read()

cache_logic = """
from app.core.database import get_supabase

bkt_cache = {}

def get_bkt_params(concept: str):
    if concept in bkt_cache:
        return bkt_cache[concept]
    
    supabase = get_supabase()
    res = supabase.table("bkt_params").select("*").eq("concept_tag", concept).execute()
    if res.data:
        p = res.data[0]
        params = (float(p['l0']), float(p['p_t']), float(p['p_g']), float(p['p_s']))
        bkt_cache[concept] = params
        return params
    
    # Fallback to defaults
    return (0.30, 0.12, 0.20, 0.10)
"""

bkt_code = re.sub(r'L0 = 0\.30.*?P_S = 0\.10[^\n]*\n', cache_logic, bkt_code, flags=re.DOTALL)

bkt_code = bkt_code.replace("def update_mastery(prior: float, effective_weight: float) -> float:", "def update_mastery(prior: float, effective_weight: float, concept_tag: str = 'default') -> float:")

bkt_code = bkt_code.replace("    prob_correct = prior * (1 - P_S) + (1 - prior) * P_G", "    l0, p_t, p_g, p_s = get_bkt_params(concept_tag)\n    prob_correct = prior * (1 - p_s) + (1 - prior) * p_g")
bkt_code = bkt_code.replace("    posterior_correct = (prior * (1 - P_S)) / prob_correct", "    posterior_correct = (prior * (1 - p_s)) / prob_correct")
bkt_code = bkt_code.replace("    posterior_incorrect = (prior * P_S) / (1 - prob_correct)", "    posterior_incorrect = (prior * p_s) / (1 - prob_correct)")
bkt_code = bkt_code.replace("    new_mastery = posterior + (1 - posterior) * P_T", "    new_mastery = posterior + (1 - posterior) * p_t")

with open("backend/app/services/bkt.py", "w", encoding="utf-8") as f:
    f.write(bkt_code)

with open("backend/app/routers/problems.py", "r", encoding="utf-8") as f:
    problems_code = f.read()

problems_code = problems_code.replace("new_mastery = update_mastery(old_mastery, w)", "new_mastery = update_mastery(old_mastery, w, concept)")
problems_code = problems_code.replace("new_mastery = update_mastery(old_mastery, 0.0)", "new_mastery = update_mastery(old_mastery, 0.0, concept)")

with open("backend/app/routers/problems.py", "w", encoding="utf-8") as f:
    f.write(problems_code)

with open("backend/research/simulator.py", "r", encoding="utf-8") as f:
    sim_code = f.read()

sim_code = sim_code.replace("mastery[focus_concept] = update_mastery(mastery[focus_concept], w)", "mastery[focus_concept] = update_mastery(mastery[focus_concept], w, focus_concept)")

with open("backend/research/simulator.py", "w", encoding="utf-8") as f:
    f.write(sim_code)

print("Fixed BKT to be concept-specific.")
