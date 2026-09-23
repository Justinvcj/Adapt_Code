# M5: Submission Pipeline Stability & Hardening

## Objective
Prevent unhandled exceptions from reaching the end-user by normalizing database insertions and limiting payload sizes.

## Context & Architectural Flaw
- **Database Rejection:** Supabase `session_events` has a `CHECK` constraint on `final_verdict` (e.g., 'Accepted', 'Wrong Answer'). Piston returns raw strings ('accepted', 'wrong_answer'). The DB violently rejects these inserts, resulting in 500s.
- **DoS Vulnerability:** The `SubmitRequest` allows infinitely large `code` strings.
- **Abuse Risk:** `api/submit` lacks `@limiter.limit`.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/routers/problems.py` (`/api/submit`)
   - Implement a rigid `VERDICT_MAP` dictionary to translate Piston outputs to schema-compliant strings.
   - Apply `VERDICT_MAP.get(execution["verdict"], "Abandoned")` before insertion.
   - Add `@limiter.limit("20/minute")` decorator.
2. **Target:** `backend/app/models/schemas.py`
   - Update `SubmitRequest`: `code: str = Field(..., max_length=50000)`.

## Verification Protocol
1. Submit a Python script generating a `runtime_error`. Verify the DB accepts the row as `Runtime Error`.
2. Post a 1MB code payload; assert `422 Unprocessable Entity` is returned.
3. Submit 21 rapid requests; assert `429 Too Many Requests`.
