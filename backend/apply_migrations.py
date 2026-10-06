"""Apply pending Supabase SQL migrations.

Reads the Postgres connection string from the SUPABASE_DB_URL env var — never
hardcoded. If SUPABASE_DB_URL isn't set and we're outside backend/, the script
loads it from backend/.env.

Usage:
    python apply_migrations.py                     # apply the default pending set
    python apply_migrations.py <file1> <file2>...  # apply explicit files
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

try:
    import psycopg2
except ImportError:
    print("psycopg2 not installed. Run: pip install psycopg2-binary", file=sys.stderr)
    sys.exit(2)

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

HERE = Path(__file__).resolve().parent

# Default order — safe to re-run; each statement is idempotent or no-op on retry.
DEFAULT_FILES = [
    HERE / "migrations" / "create_audit_log.sql",
    HERE / "migrations" / "atomic_register.sql",
    HERE / "migrations" / "004_drop_hashed_password.sql",
    HERE / "migrations" / "005_add_is_pro.sql",
    HERE / "migrations" / "fix_role_escalation.sql",
    HERE / "apply_rls.sql",
]


def run_sql(cursor, filepath: Path) -> None:
    sql = filepath.read_text(encoding="utf-8")
    cursor.execute(sql)
    print(f"  OK  {filepath.relative_to(HERE)}")


def main(argv: list[str]) -> int:
    conn_str = os.environ.get("SUPABASE_DB_URL", "").strip()
    if not conn_str:
        print(
            "SUPABASE_DB_URL env var is not set.\n"
            "Add it to backend/.env as:\n"
            "  SUPABASE_DB_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres",
            file=sys.stderr,
        )
        return 2

    files = [Path(a).resolve() for a in argv[1:]] if len(argv) > 1 else DEFAULT_FILES
    missing = [f for f in files if not f.exists()]
    if missing:
        for f in missing:
            print(f"MISSING: {f}", file=sys.stderr)
        return 2

    print(f"Connecting to Supabase Postgres ({conn_str.split('@')[-1]})")
    try:
        with psycopg2.connect(conn_str) as conn:
            conn.autocommit = False
            with conn.cursor() as cur:
                for f in files:
                    try:
                        run_sql(cur, f)
                        conn.commit()
                    except Exception as e:
                        conn.rollback()
                        msg = str(e).splitlines()[0] if str(e) else type(e).__name__
                        print(f"  ERR {f.name}: {msg}", file=sys.stderr)
    except Exception as e:
        print(f"Connection failed: {e}", file=sys.stderr)
        return 1

    print("Done.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
