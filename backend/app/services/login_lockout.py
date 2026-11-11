"""Per-identity failed-login lockout service (Requirement R1).

Enforces progressive lockout tiers keyed by lowercased, trimmed email:
  - 5 consecutive failed logins -> locked 15 minutes (900 seconds)
  - 10 consecutive failed logins -> locked 1 hour (3600 seconds)
  - 20 consecutive failed logins -> locked 24 hours (86400 seconds)
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

from app.core.database import get_supabase_admin
from app.core.logging import logger

LOCKOUT_TIERS = [
    (20, 24 * 3600),   # >= 20: 24 hours (86400 seconds)
    (10, 3600),        # >= 10: 1 hour (3600 seconds)
    (5, 15 * 60),      # >= 5: 15 minutes (900 seconds)
]


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

    try:
        client = supabase or get_supabase_admin()
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

    try:
        client = supabase or get_supabase_admin()
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

    try:
        client = supabase or get_supabase_admin()
        client.table("login_attempts").delete().eq("email", normalized).execute()
        return True
    except Exception:
        logger.error("clear_login_lockout DB failure; failing OPEN", exc_info=True)
        return False
