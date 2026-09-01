import psycopg2
import json
from seed_db import PROBLEMS

db_url = "postgresql://postgres:Justin12345Don54321@db.mnsuaqcrvnocvgbfreei.supabase.co:5432/postgres"

print("Connecting to database...")
conn = psycopg2.connect(db_url)
conn.autocommit = True
cursor = conn.cursor()

print("Seeding problems via Postgres direct connection...")
for problem in PROBLEMS:
    try:
        # Some fields might not match exactly, so handle that
        # We need to map `starter_code`, `hints` etc to the columns in the db
        title = problem.get("title", "")
        description = problem.get("description", "")
        concept = problem.get("concept", "")
        difficulty = problem.get("difficulty", "easy")
        
        hints = problem.get("hints", [])
        starter_code = problem.get("starter_code", {})
        test_cases = problem.get("test_cases", [])
        
        cursor.execute("""
            INSERT INTO problems (title, description, concept, difficulty, hints, starter_code, test_cases)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT DO NOTHING
        """, (
            title,
            description,
            concept,
            difficulty,
            json.dumps(hints),
            json.dumps(starter_code),
            json.dumps(test_cases)
        ))
    except Exception as e:
        print(f"Failed to insert problem {title}: {e}")

print("Seeding completed.")
cursor.close()
conn.close()
