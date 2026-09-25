import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

url = os.environ.get('SUPABASE_URL', '')
key = os.environ.get('SUPABASE_KEY', '')

if not url or not key:
    print("Supabase credentials not found!")
    sys.exit(1)

supabase: Client = create_client(url, key)

try:
    res = supabase.table('global_agent_state').select('id').execute()
    print("Table global_agent_state exists:", res.data)
except Exception as e:
    print(f"Error: {e}")
    print("We likely need to run raw SQL. In this codebase, often the python scripts just don't create tables unless through an admin endpoint or similar, wait, Supabase REST API doesn't allow DDL. We'll check if there's a migration tool.")
