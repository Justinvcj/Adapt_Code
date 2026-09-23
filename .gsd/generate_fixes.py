import os

os.makedirs(".gsd/fixes", exist_ok=True)

plans = {
    "M1_Database_Pipeline_Alignment.md": """# M1: Database Schema & Pipeline Alignment

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
""",

    "M2_LinUCB_Agent_Thread_Safety.md": """# M2: LinUCB Agent Thread-Safety & Persistence

## Objective
Eliminate race conditions in the contextual bandit agent and ensure historical parameter data is correctly loaded across active sessions.

## Context & Architectural Flaw
1. **Concurrency Risk:** The `LinUCBAgent` is instantiated as a module-level singleton in `problems.py` (`agent = LinUCBAgent()`). Under concurrent load, multiple FastAPI workers will mutate the shared `agent.A` and `agent.b` state dictionaries, leading to state corruption.
2. **Load Failure:** `load_student()` expects a key `action_index`, but the database writes `action_name`. The KeyError is swallowed, causing the agent to fall back to an identity matrix on every request.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/routers/problems.py`
   - Remove global `agent` variable.
   - Implement an `asyncio.Lock()` or instantiate the agent as a per-request dependency via `FastAPI.Depends`.
2. **Target:** `backend/app/services/linucb.py` -> `load_student()`
   - Map `action_name` string from the DB to the internal `action_index` using `ACTION_MAP = {name: idx for idx, name in enumerate(LinUCBAgent.ACTIONS)}`.
   - Safely ignore unmatched action names.

## Verification Protocol
1. Run concurrent unit tests submitting code simultaneously for the same `student_id`.
2. Assert that `agent.A` matrices undergo strictly additive outer-product updates without overwriting.
3. Verify that on subsequent requests, `load_student` correctly populates non-identity values.
""",

    "M3_Frontend_Data_Wiring.md": """# M3: Frontend Data Wiring & TypeScript Correctness

## Objective
Rectify UI state keys and syntax errors that cause the frontend to display blank data despite correct backend responses.

## Context & Architectural Flaw
The frontend expects keys that do not align with backend DTOs.
- `dashboard/page.tsx` reads `stats.streak` (backend provides `current_streak`).
- `problem/[id]/page.tsx` reads `problem.difficulty` (backend provides `difficulty_level`).
- `history/page.tsx` contains broken template literals in TSX `className` attributes, resulting in fatal compilation errors during build time.

## Code-Level Execution Blueprint
1. **Target:** `frontend/src/app/(app)/dashboard/page.tsx`
   - Refactor `useState` init and JSX bindings to use `current_streak` and `total_problems_solved`.
2. **Target:** `frontend/src/app/(app)/problem/[id]/page.tsx`
   - Update interpolation from `{problem.difficulty}` to `{problem.difficulty_level}`.
   - Update `{problem.hints[0]}` to `{problem.hint_text}`.
3. **Target:** `frontend/src/app/(app)/history/page.tsx`
   - Fix line 81: `className={"px-md py-3 text-body-md whitespace-nowrap " + getStatusColor(h.final_verdict)}`.
   - Fix line 93: Enclose template literal variables properly in backticks.

## Verification Protocol
1. Run `npm run build` in the frontend directory. Ensure zero TSX compilation errors.
2. Authenticate and load the dashboard; verify numeric values replace the `0` placeholders.
""",

    "M4_Authentication_Pool_Optimization.md": """# M4: Authentication Security & Connection Pooling

## Objective
Secure the auth bypass mechanism and optimize database connection handling to prevent connection exhaustion.

## Context & Architectural Flaw
- **Connection Exhaustion:** Every router file calls `get_supabase()` at module level, spawning isolated PostgREST connection clients.
- **Security Bypass:** `DEV_TOKEN_` bypasses are hardcoded in `auth.py`. If `TEST_MODE` accidentally defaults to `True` in production, the system is fundamentally compromised.
- **Session Brittleness:** The auth context completely drops the user session on any API `500` error, destroying the UX during temporary offline states.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/core/database.py`
   - Implement the Singleton pattern for the Supabase client:
     ```python
     _client = None
     def get_supabase() -> Client:
         global _client
         if _client is None: _client = create_client(URL, KEY)
         return _client
     ```
2. **Target:** `backend/app/main.py`
   - Add explicit startup assertion: `assert not settings.TEST_MODE, "CRITICAL: TEST_MODE active in production!"` (if `ENV=production`).
3. **Target:** `frontend/src/lib/auth-context.tsx`
   - Wrap fetch in a `try/catch`. Only `setToken(null)` if `err.status === 401`. Otherwise, flag `isOffline = true`.

## Verification Protocol
1. Monitor active DB connections in Supabase dashboard while load testing; assert < 10 active pools.
2. Simulate a network 500 error via proxy; verify the user is not automatically logged out.
""",

    "M5_Submission_Pipeline_Stability.md": """# M5: Submission Pipeline Stability & Hardening

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
""",

    "M6_Gemini_API_Robustness.md": """# M6: Gemini AI Polling & API Security

## Objective
Mitigate frontend memory leaks and secure the Google Gemini API integration.

## Context & Architectural Flaw
- **Memory Leak:** If the Gemini API background task fails silently or stalls, the frontend polls `/api/explanation/{id}` infinitely every 2 seconds.
- **Key Exposure:** `gemini.py` injects the API key directly into the query string, exposing it to proxy logs and history.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/services/gemini.py`
   - Remove `?key=` from URL. 
   - Inject via `headers = {"x-goog-api-key": settings.GEMINI_API_KEY, "Content-Type": "application/json"}`.
2. **Target:** `frontend/src/app/(app)/problem/[id]/page.tsx`
   - Introduce a `pollCount` variable in the `useEffect` interval.
   - `if (pollCount > 30) { clearInterval(interval); setExplanationStatus('failed'); }`.

## Verification Protocol
1. Force the Gemini service to hang or fail in the backend.
2. Monitor frontend network tab; verify polling ceases exactly after 60 seconds (30 attempts).
3. Check backend access logs; verify API key is absent from the URL string.
""",

    "M7_BKT_Prerequisite_Consistency.md": """# M7: BKT & Prerequisite Logic Consolidation

## Objective
Enforce a single source of truth for the curriculum's Directed Acyclic Graph (DAG) and mastery thresholds.

## Context & Architectural Flaw
`PREREQUISITE_GRAPH` is defined independently in both `linucb.py` and `prerequisites.py` with divergent node definitions (e.g., `binary_search` requires `['arrays']` in one and `['arrays', 'loops']` in the other). `MASTERY_THRESHOLD` is also arbitrarily hardcoded.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/services/linucb.py`
   - Delete the local `PREREQUISITE_GRAPH` and `MASTERY_THRESHOLD`.
   - Refactor to: `from app.services.prerequisites import PREREQUISITE_GRAPH, MASTERY_THRESHOLD`.
2. **Target:** `backend/app/services/prerequisites.py`
   - Standardize `MASTERY_THRESHOLD = 0.85`.
   - Update `can_access_concept` to use the standardized constant instead of a default kwarg.

## Verification Protocol
1. Run `grep -r "PREREQUISITE_GRAPH =" backend/`. Ensure only one definition exists.
2. Verify unlock calculations via `/api/mastery` yield identical results to the LinUCB context builder.
""",

    "M8_Leaderboard_Scaling.md": """# M8: Leaderboard Architectural Scaling

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
""",

    "M9_UI_Workflow_Post_Submit.md": """# M9: UI Workflow & Next Problem Handoff

## Objective
Complete the core loop UX by guiding the user to the dynamically selected "next problem."

## Context & Architectural Flaw
Upon achieving an 'Accepted' verdict, the BKT/LinUCB backend accurately computes and returns the optimal `next_problem`. However, the frontend simply displays a success toast. The user remains stranded on the completed problem's workspace.

## Code-Level Execution Blueprint
1. **Target:** `frontend/src/app/(app)/problem/[id]/page.tsx`
   - Introduce local state: `const [nextProblemInfo, setNextProblemInfo] = useState(null);`.
   - Inside `handleSubmit` success block: `setNextProblemInfo(res.next_problem);`.
   - Render a Post-Solve Modal overlaying the editor:
     - Congratulate user.
     - Display Mastery Delta.
     - Button: `router.push("/problem/" + nextProblemInfo.id)` -> "Proceed to [Next Concept/Difficulty]".

## Verification Protocol
1. Submit a valid solution.
2. Assert the Post-Solve Modal appears within 500ms.
3. Click "Proceed"; verify seamless client-side routing to the new problem ID.
""",

    "M10_Academic_Simulation_Features.md": """# M10: Academic Simulation & Missing Capabilities

## Objective
Fulfill the project's academic thesis by scaffolding the required simulation environment and missing UX routes (Onboarding/Mastery).

## Context & Architectural Flaw
The product is intended as an empirical proof that LinUCB outperforms random curricula. However, `research/env.py`, the Monte Carlo simulator, and the `/onboarding` baseline assessment are completely absent, rendering the thesis unprovable.

## Code-Level Execution Blueprint
1. **Target:** `backend/research/simulator.py` (Create new)
   - Draft a script to simulate 100 students passing through the BKT model against random vs LinUCB agents.
2. **Target:** `frontend/src/app/(app)/onboarding/page.tsx` (Create new)
   - Implement the FR-8 explicit topic selection flow to initialize the BKT prior.
3. **Target:** `frontend/src/app/(app)/mastery/page.tsx` (Create new)
   - Implement the Recharts DAG visualization consuming the `/api/mastery` endpoint.

## Verification Protocol
1. Execute `python backend/research/simulator.py`; assert it outputs a comparative performance CSV.
2. Navigate to `/onboarding`; assert new users can configure their starting knowledge state.
"""
}

for filename, content in plans.items():
    with open(os.path.join(".gsd/fixes", filename), "w") as f:
        f.write(content)

print("Created 10 fix plans in .gsd/fixes/")
