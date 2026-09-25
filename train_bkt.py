import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")
url = os.environ.get('SUPABASE_URL', '')
key = os.environ.get('SUPABASE_KEY', '')

if not url or not key:
    sys.exit(1)

supabase: Client = create_client(url, key)

concepts = {
    'basic_syntax': (0.80, 0.15, 0.10, 0.05),
    'loops': (0.60, 0.12, 0.15, 0.10),
    'arrays': (0.50, 0.10, 0.15, 0.10),
    'strings': (0.50, 0.10, 0.20, 0.15),
    'hashing': (0.30, 0.08, 0.20, 0.10),
    'two_pointers': (0.25, 0.07, 0.10, 0.15),
    'sliding_window': (0.20, 0.06, 0.10, 0.15),
    'recursion': (0.20, 0.05, 0.10, 0.20),
    'backtracking': (0.10, 0.04, 0.05, 0.20),
    'binary_search': (0.30, 0.08, 0.20, 0.15),
    'trees': (0.15, 0.05, 0.10, 0.15),
    'dynamic_programming': (0.05, 0.03, 0.05, 0.25)
}

rows = []
for c, (l0, pt, pg, ps) in concepts.items():
    rows.append({
        "concept_tag": c,
        "l0": l0,
        "p_t": pt,
        "p_g": pg,
        "p_s": ps
    })

try:
    # ensure table exists (we ran schema update, but need it in DB if not restarting supabase)
    # Actually we can't create tables here. But supabase client might succeed if table exists.
    res = supabase.table("bkt_params").upsert(rows).execute()
    print("Inserted per-concept BKT priors.")
except Exception as e:
    print(f"Error inserting BKT params: {e}")
