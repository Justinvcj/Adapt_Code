# M1: Database Schema & Pipeline Alignment

## Objective
Remediate the catastrophic data pipeline disconnect between the backend application layer (`problems.py`) and the PostgreSQL schema (`schema.sql`). 

## Context & Architectural Flaw
The BKT engine and execution pipeline operate perfectly in-memory, but persistence fails silently. `problems.py` utilizes invalid column names during DML operations:
- `session_events` insert uses `user_id` and `verdict` instead of `student_id` and `final_verdict`.
- `mastery_scores` upsert uses `user_id` and `concept` instead of `student_id` and `concept_tag`.
Consequently, downstream analytics (`stats.py`, `history.py`, `mastery.py`) read from correct schema columns but return zero rows. The adaptive curriculum resets constantly.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/routers/problems.py` -> `submit` endpoint.
2. **Action:** Refactor `session_events` `insert()` payload:
   - Map `user_id` -> `student_id`.
   - Map `execution["verdict"]` -> `final_verdict`.
   - Ensure `concept_tag` is populated correctly.
3. **Action:** Refactor `mastery_scores` `upsert()` payload:
   - Map `user_id` -> `student_id`.
   - Map `concept` -> `concept_tag`.
   - Update `on_conflict` clause to `"student_id,concept_tag"`.

## Verification Protocol
1. Issue a POST request to `/api/submit` with valid code.
2. Query Supabase directly: `SELECT student_id, final_verdict FROM session_events ORDER BY timestamp DESC LIMIT 1`.
3. Assert that `student_id` is a valid UUID and not NULL.
4. Verify `/api/stats` correctly aggregates the new row.
