import re

with open("backend/app/services/bkt.py", "r", encoding="utf-8") as f:
    bkt_code = f.read()

bkt_code = re.sub(r'def update_mastery\(\s*prior_mastery:\s*float,\s*#.*?\s*w:\s*float\s*#.*?\s*\)\s*->\s*float:', 
                  'def update_mastery(prior_mastery: float, w: float, concept_tag: str = "default") -> float:', 
                  bkt_code, flags=re.DOTALL)

with open("backend/app/services/bkt.py", "w", encoding="utf-8") as f:
    f.write(bkt_code)

print("Fixed update_mastery signature.")
