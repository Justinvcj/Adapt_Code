"""Lightweight audit-log writer that bypasses PostgREST.

The Supabase REST client's role identity drifts to `authenticated` after a
sign-in call on the shared admin client, which breaks audit inserts even
with service_role grants. Direct psycopg2 writes avoid the role chain
entirely — the connection is made as the Postgres superuser identity
embedded in SUPABASE_DB_URL and the write is always allowed.
"""
from __future__ import annotations

import os
from typing import Any, Optional

try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

try:
    import psycopg2
    from psycopg2.extras import Json
except ImportError:  # pragma: no cover
    psycopg2 = None  # type: ignore

from app.core.logging import logger


def _db_url() -> str:
    """Read lazily so a late-arriving .env (uvicorn reload) is still honored."""
    return os.environ.get("SUPABASE_DB_URL", "").strip()


def log_event(action: str, actor: Optional[str] = None, target: Optional[str] = None, metadata: Optional[dict[str, Any]] = None) -> None:
    """Fire-and-forget audit-log write. Never raises — audit failures must not
    break the surrounding user flow."""
    url = _db_url()
    if not url or psycopg2 is None:
        return
    try:
        with psycopg2.connect(url, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO audit_log (actor, action, target, metadata) VALUES (%s, %s, %s, %s)",
                    (actor, action, target, Json(metadata) if metadata is not None else None),
                )
    except Exception:
        logger.error("audit_log insert failed", exc_info=True)
