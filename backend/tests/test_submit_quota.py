"""Automated Unit Tests for Per-User Daily Submit Quota (Requirement R2 & R4).

Covers:
- Free-tier user blocked at 101st submit (100 allowed, 101st gets HTTP 429).
- Pro-tier user allowed up to 500 submits (500 allowed, 501st gets HTTP 429).
- Rolling 24-hour window enforcement (submits outside 24h window do not count toward cap).
- Header X-AdaptCode-Submits-Today present on all /api/submit responses
  (both 200 allowed returning count + 1, and 429 blocked returning count).
- Counter query uses student_id (not IP).
- Downgrade handling: pro user with 150 submits downgrades to free (is_pro = False);
  existing submits remain intact, but next submit is blocked with 429.
- Missing user profile row in users table for valid JWT: fails CLOSED with HTTP 403.
- Database unreachable: fails OPEN (allows submit).
- SlowAPI disabled via fixture during endpoint testing and restored in teardown.
"""
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient

from app.core.dependencies import CurrentUser, get_current_user
from app.core.rate_limit import limiter
from app.main import app
from app.services.submit_quota import (
    FREE_TIER_CAP,
    PRO_TIER_CAP,
    QuotaResult,
    check_submit_quota,
)


@pytest.fixture
def disable_limiter():
    """Temporarily disable SlowAPI per-IP limiter so it does not mask quota logic."""
    original_state = limiter.enabled
    limiter.enabled = False
    try:
        yield
    finally:
        limiter.enabled = original_state


@pytest.fixture
def override_auth():
    """Override get_current_user dependency with a test student identity."""
    test_user = CurrentUser(user_id="test-student-uid-123", jwt="mock-test-jwt")
    app.dependency_overrides[get_current_user] = lambda: test_user
    try:
        yield test_user
    finally:
        app.dependency_overrides.pop(get_current_user, None)


class InMemorySubmitSupabase:
    """Mock Supabase client providing isolated query execution for submit quota testing."""

    def __init__(
        self,
        users: Optional[Dict[str, Dict[str, Any]]] = None,
        events: Optional[List[Dict[str, Any]]] = None,
        fail_users: bool = False,
        fail_events: bool = False,
    ):
        self.users = users if users is not None else {}
        self.events = events if events is not None else []
        self.fail_users = fail_users
        self.fail_events = fail_events

    def table(self, table_name: str) -> "InMemorySubmitTableQuery":
        if table_name == "users" and self.fail_users:
            raise RuntimeError("Supabase users table unreachable")
        if table_name == "session_events" and self.fail_events:
            raise RuntimeError("Supabase session_events table unreachable")
        return InMemorySubmitTableQuery(self, table_name)


class InMemorySubmitTableQuery:
    def __init__(self, db: InMemorySubmitSupabase, table_name: str):
        self.db = db
        self.table_name = table_name
        self._select_col: Optional[str] = None
        self._count_mode: Optional[str] = None
        self._user_id_filter: Optional[str] = None
        self._student_id_filter: Optional[str] = None
        self._timestamp_gte: Optional[str] = None
        self._limit_val: Optional[int] = None
        self._order_col: Optional[str] = None
        self._order_desc: bool = False

    def select(self, col: str, count: Optional[str] = None) -> "InMemorySubmitTableQuery":
        if self.table_name == "users" and self.db.fail_users:
            raise RuntimeError("users select failed")
        if self.table_name == "session_events" and self.db.fail_events:
            raise RuntimeError("session_events select failed")
        self._select_col = col
        self._count_mode = count
        return self

    def eq(self, col: str, val: Any) -> "InMemorySubmitTableQuery":
        if self.table_name == "users" and self.db.fail_users:
            raise RuntimeError("users eq failed")
        if self.table_name == "session_events" and self.db.fail_events:
            raise RuntimeError("session_events eq failed")
        if col == "user_id":
            self._user_id_filter = str(val)
        elif col == "student_id":
            self._student_id_filter = str(val)
        return self

    def gte(self, col: str, val: Any) -> "InMemorySubmitTableQuery":
        if self.table_name == "session_events" and self.db.fail_events:
            raise RuntimeError("session_events gte failed")
        if col == "timestamp":
            self._timestamp_gte = str(val)
        return self

    def order(self, col: str, desc: bool = False) -> "InMemorySubmitTableQuery":
        self._order_col = col
        self._order_desc = desc
        return self

    def limit(self, val: int) -> "InMemorySubmitTableQuery":
        self._limit_val = val
        return self

    def execute(self) -> Any:
        if self.table_name == "users":
            if self.db.fail_users:
                raise RuntimeError("users execute failed")
            uid = self._user_id_filter
            if uid and uid in self.db.users:
                return type("PostgrestResponse", (), {"data": [self.db.users[uid]], "count": 1})()
            return type("PostgrestResponse", (), {"data": [], "count": 0})()

        if self.table_name == "session_events":
            if self.db.fail_events:
                raise RuntimeError("session_events execute failed")

            sid = self._student_id_filter
            matched = [
                e for e in self.db.events
                if (sid is None or e.get("student_id") == sid)
            ]

            if self._timestamp_gte:
                try:
                    cutoff = datetime.fromisoformat(self._timestamp_gte.replace("Z", "+00:00"))
                    if cutoff.tzinfo is None:
                        cutoff = cutoff.replace(tzinfo=timezone.utc)
                    filtered = []
                    for e in matched:
                        ts_str = str(e.get("timestamp") or e.get("created_at"))
                        ts = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                        if ts.tzinfo is None:
                            ts = ts.replace(tzinfo=timezone.utc)
                        if ts >= cutoff:
                            filtered.append(e)
                    matched = filtered
                except Exception:
                    pass

            # Sort by timestamp ascending
            def _get_dt(e: Dict[str, Any]) -> datetime:
                ts_str = str(e.get("timestamp") or e.get("created_at"))
                dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt

            matched.sort(key=_get_dt, reverse=self._order_desc)
            total_count = len(matched)
            data_slice = matched[:self._limit_val] if self._limit_val else matched

            return type("PostgrestResponse", (), {"data": data_slice, "count": total_count})()

        raise NotImplementedError(f"Table {self.table_name} not handled")


# -----------------------------------------------------------------------------
# Unit Tests: Free Tier Cap & 101st Submit Blocking
# -----------------------------------------------------------------------------

def test_free_tier_under_cap_allowed():
    """Verify free user (is_pro=False) is allowed under 100 submits."""
    user_id = "free-student-1"
    now_utc = datetime.now(timezone.utc)
    # 99 submits within the last 16.5 hours (all within rolling 24h window)
    events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(minutes=10 * i)).isoformat()}
        for i in range(1, 100)  # 99 submits
    ]
    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": False}},
        events=events,
    )

    quota = check_submit_quota(user_id, client=db)
    assert quota.allowed is True
    assert quota.current_count == 99
    assert quota.cap == FREE_TIER_CAP  # 100
    assert quota.resets_at is None
    assert quota.is_pro is False


def test_free_tier_blocked_at_101st_submit():
    """Verify free user is blocked at 101st submit (100 allowed, 101st gets HTTP 429 / allowed=False)."""
    user_id = "free-student-blocked"
    now_utc = datetime.now(timezone.utc)
    # Exactly 100 submissions in rolling window
    events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(minutes=10 * i)).isoformat()}
        for i in range(1, 101)  # 100 submits
    ]
    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": False}},
        events=events,
    )

    quota = check_submit_quota(user_id, client=db)
    # At 100 submits, attempting the 101st is blocked
    assert quota.allowed is False
    assert quota.current_count == 100
    assert quota.cap == 100
    assert quota.resets_at is not None
    assert quota.is_pro is False


# -----------------------------------------------------------------------------
# Unit Tests: Pro Tier Cap & 501st Submit Blocking
# -----------------------------------------------------------------------------

def test_pro_tier_allowed_up_to_500():
    """Verify pro user (is_pro=True) is allowed up to 500 submits."""
    user_id = "pro-student-1"
    now_utc = datetime.now(timezone.utc)
    # 250 submits: above free cap (100) but below pro cap (500)
    events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(minutes=5 * i)).isoformat()}
        for i in range(1, 251)
    ]
    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": True}},
        events=events,
    )

    quota = check_submit_quota(user_id, client=db)
    assert quota.allowed is True
    assert quota.current_count == 250
    assert quota.cap == PRO_TIER_CAP  # 500
    assert quota.resets_at is None
    assert quota.is_pro is True


def test_pro_tier_blocked_at_501st_submit():
    """Verify pro user is blocked at 501st submit (500 allowed, 501st gets blocked)."""
    user_id = "pro-student-blocked"
    now_utc = datetime.now(timezone.utc)
    # Exactly 500 submits
    events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(minutes=2 * i)).isoformat()}
        for i in range(1, 501)
    ]
    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": True}},
        events=events,
    )

    quota = check_submit_quota(user_id, client=db)
    # At 500 submits, attempting the 501st is blocked
    assert quota.allowed is False
    assert quota.current_count == 500
    assert quota.cap == 500
    assert quota.resets_at is not None
    assert quota.is_pro is True


# -----------------------------------------------------------------------------
# Unit Tests: Rolling 24-Hour Window & Reset Timestamp
# -----------------------------------------------------------------------------

def test_rolling_24h_window_excludes_older_events():
    """Verify events older than 24 hours do not count toward daily cap."""
    user_id = "rolling-window-student"
    now_utc = datetime.now(timezone.utc)

    # 150 submits 26 hours ago (outside 24h rolling window)
    old_events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(hours=26)).isoformat()}
        for _ in range(150)
    ]
    # 5 submits within last 2 hours (inside 24h rolling window)
    recent_events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(hours=1)).isoformat()}
        for _ in range(5)
    ]

    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": False}},
        events=old_events + recent_events,
    )

    quota = check_submit_quota(user_id, client=db)
    # Only 5 submits count; 150 old submits are excluded
    assert quota.allowed is True
    assert quota.current_count == 5
    assert quota.cap == 100


def test_resets_at_calculated_from_oldest_event_plus_24h():
    """Verify resets_at is calculated from oldest submit in window + 24 hours."""
    user_id = "reset-calc-student"
    now_utc = datetime.now(timezone.utc)

    # Oldest submit happened 20 hours ago
    oldest_ts = now_utc - timedelta(hours=20)
    expected_reset_dt = oldest_ts + timedelta(hours=24)

    events = [{"student_id": user_id, "timestamp": oldest_ts.isoformat()}]
    # Add 99 more submits after the oldest
    for i in range(1, 100):
        events.append({
            "student_id": user_id,
            "timestamp": (oldest_ts + timedelta(minutes=10 * i)).isoformat(),
        })

    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": False}},
        events=events,
    )

    quota = check_submit_quota(user_id, client=db)
    assert quota.allowed is False
    assert quota.current_count == 100
    assert quota.resets_at is not None

    parsed_reset = datetime.fromisoformat(quota.resets_at.replace("Z", "+00:00"))
    # Allow minor sub-second variance in ISO representation
    assert abs((parsed_reset - expected_reset_dt).total_seconds()) < 2


# -----------------------------------------------------------------------------
# Unit Tests: Counter Query Uses student_id (Not IP) & Isolation
# -----------------------------------------------------------------------------

def test_counter_query_uses_student_id_isolation():
    """Verify counter query filters by student_id and isolates different students."""
    student_a = "student-aaa"
    student_b = "student-bbb"
    now_utc = datetime.now(timezone.utc)

    # Student A has 100 submits (at cap)
    events_a = [
        {"student_id": student_a, "timestamp": (now_utc - timedelta(minutes=5 * i)).isoformat()}
        for i in range(1, 101)
    ]
    # Student B has 3 submits
    events_b = [
        {"student_id": student_b, "timestamp": (now_utc - timedelta(minutes=10 * i)).isoformat()}
        for i in range(1, 4)
    ]

    db = InMemorySubmitSupabase(
        users={
            student_a: {"user_id": student_a, "is_pro": False},
            student_b: {"user_id": student_b, "is_pro": False},
        },
        events=events_a + events_b,
    )

    # Student A is blocked
    quota_a = check_submit_quota(student_a, client=db)
    assert quota_a.allowed is False
    assert quota_a.current_count == 100

    # Student B is allowed with count=3
    quota_b = check_submit_quota(student_b, client=db)
    assert quota_b.allowed is True
    assert quota_b.current_count == 3


# -----------------------------------------------------------------------------
# Unit Tests: Downgrade Handling (Pro to Free with >100 Submits)
# -----------------------------------------------------------------------------

def test_downgrade_handling_pro_to_free_with_high_submits():
    """Verify pro user with 150 submits downgrades to free: blocked at next submit with 429."""
    user_id = "downgraded-student"
    now_utc = datetime.now(timezone.utc)

    # 150 submits accumulated while pro
    events = [
        {"student_id": user_id, "timestamp": (now_utc - timedelta(minutes=5 * i)).isoformat()}
        for i in range(1, 151)
    ]

    # User profile row now indicates is_pro = False (downgraded)
    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": False}},
        events=events,
    )

    quota = check_submit_quota(user_id, client=db)
    # Since is_pro is False and count (150) >= cap (100), next submit is blocked
    assert quota.allowed is False
    assert quota.current_count == 150
    assert quota.cap == 100
    assert quota.is_pro is False
    assert quota.resets_at is not None


# -----------------------------------------------------------------------------
# Unit Tests: Missing User Profile Row & Fail Closed
# -----------------------------------------------------------------------------

def test_missing_user_row_fails_closed_with_http_403():
    """Verify valid JWT with missing users row fails CLOSED raising HTTPException(403)."""
    user_id = "ghost-user-no-row"
    db = InMemorySubmitSupabase(users={}, events=[])

    with pytest.raises(HTTPException) as exc_info:
        check_submit_quota(user_id, client=db)

    assert exc_info.value.status_code == 403
    assert exc_info.value.detail == "User account record not found."


# -----------------------------------------------------------------------------
# Unit Tests: Database Unreachable Fails OPEN
# -----------------------------------------------------------------------------

def test_database_unreachable_on_users_fails_open():
    """Verify if users table query fails, check_submit_quota fails OPEN (allowed=True)."""
    user_id = "unreachable-user-1"
    db = InMemorySubmitSupabase(fail_users=True)

    quota = check_submit_quota(user_id, client=db)
    assert quota.allowed is True
    assert quota.current_count == 0
    assert quota.cap == FREE_TIER_CAP


def test_database_unreachable_on_events_fails_open():
    """Verify if session_events table query fails, check_submit_quota fails OPEN (allowed=True)."""
    user_id = "unreachable-user-2"
    db = InMemorySubmitSupabase(
        users={user_id: {"user_id": user_id, "is_pro": True}},
        fail_events=True,
    )

    quota = check_submit_quota(user_id, client=db)
    assert quota.allowed is True
    assert quota.current_count == 0
    assert quota.cap == PRO_TIER_CAP
    assert quota.is_pro is True


# -----------------------------------------------------------------------------
# Integration / Route Tests: POST /api/submit
# -----------------------------------------------------------------------------

def test_api_submit_quota_exceeded_returns_429_with_header_and_detail(client: TestClient, override_auth, disable_limiter):
    """Verify exceeded quota returns HTTP 429 with X-AdaptCode-Submits-Today and formatted detail."""
    future_iso = (datetime.now(timezone.utc) + timedelta(hours=4)).isoformat()
    mock_quota = QuotaResult(
        allowed=False,
        current_count=100,
        cap=100,
        resets_at=future_iso,
        is_pro=False,
    )

    with patch("app.routers.problems.check_submit_quota", return_value=mock_quota):
        res = client.post(
            "/api/submit",
            json={"problem_id": "test-prob", "code": "def solve(): return 1"},
        )

        assert res.status_code == 429
        assert res.headers.get("X-AdaptCode-Submits-Today") == "100"
        body = res.json()
        assert body["detail"] == f"Daily submit limit reached (100/100). Resets at {future_iso}."


def test_api_submit_downgraded_user_returns_429_with_header_150(client: TestClient, override_auth, disable_limiter):
    """Verify downgraded user with 150 submits gets HTTP 429 and header X-AdaptCode-Submits-Today: 150."""
    future_iso = (datetime.now(timezone.utc) + timedelta(hours=8)).isoformat()
    mock_quota = QuotaResult(
        allowed=False,
        current_count=150,
        cap=100,
        resets_at=future_iso,
        is_pro=False,
    )

    with patch("app.routers.problems.check_submit_quota", return_value=mock_quota):
        res = client.post(
            "/api/submit",
            json={"problem_id": "test-prob", "code": "def solve(): return 1"},
        )

        assert res.status_code == 429
        assert res.headers.get("X-AdaptCode-Submits-Today") == "150"
        body = res.json()
        assert body["detail"] == f"Daily submit limit reached (150/100). Resets at {future_iso}."


def test_api_submit_missing_user_row_returns_403(client: TestClient, override_auth, disable_limiter):
    """Verify missing user row returns HTTP 403 on /api/submit."""
    with patch(
        "app.routers.problems.check_submit_quota",
        side_effect=HTTPException(status_code=403, detail="User account record not found."),
    ):
        res = client.post(
            "/api/submit",
            json={"problem_id": "test-prob", "code": "def solve(): return 1"},
        )

        assert res.status_code == 403
        assert res.json()["detail"] == "User account record not found."


def test_api_submit_allowed_returns_header_count_plus_one(client: TestClient, override_auth, disable_limiter):
    """Verify allowed submission sets X-AdaptCode-Submits-Today to count + 1 on HTTP 200 response."""
    mock_quota = QuotaResult(
        allowed=True,
        current_count=42,
        cap=100,
        resets_at=None,
        is_pro=False,
    )

    test_uuid = "11111111-1111-1111-1111-111111111111"
    mock_problem = {
        "problem_id": test_uuid,
        "title": "Test Two Sum",
        "concept_tag": "arrays",
        "difficulty_level": "easy",
        "test_cases": [],
        "starter_code": {},
    }
    mock_piston_res = {
        "verdict": "accepted",
        "passed": 1,
        "total": 1,
        "runtime_ms": 15,
    }
    mock_sb = MagicMock()
    mock_sb.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock_sb.table.return_value.upsert.return_value.execute.return_value.data = []
    mock_sb.table.return_value.insert.return_value.execute.return_value.data = [{"session_id": "s1", "event_id": "event-123"}]

    mock_admin = MagicMock()
    mock_admin.table.return_value.select.return_value.eq.return_value.execute.return_value.data = []
    mock_admin.table.return_value.upsert.return_value.execute.return_value.data = []

    with patch("app.routers.problems.check_submit_quota", return_value=mock_quota), \
         patch("app.routers.problems.get_problem", new=AsyncMock(return_value=mock_problem)), \
         patch("app.routers.problems.get_mastery_vector", new=AsyncMock(return_value={"arrays": 0.5})), \
         patch("app.routers.problems.get_recent_events", new=AsyncMock(return_value=[])), \
         patch("app.routers.problems.run_test_cases", new=AsyncMock(return_value=mock_piston_res)), \
         patch("app.routers.problems.save_mastery", new=AsyncMock()), \
         patch("app.routers.problems.select_next_problem", new=AsyncMock(return_value={"problem_id": "next", "title": "Next", "concept": "arrays", "difficulty": "easy"})), \
         patch("app.routers.problems.get_supabase_user", return_value=mock_sb), \
         patch("app.routers.problems.new_supabase_admin", return_value=mock_admin), \
         patch("app.routers.problems.generate_explanation", new=AsyncMock()), \
         patch("app.routers.problems.LinUCBAgent") as mock_agent_cls:

        mock_agent_instance = mock_agent_cls.return_value
        mock_agent_instance.select_action.return_value = 0
        mock_agent_instance.ACTIONS = ["easier_problem", "harder_problem", "same_difficulty", "hint_augmented"]
        mock_agent_instance.A = {}
        mock_agent_instance.b = {}

        res = client.post(
            "/api/submit",
            json={"problem_id": test_uuid, "code": "def two_sum(): pass"},
        )

        assert res.status_code == 200
        # Allowed submit sets header to count + 1 (42 + 1 = 43)
        assert res.headers.get("X-AdaptCode-Submits-Today") == "43"
