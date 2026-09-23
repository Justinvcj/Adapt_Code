# M8: Leaderboard Architectural Scaling

## Objective
Eliminate an O(N) memory bottleneck in the leaderboard generation logic.

## Context & Architectural Flaw
`leaderboard.py` executes a `SELECT *` across all users and `session_events` into Python memory. With a growing student base, this results in polynomial memory degradation and eventual server OOM (Out Of Memory) crashes.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/routers/leaderboard.py`
   - Deprecate in-memory loops.
   - Refactor to utilize Supabase aggregations.
   - Query: `supabase.table("session_events").select("student_id, count", count="exact").eq("final_verdict", "Accepted")`.
   - Alternatively, draft a placeholder Supabase RPC `get_leaderboard_stats()` and call it via `supabase.rpc()`.
2. **Fallback:** If RPC is impossible, strictly select only indexed necessary columns: `.select("student_id")` and process counts.

## Verification Protocol
1. Seed 10,000 `session_events`.
2. Profile the memory usage of the `/api/leaderboard` endpoint; assert memory footprint remains under 50MB.
