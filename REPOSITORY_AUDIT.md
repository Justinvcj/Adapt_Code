# AdaptCode Repository Audit Summary

**Date:** 2026-09-23
**Auditor:** Principal Engineer
**Scope:** Full Repository Analysis

## 1. Repository Structure & Purpose

AdaptCode is an AI-powered adaptive programming practice platform. The repository is structured as a monorepo containing:
- `backend/`: FastAPI application, database schemas, adaptive algorithms (BKT, LinUCB), code execution integration (Piston).
- `frontend/`: Next.js 14 React application using the App Router, Monaco editor, and Tailwind CSS.
- Root: Orchestration (`docker-compose.yml`) and metadata.

## 2. Implemented Architecture vs Intended Architecture

### 2.1 Backend / API
- **Implemented:** FastAPI application split across `backend/app/routers/` and `backend/app/services/`.
- **Database:** Supabase (PostgreSQL). The backend connects via the Supabase Python SDK.
- **Code Execution:** Uses the Piston execution API (via `backend/app/services/piston.py`) making HTTP requests to `http://localhost:2000`.
- **Adaptive Engine:**
  - **BKT (Bayesian Knowledge Tracing):** Implemented mathematically in `app.services.bkt`.
  - **LinUCB:** Implemented in `app.services.linucb`.
- **AI Tutoring:** Google Gemini API integration in `app.services.gemini`.

### 2.2 Frontend
- **Implemented:** Next.js 14 (App router). Connects to FastAPI via `fetch` calls. State management primarily via React hooks. Authentication is handled by Supabase directly on the client side via custom auth context (`auth-context.tsx` fetches `/api/auth/me`).

### 2.3 Deployment / Infrastructure
- **Implemented:** A `docker-compose.yml` exists for `frontend` and `backend`, but it completely omits the Piston execution engine. Therefore, `docker compose up -d` results in a broken application by default.

## 3. Major System Findings & Gaps

### 3.1 Security Risks
- **Information Disclosure:** Auth routes (`login`, `register`) catch generic `Exception` and pass raw string errors to the client, leaking internal backend state.
- **Access Control:** `apply_rls.sql` exists, but there is no mechanism to enforce its deployment. Without it, the schema is exposed if anon keys are used.
- **Monetization Bypass:** `/api/checkout/mock-upgrade` allows any user to elevate to Pro with an empty POST request.

### 3.2 Architectural Technical Debt
- **Broken Tests:** The test suite (`backend/tests/`) is severely outdated. Imports (e.g., `BKTDoctor`) reference removed files. Running `pytest` fails immediately with `ImportError`.
- **Missing Table Definitions:** The schema (`backend/schema.sql`) is missing columns (`is_pro`) and entire tables (`explanations`) that are required by the backend runtime.
- **Missing Indexes:** Zero database indexes are defined, ensuring O(N) full table scans for hot paths.

### 3.3 Core Algorithm Deficiencies
- **Adaptive Loop Broken:** A fatal serialization bug in `LinUCBAgent` attempts to call `.tolist()` on integer dictionary keys instead of numpy arrays, causing a crash on every single submission state save.
- **Schema Mismatches:** Database columns (`concept_tag`, `problem_id`, `student_id`) do not match backend ORM/query references (`concept`, `id`, `user_id`), rendering the system effectively blind to historical student data.
- **Abandonment Penalty Ignored:** `navigator.sendBeacon` is used for the abandon payload but cannot carry `Authorization` headers. The backend requires auth, meaning all abandonment events return 401 and are dropped.

## 4. Documentation Discrepancies
- `README.md` documents a "Local Subprocess Execution" sandbox, but the system actually uses a networked Piston API.
- `README.md` diagrams API routes (`/api/execute`, `/api/tutor`) that do not exist (actual routes are `/api/submit`, `/api/explanation/{event_id}`).
- Missing authoritative documentation on Database setup, testing execution, and full system deployment.

## 5. Conclusion
The repository has excellent conceptual foundations but fails in basic functional integration. It requires immediate, structured remediation across database schemas, API routing, algorithm serialization, and testing infrastructure before it can be considered production-ready or academically viable.
