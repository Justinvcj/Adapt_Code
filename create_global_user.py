import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid

load_dotenv("backend/.env")

url = os.environ.get('SUPABASE_URL', '')
key = os.environ.get('SUPABASE_KEY', '')

if not url or not key:
    print("Supabase credentials not found!")
    sys.exit(1)

supabase: Client = create_client(url, key)

GLOBAL_UUID = "00000000-0000-0000-0000-000000000000"

try:
    # Upsert dummy user for the global bandit
    res = supabase.table('users').upsert({
        "user_id": GLOBAL_UUID,
        "email": "global_bandit@adaptcode.internal",
        "hashed_password": "none",
        "display_name": "Global Bandit Agent",
        "role": "admin"
    }).execute()
    print("Created global user.")
except Exception as e:
    print(f"Error creating global user: {e}")
