"""Per-identity failed-login lockout service (Requirement R1).

Enforces progressive lockout tiers keyed by lowercased, trimmed email:
  - 5 consecutive failed logins -> locked 15 minutes (900 seconds)
  - 10 consecutive failed logins -> locked 1 hour (3600 seconds)
  - 20 consecutive failed logins -> locked 24 hours (86400 seconds)

Uses direct Postgres access via psycopg2 and DB clock now() when SUPABASE_DB_URL
is configured, with fallback to fresh new_supabase_admin() (persist_session=False).
"""
from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

try:
    import psycopg2
except ImportError:  # pragma: no cover
    psycopg2 = None  # type: ignore

from app.core.database import new_supabase_admin
from app.core.logging import logger

LOCKOUT_TIERS = [
    (20, 24 * 3600),   # >= 20: 24 hours (86400 seconds)
    (10, 3600),        # >= 10: 1 hour (3600 seconds)
    (5, 15 * 60),      # >= 5: 15 minutes (900 seconds)
]


def _db_url() -> str:
    """Read lazily so environment changes in tests or uvicorn reload are honored."""
    return os.environ.get("SUPABASE_DB_URL", "").strip()


def normalize_email(email: str) -> str:
    """Normalize email by trimming whitespace and lowercasing."""
    return (email or "").strip().lower()


def get_lockout_duration_seconds(failed_count: int) -> int:
    """Determine lockout duration in seconds based on progressive failed count tiers."""
    for threshold, duration in LOCKOUT_TIERS:
        if failed_count >= threshold:
            return duration
    return 0


def _parse_iso_utc(ts_str: str) -> datetime:
    """Parse an ISO 8601 string into a timezone-aware UTC datetime."""
    clean_str = str(ts_str).replace("Z", "+00:00")
    dt = datetime.fromisoformat(clean_str)
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def check_login_lockout(email: str, supabase: Optional[Any] = None) -> Optional[Dict[str, Any]]:
    """Check if the given email is currently locked out.

    Returns:
        None if unlocked (or on DB failure: fail OPEN).
        Dict with {"is_locked": True, "locked_until": "<ISO string>", "retry_after": <int seconds>} if locked.
    """
    normalized = normalize_email(email)
    if not normalized:
        return None

    # 1. Direct Postgres path via psycopg2 using DB clock now()
    url = _db_url()
    if url and psycopg2 is not None and supabase is None:
        try:
            with psycopg2.connect(url, connect_timeout=3) as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT locked_until, EXTRACT(EPOCH FROM (locked_until - now()))::int AS remaining_seconds
                        FROM public.login_attempts
                        WHERE email = %s
                        """,
                        (normalized,),
                    )
                    row = cur.fetchone()
                    if not row or row[0] is None:
                        return None
                    locked_until, remaining = row
                    if remaining is not None and remaining > 0:
                        locked_iso = locked_until.isoformat() if hasattr(locked_until, "isoformat") else str(locked_until)
                        return {
                            "is_locked": True,
                            "locked_until": locked_iso,
                            "retry_after": max(1, remaining),
                        }
                    return None
        except Exception:
            logger.error("check_login_lockout direct DB failure; failing OPEN", exc_info=True)
            return None

    # 2. Fallback via new_supabase_admin / injected mock client
    try:
        client = supabase or new_supabase_admin()
        res = client.table("login_attempts").select("*").eq("email", normalized).execute()
        if not res.data:
            return None

        row = res.data[0]
        locked_until_raw = row.get("locked_until")
        if not locked_until_raw:
            return None

        locked_until_dt = _parse_iso_utc(locked_until_raw)
        now_utc = datetime.now(timezone.utc)

        if locked_until_dt > now_utc:
            remaining_seconds = max(1, int((locked_until_dt - now_utc).total_seconds()))
            return {
                "is_locked": True,
                "locked_until": locked_until_raw,
                "retry_after": remaining_seconds,
            }
        return None
    except Exception:
        logger.error("check_login_lockout DB failure; failing OPEN", exc_info=True)
        return None


def record_failed_login(email: str, supabase: Optional[Any] = None) -> Optional[Dict[str, Any]]:
    """Record a failed login attempt and update/set lockout tier.

    Increments counter or resets counter to 1 if prior lockout expired;
    updates locked_until if tier reached; upserts to DB.
    Fail-open: logs error and returns None if database write fails.
    """
    normalized = normalize_email(email)
    if not normalized:
        return None

    # 1. Direct Postgres path via psycopg2 using DB clock now()
    url = _db_url()
    if url and psycopg2 is not None and supabase is None:
        try:
            with psycopg2.connect(url, connect_timeout=3) as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT failed_count, first_failed_at, locked_until, (locked_until IS NOT NULL AND locked_until <= now()) AS is_expired
                        FROM public.login_attempts
                        WHERE email = %s
                        """,
                        (normalized,),
                    )
                    row = cur.fetchone()
                    if not row or row[3] is True:
                        # First failed attempt OR prior lockout expired -> reset to 1
                        failed_count = 1
                        interval_str = None
                    else:
                        failed_count = int(row[0] or 0) + 1
                        duration = get_lockout_duration_seconds(failed_count)
                        if duration == 86400:
                            interval_str = "24 hours"
                        elif duration == 3600:
                            interval_str = "1 hour"
                        elif duration == 900:
                            interval_str = "15 minutes"
                        else:
                            interval_str = None

                    if interval_str:
                        cur.execute(
                            f"""
                            INSERT INTO public.login_attempts (email, failed_count, first_failed_at, locked_until)
                            VALUES (%s, %s, now(), now() + interval '{interval_str}')
                            ON CONFLICT (email) DO UPDATE SET
                                failed_count = EXCLUDED.failed_count,
                                first_failed_at = CASE WHEN EXCLUDED.failed_count = 1 THEN now() ELSE login_attempts.first_failed_at END,
                                locked_until = now() + interval '{interval_str}'
                            RETURNING email, failed_count, first_failed_at, locked_until
                            """,
                            (normalized, failed_count),
                        )
                    else:
                        cur.execute(
                            """
                            INSERT INTO public.login_attempts (email, failed_count, first_failed_at, locked_until)
                            VALUES (%s, %s, now(), NULL)
                            ON CONFLICT (email) DO UPDATE SET
                                failed_count = EXCLUDED.failed_count,
                                first_failed_at = CASE WHEN EXCLUDED.failed_count = 1 THEN now() ELSE login_attempts.first_failed_at END,
                                locked_until = NULL
                            RETURNING email, failed_count, first_failed_at, locked_until
                            """,
                            (normalized, failed_count),
                        )
                    res_row = cur.fetchone()
                    conn.commit()
                    if res_row:
                        return {
                            "email": res_row[0],
                            "failed_count": res_row[1],
                            "first_failed_at": res_row[2].isoformat() if hasattr(res_row[2], "isoformat") else str(res_row[2]),
                            "locked_until": res_row[3].isoformat() if hasattr(res_row[3], "isoformat") and res_row[3] is not None else (str(res_row[3]) if res_row[3] is not None else None),
                        }
                    return None
        except Exception:
            logger.error("record_failed_login direct DB failure; failing OPEN", exc_info=True)
            return None

    # 2. Fallback via new_supabase_admin / injected mock client
    try:
        client = supabase or new_supabase_admin()
        now_utc = datetime.now(timezone.utc)
        now_iso = now_utc.isoformat()

        res = client.table("login_attempts").select("*").eq("email", normalized).execute()

        if not res.data:
            failed_count = 1
            first_failed_at = now_iso
            locked_until = None
        else:
            row = res.data[0]
            existing_locked_until = row.get("locked_until")
            first_failed_at = row.get("first_failed_at") or now_iso

            is_past_lockout = False
            if existing_locked_until:
                try:
                    if _parse_iso_utc(existing_locked_until) <= now_utc:
                        is_past_lockout = True
                except Exception:
                    pass

            if is_past_lockout:
                # Expired lockout resets counter on next failure
                failed_count = 1
                first_failed_at = now_iso
                locked_until = None
            else:
                failed_count = int(row.get("failed_count") or 0) + 1
                duration = get_lockout_duration_seconds(failed_count)
                if duration > 0:
                    locked_until = (now_utc + timedelta(seconds=duration)).isoformat()
                else:
                    locked_until = None

        payload = {
            "email": normalized,
            "failed_count": failed_count,
            "first_failed_at": first_failed_at,
            "locked_until": locked_until,
        }
        client.table("login_attempts").upsert(payload, on_conflict="email").execute()
        return payload
    except Exception:
        logger.error("record_failed_login DB failure; failing OPEN", exc_info=True)
        return None


def clear_login_lockout(email: str, supabase: Optional[Any] = None) -> bool:
    """Clear failed login record upon successful authentication.

    Fail-open: logs error and returns False if delete fails, but does not raise.
    """
    normalized = normalize_email(email)
    if not normalized:
        return True

    # 1. Direct Postgres path via psycopg2
    url = _db_url()
    if url and psycopg2 is not None and supabase is None:
        try:
            with psycopg2.connect(url, connect_timeout=3) as conn:
                with conn.cursor() as cur:
                    cur.execute("DELETE FROM public.login_attempts WHERE email = %s", (normalized,))
                    conn.commit()
            return True
        except Exception:
            logger.error("clear_login_lockout direct DB failure; failing OPEN", exc_info=True)
            return False

    # 2. Fallback via new_supabase_admin / injected mock client
    try:
        client = supabase or new_supabase_admin()
        client.table("login_attempts").delete().eq("email", normalized).execute()
        return True
    except Exception:
        logger.error("clear_login_lockout DB failure; failing OPEN", exc_info=True)
        return False
