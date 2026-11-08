# BRIEFING — 2026-11-08T05:59:00Z

## Mission
Comprehensive codebase problem, defect, and anomaly audit (Requirement R4) covering configs, build, syntax, types, runtime bugs, dependencies, security, credentials, architectural defects, and complete issue catalog.

## 🔒 My Identity
- Archetype: explorer
- Roles: explorer, problem and defect audit
- Working directory: c:\Users\Justin\The Global Projects Folder\Adapt_Code\.agents\teamwork\teamwork_explorer_survey_3
- Original parent: 03c7139e-8671-4704-8cf9-a7247efd28d4
- Milestone: codebase-survey

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Do NOT modify, create, or delete any existing codebase files (only write to our own folder)
- Do NOT run unneeded external scripts
- Do NOT assume, guess, or speculate without explicit evidence in code or configurations
- Write handoff report with 5 components and structured issue catalog

## Current Parent
- Conversation ID: 03c7139e-8671-4704-8cf9-a7247efd28d4
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `frontend/src/app/(app)/problem/[id]/page.tsx`
  - `frontend/src/app/(app)/problems/page.tsx`
  - `frontend/src/app/login/page.tsx`
  - `frontend/src/app/mastery/page.tsx`, `frontend/src/app/mastery/[concept]/page.tsx`
  - `frontend/src/app/learn/page.tsx`, `frontend/src/app/graph/page.tsx`
  - `frontend/src/lib/api.ts`, `frontend/src/lib/auth-context.tsx`, `frontend/src/lib/profile-store.ts`
  - `frontend/next.config.mjs`, `frontend/.eslintrc.json`, `frontend/package.json`
  - `backend/app/main.py`, `backend/app/core/dependencies.py`, `backend/app/core/config.py`, `backend/app/core/database.py`, `backend/app/core/rate_limit.py`, `backend/app/core/logging.py`, `backend/app/core/executor.py`
  - `backend/app/routers/` (problems.py, auth.py, admin.py, session.py, stats.py, mastery.py, potd.py, checkout.py, leaderboard.py, history.py)
  - `backend/app/services/` (piston.py, gemini.py, bkt.py, linucb.py, prerequisites.py, audit.py)
  - `backend/requirements.txt`, `backend/Dockerfile`, `backend/entrypoint.sh`, `backend/cloudbuild.yaml`
  - `docker-compose.yml`, `docker-compose.prod.yml`, `production_schema.sql`, `backend/clean_schema.sql`, `backend/apply_rls.sql`, `backend/simulator.py`
  - `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`
  - `security/SECURITY_ISSUES.md`, `security/SECURITY_FIXES.md`
- **Key findings**:
  1. Frontend syntax error TS5076 in `src/app/(app)/problem/[id]/page.tsx:54` breaks `npm run build` and Docker build.
  2. ESLint config error in `frontend/.eslintrc.json` references Next.js 15 `next/typescript` causing `npm run lint` failure in Next.js 14.
  3. Plaintext database password `Justin12345Don54321` committed to git in `backend/simulator.py` line 57 and present in git commit history.
  4. Backend `cloudbuild.yaml` line 65 specifies `TRUSTED_PROXY_CIDRS` with a semicolon delimiter (`35.191.0.0/16;130.211.0.0/22`), which causes `rate_limit.py` to crash with `ValueError` on Cloud Run startup.
  5. Local `docker-compose.yml` fails on startup because `backend/entrypoint.sh` requires `TS_AUTHKEY` env var and exits immediately when missing.
  6. Backend endpoint `/api/leaderboard` fails with `NameError` (and returns 500) because variable `user` is undefined in `get_leaderboard()`.
  7. Backend `bkt.py` fails to load database parameters due to column name mismatch (`l0, p_t, p_g, p_s` vs `"L0", "T", "S", "G"`), silently defaulting on every request.
  8. Unhandled RLS exception / data isolation defect in `problems.py` submitting to singleton UUID `00000000-0000-0000-0000-000000000000`.
  9. Backend `requirements.txt` contains duplicate conflicting version pins (`pydantic`, `pytest`, `pytest-asyncio`, `python-dotenv`, `pydantic-settings`).
  10. Backend pytest test suite fails on `tests/test_api.py::test_get_next_problem` due to patching deleted function `get_supabase`.
  11. Unused heavy dependencies in frontend (`@supabase/supabase-js`, `ogl`, `gsap`, `@gsap/react`, `framer-motion`, `motion`).
  12. Incomplete and mock features: Gemini AI explanation generated on backend is never fetched or rendered on frontend; social auth buttons (Google/GitHub) are fake toast-only stubs; `/learn` hardcodes redirect to `/problem/two-sum`.
- **Unexplored areas**: None. Entire repository and deployment configurations mapped.

## Key Decisions Made
- All findings categorized with formal Issue IDs (BUILD-01, CONF-01, BUG-01..05, SEC-01..03, DEP-01..02, ARCH-01..05).

## Artifact Index
- DISPATCH.md — Dispatch log
- BRIEFING.md — Persistent briefing state
- progress.md — Liveness heartbeat and progress
- handoff.md — Comprehensive problem and defect audit report
