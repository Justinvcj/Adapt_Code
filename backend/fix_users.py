import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

USERS = [
    {
        "user_id": "00000000-0000-0000-0000-000000000000",
        "display_name": "guest",
        "email": "guest@adaptcode.com",
        "hashed_password": "mock_hash"
    },
    {
        "user_id": "11111111-1111-1111-1111-111111111111",
        "display_name": "student_a",
        "email": "student_a@adaptcode.com",
        "hashed_password": "mock_hash"
    },
    {
        "user_id": "22222222-2222-2222-2222-222222222222",
        "display_name": "student_b",
        "email": "student_b@adaptcode.com",
        "hashed_password": "mock_hash"
    }
]

def seed_users():
    print("Upserting mock users...")
    for user in USERS:
        try:
            supabase.table("users").upsert(user).execute()
            print(f"Upserted {user['display_name']}")
        except Exception as e:
            print(f"Error upserting {user['display_name']}: {e}")

if __name__ == "__main__":
    seed_users()
