import re

with open("backend/app/services/bkt.py", "r", encoding="utf-8") as f:
    bkt_code = f.read()

bkt_code = bkt_code.replace("""    supabase = get_supabase()
    res = supabase.table("bkt_params").select("*").eq("concept_tag", concept).execute()
    if res.data:
        p = res.data[0]
        params = (float(p['l0']), float(p['p_t']), float(p['p_g']), float(p['p_s']))
        bkt_cache[concept] = params
        return params""", """    try:
        supabase = get_supabase()
        res = supabase.table("bkt_params").select("*").eq("concept_tag", concept).execute()
        if res.data:
            p = res.data[0]
            params = (float(p['l0']), float(p['p_t']), float(p['p_g']), float(p['p_s']))
            bkt_cache[concept] = params
            return params
    except Exception:
        pass""")

with open("backend/app/services/bkt.py", "w", encoding="utf-8") as f:
    f.write(bkt_code)
print("Added try-except to BKT fetch.")
