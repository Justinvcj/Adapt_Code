# M2: LinUCB Agent Thread-Safety & Persistence

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
