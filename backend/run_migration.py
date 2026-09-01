import psycopg2
import os

sql_file = r"C:\Users\Justin\.gemini\antigravity\brain\fb5e1510-23c3-4e17-97f3-d6e29ec8dcb1\supabase_migration.sql"
db_url = "postgresql://postgres:Justin12345Don54321@db.mnsuaqcrvnocvgbfreei.supabase.co:5432/postgres"

print("Connecting to database...")
conn = psycopg2.connect(db_url)
conn.autocommit = True
cursor = conn.cursor()

print("Reading SQL script...")
with open(sql_file, 'r', encoding='utf-8') as f:
    sql = f.read()

print("Executing SQL script...")
try:
    cursor.execute(sql)
    print("Migration successful!")
except Exception as e:
    print(f"Error during migration: {e}")
finally:
    cursor.close()
    conn.close()
