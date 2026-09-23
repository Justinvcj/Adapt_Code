# Testing and Contributing Guide

## Development Environment Setup

AdaptCode consists of three main services:
1. Frontend (Next.js)
2. Backend (FastAPI)
3. Code Runner (Piston)

To develop locally, all three must be running.

### 1. Piston Sandbox
The code execution engine is required for any problem submission. It is **not** included in the `docker-compose.yml` file.

```bash
# Launch Piston locally
docker run -d -p 2000:2000 --privileged --tmpfs /tmp:exec --name piston ghcr.io/engineer-man/piston
```

### 2. Backend Environment
The backend requires Python 3.10+ and a local `.env` file containing Supabase and Gemini credentials.

```bash
cd backend
python -m venv venv
source venv/bin/activate  # (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Frontend Environment
```bash
cd frontend
npm install
npm run dev
```

---

## Testing Infrastructure (CURRENTLY DEGRADED)

> **⚠️ CRITICAL NOTICE FOR CONTRIBUTORS:**
> The backend Python test suite located in `backend/tests/` is currently **broken** due to significant architectural refactoring that moved files from `backend/main.py` into the `backend/app/` module structure.

### Known Test Failures

1. **Stale Imports:** 
   - `test_bkt.py` attempts to import `BKTDoctor`, which was removed.
   - `test_api.py` attempts to mock `app.routers.problems.linucb_agent`, which is no longer a global variable but instantiated per request.
2. **Missing Mocks:** Tests do not mock the Piston execution API (`localhost:2000`), meaning they will hang or fail if Piston is not running.

### Remediation Tasks for Contributors
Before adding new features, the test suite must be repaired:
- Rewrite `test_bkt.py` to test the module-level pure functions `compute_effective_weight()` and `update_mastery()`.
- Rewrite `test_api.py` to use a real local testing database, or properly mock `get_supabase()` via FastAPI dependency overrides.
- Add `httpx` and `respx` to mock the external Piston HTTP calls.

### Running Tests (Once Repaired)
```bash
cd backend
venv/bin/pytest tests/ -v
```

---

## Code Quality Standards

- **Typing:** All Python backend endpoints must use strict Pydantic type hinting for request and response models. Avoid returning bare dictionaries.
- **Async Execution:** Database operations via Supabase Python SDK are currently synchronous wrappers. When performing multiple inserts (e.g., telemetry + mastery + agent state), limit the total number of sequential network calls or implement a transaction RPC layer in `schema.sql`.
- **Frontend Components:** Use server components by default in Next.js. Use `"use client"` only for components requiring interactivity (e.g., Monaco editor, Recharts).
- **Error Handling:** Do not expose raw internal exceptions (like `DatabaseError`) to the frontend. Catch exceptions in the router and raise `HTTPException(400, detail="Safe user message")`.
