import psycopg2

conn_str = "postgresql://postgres:Justin12345Don54321@db.mnsuaqcrvnocvgbfreei.supabase.co:5432/postgres"

def run_sql(filepath):
    try:
        with psycopg2.connect(conn_str) as conn:
            conn.autocommit = True
            with conn.cursor() as cur:
                with open(filepath, 'r') as f:
                    cur.execute(f.read())
        print(f"Applied {filepath}")
    except Exception as e:
        print(f"Error applying {filepath}: {e}")

run_sql("migrations/002_testcases_not_empty.sql")
run_sql("migrations/003_system_failures.sql")
run_sql("migrations/004_drop_hashed_password.sql")
run_sql("migrations/005_add_is_pro.sql")
