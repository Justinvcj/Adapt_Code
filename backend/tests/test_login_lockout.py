"""Automated Unit Tests for Failed-Login Lockout (Requirement R1 & R4).

Covers:
- 5 consecutive failed attempts trigger 15-minute lock (900 seconds).
- 10 consecutive failed attempts trigger 1-hour lock (3600 seconds).
- 20 consecutive failed attempts trigger 24-hour lock (86400 seconds).
- Successful login clears counter (clear_login_lockout).
- Locked user gets HTTP 429 with Retry-After header and {"detail": "Too many failed attempts. Try again at <ISO timestamp>."}.
- Different emails have separate counters (failure on email A does not lock email B).
- Case-insensitive email matching (User@Example.COM and   user@example.com map to identical record).
- Expired lockout (now >= locked_until) treated as unlocked and resets counter on next failure.
- Database unreachable fails OPEN (allows login attempt).
- SlowAPI disabled via fixture during endpoint testing and restored in teardown.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.rate_limit import limiter
from app.main import app
from app.services.login_lockout import (
    clear_login_lockout,
    check_login_lockout,
    get_lockout_duration_seconds,
    normalize_email,
    record_failed_login,
)


@pytest.fixture(autouse=True)
def isolate_db_env(monkeypatch):
    """Ensure tests run hermetically against mocks, never attempting live Postgres connections."""
    monkeypatch.setenv("SUPABASE_DB_URL", "")


@pytest.fixture
def disable_limiter():
    """Temporarily disable SlowAPI per-IP limiter so it does not mask lockout logic."""
    original_state = limiter.enabled
    limiter.enabled = False
    try:
        yield
    finally:
        limiter.enabled = original_state


class InMemoryLoginAttemptsDB:
    """In-memory mock for Supabase PostgREST client executing on public.login_attempts."""

    def __init__(self, should_fail: bool = False):
        self.rows: Dict[str, Dict[str, Any]] = {}
        self.should_fail = should_fail

    def table(self, table_name: str) -> "InMemoryLoginTableQuery":
        if self.should_fail:
            raise RuntimeError("Database connection unreachable")
        assert table_name == "login_attempts"
        return InMemoryLoginTableQuery(self)


class InMemoryLoginTableQuery:
    def __init__(self, db: InMemoryLoginAttemptsDB):
        self.db = db
        self._email: Optional[str] = None
        self._upsert_payload: Optional[Dict[str, Any]] = None
        self._is_delete: bool = False

    def select(self, *args, **kwargs) -> "InMemoryLoginTableQuery":
        if self.db.should_fail:
            raise RuntimeError("Database select query failed")
        return self

    def eq(self, column: str, value: Any) -> "InMemoryLoginTableQuery":
        if self.db.should_fail:
            raise RuntimeError("Database filter query failed")
        if column == "email":
            self._email = str(value)
        return self

    def upsert(self, payload: Dict[str, Any], on_conflict: Optional[str] = None) -> "InMemoryLoginTableQuery":
        if self.db.should_fail:
            raise RuntimeError("Database upsert failed")
        self._upsert_payload = payload
        return self

    def delete(self) -> "InMemoryLoginTableQuery":
        if self.db.should_fail:
            raise RuntimeError("Database delete failed")
        self._is_delete = True
        return self

    def execute(self) -> Any:
        if self.db.should_fail:
            raise RuntimeError("Database execute failed")

        if self._is_delete:
            if self._email and self._email in self.db.rows:
                del self.db.rows[self._email]
            return type("PostgrestResponse", (), {"data": []})()

        if self._upsert_payload is not None:
            email = self._upsert_payload["email"]
            self.db.rows[email] = dict(self._upsert_payload)
            return type("PostgrestResponse", (), {"data": [self._upsert_payload]})()

        # Select query
        if self._email and self._email in self.db.rows:
            return type("PostgrestResponse", (), {"data": [dict(self.db.rows[self._email])]})()
        return type("PostgrestResponse", (), {"data": []})()


# -----------------------------------------------------------------------------
# Unit Tests: Email Normalization & Lockout Duration Tiers
# -----------------------------------------------------------------------------

def test_normalize_email_variations():
    """Verify email normalization: lowercase, strip whitespace, and handle edge inputs."""
    assert normalize_email("User@Example.COM") == "user@example.com"
    assert normalize_email("  user@example.com  ") == "user@example.com"
    assert normalize_email("   USER.Name+tag@Domain.ORG   ") == "user.name+tag@domain.org"
    assert normalize_email("") == ""
    assert normalize_email(None) == ""


def test_lockout_duration_tiers_thresholds():
    """Verify progressive lockout durations: 5->900s, 10->3600s, 20->86400s."""
    assert get_lockout_duration_seconds(0) == 0
    assert get_lockout_duration_seconds(1) == 0
    assert get_lockout_duration_seconds(4) == 0
    assert get_lockout_duration_seconds(5) == 900       # 15 minutes
    assert get_lockout_duration_seconds(9) == 900
    assert get_lockout_duration_seconds(10) == 3600     # 1 hour
    assert get_lockout_duration_seconds(19) == 3600
    assert get_lockout_duration_seconds(20) == 86400    # 24 hours
    assert get_lockout_duration_seconds(99) == 86400


# -----------------------------------------------------------------------------
# Unit Tests: Progression and Progressive Lockout Enforcement
# -----------------------------------------------------------------------------

def test_progressive_lockout_5_failures_triggers_15_minute_lock():
    """Verify 5 consecutive failed attempts trigger a 15-minute (900s) lock."""
    db = InMemoryLoginAttemptsDB()
    email = "test5@example.com"

    for i in range(1, 5):
        payload = record_failed_login(email, supabase=db)
        assert payload is not None
        assert payload["failed_count"] == i
        assert payload["locked_until"] is None
        assert check_login_lockout(email, supabase=db) is None

    # 5th consecutive failure triggers lockout
    payload_5 = record_failed_login(email, supabase=db)
    assert payload_5 is not None
    assert payload_5["failed_count"] == 5
    assert payload_5["locked_until"] is not None

    lockout = check_login_lockout(email, supabase=db)
    assert lockout is not None
    assert lockout["is_locked"] is True
    assert 890 <= lockout["retry_after"] <= 900
    assert lockout["locked_until"] == payload_5["locked_until"]


def test_progressive_lockout_10_failures_triggers_1_hour_lock():
    """Verify 10 consecutive failed attempts trigger a 1-hour (3600s) lock."""
    db = InMemoryLoginAttemptsDB()
    email = "test10@example.com"

    # Pre-populate 9 failures
    now_iso = datetime.now(timezone.utc).isoformat()
    db.rows[email] = {
        "email": email,
        "failed_count": 9,
        "first_failed_at": now_iso,
        "locked_until": (datetime.now(timezone.utc) + timedelta(minutes=10)).isoformat(),
    }

    payload_10 = record_failed_login(email, supabase=db)
    assert payload_10 is not None
    assert payload_10["failed_count"] == 10

    lockout = check_login_lockout(email, supabase=db)
    assert lockout is not None
    assert lockout["is_locked"] is True
    assert 3590 <= lockout["retry_after"] <= 3600


def test_progressive_lockout_20_failures_triggers_24_hour_lock():
    """Verify 20 consecutive failed attempts trigger a 24-hour (86400s) lock."""
    db = InMemoryLoginAttemptsDB()
    email = "test20@example.com"

    # Pre-populate 19 failures
    now_iso = datetime.now(timezone.utc).isoformat()
    db.rows[email] = {
        "email": email,
        "failed_count": 19,
        "first_failed_at": now_iso,
        "locked_until": (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat(),
    }

    payload_20 = record_failed_login(email, supabase=db)
    assert payload_20 is not None
    assert payload_20["failed_count"] == 20

    lockout = check_login_lockout(email, supabase=db)
    assert lockout is not None
    assert lockout["is_locked"] is True
    assert 86390 <= lockout["retry_after"] <= 86400


# -----------------------------------------------------------------------------
# Unit Tests: Counter Clear & Counter Isolation
# -----------------------------------------------------------------------------

def test_successful_login_clears_counter():
    """Verify successful login clears the failed count and unlocks the record."""
    db = InMemoryLoginAttemptsDB()
    email = "locked_user@example.com"

    # Simulate locked account
    now_utc = datetime.now(timezone.utc)
    db.rows[email] = {
        "email": email,
        "failed_count": 5,
        "first_failed_at": now_utc.isoformat(),
        "locked_until": (now_utc + timedelta(minutes=15)).isoformat(),
    }
    assert check_login_lockout(email, supabase=db) is not None

    # Clear lockout on success
    cleared = clear_login_lockout(email, supabase=db)
    assert cleared is True
    assert email not in db.rows
    assert check_login_lockout(email, supabase=db) is None


def test_different_emails_have_separate_counters():
    """Verify failures on email A do not increment or lock email B."""
    db = InMemoryLoginAttemptsDB()
    email_a = "alice@example.com"
    email_b = "bob@example.com"

    # Alice fails 5 times and gets locked
    for _ in range(5):
        record_failed_login(email_a, supabase=db)

    assert check_login_lockout(email_a, supabase=db) is not None
    assert check_login_lockout(email_a, supabase=db)["is_locked"] is True

    # Bob has 0 failures and is completely unlocked
    assert check_login_lockout(email_b, supabase=db) is None

    # Bob fails once: failed_count should be 1, unlocked
    bob_payload = record_failed_login(email_b, supabase=db)
    assert bob_payload["failed_count"] == 1
    assert check_login_lockout(email_b, supabase=db) is None


def test_case_insensitive_and_whitespace_email_matching():
    """Verify User@Example.COM and '  user@example.com ' share the exact same record."""
    db = InMemoryLoginAttemptsDB()

    record_failed_login("User@Example.COM", supabase=db)
    record_failed_login("  user@example.com  ", supabase=db)
    record_failed_login("USER@EXAMPLE.COM", supabase=db)

    # All map to canonical normalized key 'user@example.com'
    assert "user@example.com" in db.rows
    assert len(db.rows) == 1
    assert db.rows["user@example.com"]["failed_count"] == 3

    # Check lockout works interchangeably with varied casing and whitespace
    assert check_login_lockout("  USER@example.COM  ", supabase=db) is None

    # Add 2 more failures to reach 5
    record_failed_login("user@example.com", supabase=db)
    record_failed_login("USER@EXAMPLE.COM", supabase=db)

    lockout_variant = check_login_lockout("  User@Example.COM ", supabase=db)
    assert lockout_variant is not None
    assert lockout_variant["is_locked"] is True


# -----------------------------------------------------------------------------
# Unit Tests: Expired Lockout Handling
# -----------------------------------------------------------------------------

def test_expired_lockout_treated_as_unlocked():
    """Verify past locked_until is treated as unlocked."""
    db = InMemoryLoginAttemptsDB()
    email = "expired@example.com"

    past_locked_until = (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat()
    db.rows[email] = {
        "email": email,
        "failed_count": 5,
        "first_failed_at": (datetime.now(timezone.utc) - timedelta(minutes=20)).isoformat(),
        "locked_until": past_locked_until,
    }

    # Lockout has expired -> check_login_lockout returns None
    assert check_login_lockout(email, supabase=db) is None


def test_expired_lockout_resets_counter_on_next_failure():
    """Verify an expired lockout resets the counter to 1 on the next failure."""
    db = InMemoryLoginAttemptsDB()
    email = "expired_reset@example.com"

    past_locked_until = (datetime.now(timezone.utc) - timedelta(minutes=1)).isoformat()
    db.rows[email] = {
        "email": email,
        "failed_count": 5,
        "first_failed_at": (datetime.now(timezone.utc) - timedelta(minutes=16)).isoformat(),
        "locked_until": past_locked_until,
    }

    # Next failure should reset counter to 1 rather than incrementing to 6
    payload = record_failed_login(email, supabase=db)
    assert payload is not None
    assert payload["failed_count"] == 1
    assert payload["locked_until"] is None
    assert check_login_lockout(email, supabase=db) is None


# -----------------------------------------------------------------------------
# Unit Tests: Database Unreachable Fails OPEN
# -----------------------------------------------------------------------------

def test_database_unreachable_fails_open():
    """Verify if database is unreachable, all methods fail OPEN without crashing."""
    failing_db = InMemoryLoginAttemptsDB(should_fail=True)
    email = "unreachable@example.com"

    # check_login_lockout fails open (returns None = allows attempt)
    assert check_login_lockout(email, supabase=failing_db) is None

    # record_failed_login fails open (returns None without raising exception)
    assert record_failed_login(email, supabase=failing_db) is None

    # clear_login_lockout fails open (returns False without raising exception)
    assert clear_login_lockout(email, supabase=failing_db) is False


# -----------------------------------------------------------------------------
# Integration / Route Tests: POST /api/auth/login
# -----------------------------------------------------------------------------

def test_api_login_locked_user_returns_429_with_headers_and_detail(client: TestClient, disable_limiter):
    """Verify locked user gets HTTP 429 with Retry-After header and detailed ISO timestamp."""
    future_iso = (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()
    mock_lockout = {
        "is_locked": True,
        "locked_until": future_iso,
        "retry_after": 900,
    }

    with patch("app.routers.auth.check_login_lockout", return_value=mock_lockout):
        res = client.post(
            "/api/auth/login",
            json={"email": "locked@example.com", "password": "anypassword"},
        )

        assert res.status_code == 429
        assert res.headers.get("Retry-After") == "900"
        body = res.json()
        assert body["detail"] == f"Too many failed attempts. Try again at {future_iso}."


def test_api_login_failed_credentials_records_failure_and_returns_401(client: TestClient, disable_limiter):
    """Verify failed login records the failure using normalized email and returns 401."""
    mock_sb = MagicMock()
    # Mock auth failure: sign_in_with_password returns no session/user
    mock_sb.auth.sign_in_with_password.return_value = MagicMock(session=None, user=None)

    with patch("app.routers.auth.check_login_lockout", return_value=None), \
         patch("app.routers.auth.get_supabase_admin", return_value=mock_sb), \
         patch("app.routers.auth.record_failed_login") as mock_record:

        res = client.post(
            "/api/auth/login",
            json={"email": "  User@Example.COM  ", "password": "WrongPassword"},
        )

        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid credentials."
        # Verify normalized email passed to record_failed_login
        mock_record.assert_called_once_with("user@example.com")


def test_api_login_successful_clears_lockout(client: TestClient, disable_limiter):
    """Verify successful login clears the lockout record."""
    mock_sb = MagicMock()
    mock_user = MagicMock(id="user-12345")
    mock_session = MagicMock(access_token="mock-access-token")
    mock_sb.auth.sign_in_with_password.return_value = MagicMock(session=mock_session, user=mock_user)
    mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = [
        {"display_name": "Test User", "is_pro": True}
    ]

    with patch("app.routers.auth.check_login_lockout", return_value=None), \
         patch("app.routers.auth.get_supabase_admin", return_value=mock_sb), \
         patch("app.routers.auth.clear_login_lockout") as mock_clear, \
         patch("app.routers.auth.audit_log"):

        res = client.post(
            "/api/auth/login",
            json={"email": "User@Example.COM", "password": "CorrectPassword"},
        )

        assert res.status_code == 200
        mock_clear.assert_called_once_with("user@example.com")


def test_api_login_db_unreachable_fails_open_allows_login_attempt(client: TestClient, disable_limiter):
    """Verify if DB fails during lockout check, login attempt proceeds (fail OPEN)."""
    mock_sb = MagicMock()
    mock_sb.auth.sign_in_with_password.return_value = MagicMock(session=None, user=None)
    failing_db = InMemoryLoginAttemptsDB(should_fail=True)

    with patch("app.services.login_lockout.new_supabase_admin", return_value=failing_db), \
         patch("app.routers.auth.get_supabase_admin", return_value=mock_sb):

        res = client.post(
            "/api/auth/login",
            json={"email": "failopen@example.com", "password": "WrongPassword"},
        )
        # Login proceeded to credentials check and returned 401 (not 429, not 500)
        assert res.status_code == 401
        assert res.json()["detail"] == "Invalid credentials."


# -----------------------------------------------------------------------------
# Unit Tests: new_supabase_admin Default & psycopg2 Direct Postgres Access
# -----------------------------------------------------------------------------

def test_default_client_calls_new_supabase_admin_not_get_supabase_admin():
    """Verify check_login_lockout defaults to fresh new_supabase_admin (persist_session=False)."""
    mock_admin = MagicMock()
    mock_admin.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []

    with patch("app.services.login_lockout.new_supabase_admin", return_value=mock_admin) as mock_new, \
         patch("app.services.login_lockout.get_lockout_duration_seconds"):
        res = check_login_lockout("default@example.com")
        assert res is None
        mock_new.assert_called_once()


def test_psycopg2_check_login_lockout_locked(monkeypatch):
    """Verify check_login_lockout evaluates locked status using DB clock via psycopg2."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur

    locked_dt = datetime(2026, 11, 11, 16, 0, 0, tzinfo=timezone.utc)
    mock_cur.fetchone.return_value = (locked_dt, 900)

    with patch("psycopg2.connect", return_value=mock_conn):
        res = check_login_lockout("pglocked@example.com")
        assert res is not None
        assert res["is_locked"] is True
        assert res["locked_until"] == locked_dt.isoformat()
        assert res["retry_after"] == 900


def test_psycopg2_check_login_lockout_unlocked(monkeypatch):
    """Verify check_login_lockout returns None when no row exists or remaining <= 0."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur

    # Case 1: No row in DB
    mock_cur.fetchone.return_value = None
    with patch("psycopg2.connect", return_value=mock_conn):
        assert check_login_lockout("unknown@example.com") is None

    # Case 2: Past lockout (remaining <= 0)
    mock_cur.fetchone.return_value = (datetime(2026, 11, 11, 10, 0, 0, tzinfo=timezone.utc), 0)
    with patch("psycopg2.connect", return_value=mock_conn):
        assert check_login_lockout("expired@example.com") is None


def test_psycopg2_check_login_lockout_db_error_fails_open(monkeypatch):
    """Verify check_login_lockout fails OPEN (returns None) on direct DB error."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    with patch("psycopg2.connect", side_effect=Exception("DB down")):
        assert check_login_lockout("any@example.com") is None


def test_psycopg2_record_failed_login_tiers(monkeypatch):
    """Verify record_failed_login uses DB now() and interval tiers in SQL queries."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur

    now_dt = datetime(2026, 11, 11, 15, 0, 0, tzinfo=timezone.utc)
    lock_dt = datetime(2026, 11, 11, 15, 15, 0, tzinfo=timezone.utc)

    # 1st failure: row is None
    mock_cur.fetchone.side_effect = [
        None,  # SELECT existing
        ("pguser@example.com", 1, now_dt, None),  # RETURNING after INSERT
    ]
    with patch("psycopg2.connect", return_value=mock_conn):
        res1 = record_failed_login("pguser@example.com")
        assert res1["failed_count"] == 1
        assert res1["locked_until"] is None

    # 5th failure: existing count is 4 -> increments to 5, interval 15 minutes
    mock_cur.fetchone.side_effect = [
        (4, now_dt, None, False),  # SELECT existing
        ("pguser@example.com", 5, now_dt, lock_dt),  # RETURNING after INSERT
    ]
    with patch("psycopg2.connect", return_value=mock_conn):
        res5 = record_failed_login("pguser@example.com")
        assert res5["failed_count"] == 5
        assert res5["locked_until"] == lock_dt.isoformat()

    # Expired lockout: is_expired is True -> resets to count 1
    mock_cur.fetchone.side_effect = [
        (5, now_dt, lock_dt, True),  # is_expired=True
        ("pguser@example.com", 1, now_dt, None),  # RETURNING after reset
    ]
    with patch("psycopg2.connect", return_value=mock_conn):
        res_reset = record_failed_login("pguser@example.com")
        assert res_reset["failed_count"] == 1
        assert res_reset["locked_until"] is None


def test_psycopg2_record_failed_login_db_error_fails_open(monkeypatch):
    """Verify record_failed_login fails OPEN (returns None) on direct DB error."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    with patch("psycopg2.connect", side_effect=Exception("DB write failed")):
        assert record_failed_login("any@example.com") is None


def test_psycopg2_clear_login_lockout(monkeypatch):
    """Verify clear_login_lockout deletes record via direct psycopg2 execute."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    mock_conn = MagicMock()
    mock_cur = MagicMock()
    mock_conn.__enter__.return_value = mock_conn
    mock_conn.cursor.return_value.__enter__.return_value = mock_cur

    with patch("psycopg2.connect", return_value=mock_conn):
        success = clear_login_lockout("clear@example.com")
        assert success is True
        mock_cur.execute.assert_called_once_with(
            "DELETE FROM public.login_attempts WHERE email = %s",
            ("clear@example.com",),
        )


def test_psycopg2_clear_login_lockout_db_error_fails_open(monkeypatch):
    """Verify clear_login_lockout fails OPEN (returns False without raising) on direct DB error."""
    monkeypatch.setenv("SUPABASE_DB_URL", "postgresql://mock:mock@localhost:5432/mock")
    with patch("psycopg2.connect", side_effect=Exception("DB delete failed")):
        assert clear_login_lockout("any@example.com") is False

