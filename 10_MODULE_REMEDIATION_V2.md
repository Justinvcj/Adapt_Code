# AdaptCode 10-Module Remediation Plan (Phase 2)

**Status:** APPROVED FOR EXECUTION
**Objective:** Remediate all critical and high-severity architecture, security, schema, and algorithm bugs discovered in the Phase 2 deep-dive repository audit.

---

## N1: Schema-to-ORM Synchronization
**Severity: CRITICAL**
**Scope:** `backend/app/routers/problems.py`, `backend/app/routers/mastery.py`
**Issue:** The backend queries use legacy column names (`id`, `concept`, `user_id`, `difficulty`) which do not match the database schema (`problem_id`, `concept_tag`, `student_id`, `difficulty_level`). This causes silent query failures and prevents mastery data loading.
**Remediation:**
- Audit every `supabase.table().select().eq()` call.
- Map `id` -> `problem_id`
- Map `concept` -> `concept_tag`
- Map `user_id` -> `student_id` in mastery queries
- Ensure returned JSON dictionaries correctly map `problem_id` back to `id` for frontend consumption.

## N2: LinUCB Agent Serialization Fix
**Severity: CRITICAL**
**Scope:** `backend/app/routers/problems.py`, `backend/app/services/linucb.py`
**Issue:** When saving `agent.A` and `agent.b` to the database, list comprehension `[a.tolist() for a in agent.A[user_id]]` is used. Since `A[user_id]` is a dictionary, this iterates over the *keys* (integers), resulting in an `AttributeError` when `.tolist()` is called on an integer.
**Remediation:**
- Update `problems.py` save logic: `{str(k): v.tolist() for k, v in agent.A[user_id].items()}`.
- Update `linucb.py` load logic to deserialize from dictionary items rather than list indices.

## N3: Abandonment Telemetry Auth Fix
**Severity: CRITICAL**
**Scope:** `frontend/src/app/(app)/problem/[id]/page.tsx`, `backend/app/routers/problems.py`
**Issue:** Frontend uses `navigator.sendBeacon` on `beforeunload` to report problem abandonment. `sendBeacon` cannot include `Authorization` headers. The backend requires auth, dropping all events with 401.
**Remediation:**
- Replace `sendBeacon` with a `fetch(..., { keepalive: true })` call inside a `visibilitychange` event listener.
- Include the `Authorization: Bearer <token>` header.
- Add `hint_used: bool = False` to `AbandonRequest` schema to track hint telemetry on abandon.

## N4: Session Sequence Auto-Increment Fix
**Severity: HIGH**
**Scope:** `backend/app/routers/problems.py`
**Issue:** If a user submits code without an active session, a session is lazily created with a hardcoded `session_number=1`. This duplicates session numbers across the user's lifetime.
**Remediation:**
- Query the user's latest session `count_res = supabase...order("session_number", desc=True).limit(1)`.
- Create the new session using `count_res.data[0]["session_number"] + 1`.

## N5: `hint_augmented` Action Integration
**Severity: HIGH**
**Scope:** `backend/app/routers/problems.py`, `frontend/src/app/(app)/problem/[id]/page.tsx`
**Issue:** The LinUCB algorithm can select action index 4 (`hint_augmented`), but the backend `select_next_problem` logic does not handle it. It falls through, behaving exactly like `same_difficulty`.
**Remediation:**
- Backend: Implement `elif action == "hint_augmented":`, setting a flag `hint_pre_expanded = True` on the returned problem payload.
- Frontend: Accept this flag and automatically toggle the Hint UI on problem load.

## N6: Database Performance Indexing
**Severity: HIGH**
**Scope:** `backend/schema.sql`
**Issue:** Zero indexes exist in the schema. Queries on `session_events`, `mastery_scores`, and `agent_state` do full table scans on `student_id`, severely degrading performance at scale.
**Remediation:**
- Append `CREATE INDEX idx_session_events_student_id ON session_events(student_id);`
- Append `CREATE INDEX idx_mastery_scores_student_id ON mastery_scores(student_id);`
- Append indexing for `agent_state(student_id)`, `sessions(student_id, started_at)`, and `problems(concept_tag, difficulty_level)`.

## N7: Auth Information Disclosure Remediation
**Severity: HIGH**
**Scope:** `backend/app/routers/auth.py`
**Issue:** A bare `except Exception as e:` block in login and register endpoints raises a 400/401 HTTP exception with `detail=str(e)`. This leaks internal database exception details (e.g., PostgreSQL connection strings, stack traces).
**Remediation:**
- Refactor the exception block to log `str(e)` internally via `logger.error()`.
- Return generic safe messages like `"Invalid credentials."` or `"Registration failed."` to the client.

## N8: Schema Completeness Update
**Severity: HIGH**
**Scope:** `backend/schema.sql`
**Issue:** Code references a `users.is_pro` boolean column (in `checkout.py` and `auth.py`) and an `explanations` table (in `gemini.py`), but neither exists in the source-of-truth schema file.
**Remediation:**
- Add `ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;`.
- Add `CREATE TABLE IF NOT EXISTS explanations (...)` with foreign keys referencing `session_events` and `users`.

## N9: Problem ID Normalization
**Severity: HIGH**
**Scope:** `backend/app/routers/problems.py`
**Issue:** The `/api/problems` list endpoint returns rows containing `problem_id`. The frontend maps over this data but expects `p.id` to construct navigation links (`/problem/${p.id}`). This breaks the problem catalog UI.
**Remediation:**
- In `get_all_problems()`, restructure the returned dictionary: `[{"id": p["problem_id"], **p} for p in res.data]`.

## N10: Stats Streak Optimization
**Severity: MEDIUM**
**Scope:** `backend/app/routers/stats.py`
**Issue:** The streak logic incorrectly starts at 1 even if the last event was weeks ago. Furthermore, the exact same heavy calculation is duplicated across both `/api/stats` and `/api/badges`.
**Remediation:**
- Extract a shared utility `_compute_streak(events: list) -> int`.
- Fix the logic to return `0` if the difference between `today` and `last_active_date` is `> 1` day.
- Refactor both endpoints to use the shared function.
