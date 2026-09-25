# AdaptCode Roadmap

## Phase 1: Foundation & Infrastructure (✅ Completed)
- [x] Set up Supabase DB, tables (users, problems, session_events).
- [x] Create seed scripts for 60 algorithmic problems with proper stdin/stdout test cases.
- [x] Set up FastAPI backend monolithic skeleton.
- [x] Set up Next.js frontend with Tailwind and raw UI templates.
- [x] Configure Piston Docker container for Python code execution.

## Phase 2: Refactoring & Backend Modularity (✅ Completed)
- [x] Refactor FastAPI main.py into modular routers (uth.py, problems.py, stats.py, history.py).
- [x] Connect code execution (/api/submit) to the Piston instance.
- [x] Integrate BKT and Contextual Bandit logic to read/write per-user mastery to DB.
- [x] Test core endpoints using Python pytest.

## Phase 3: Frontend Integration & UI Fixes (✅ Completed)
- [x] Connect Next.js UI to actual backend endpoints.
- [x] Strip out extraneous UI template bloat (Contests, Discussions).
- [x] Dynamically render Sidebar/Navbar active states and fix broken "Sign Out".
- [x] Build working Problem Library, Dashboard, and Submission History pages.
- [x] Fix Workspace (/problem/[id]) layout sizing and connect Monaco editor to /api/submit.

## Phase 4: Adaptive Engine Polish & E2E Testing (🚧 Current)
- [x] Thoroughly test the "Next Problem" adaptive flow (/api/problem/next logic).
- [x] Tune BKT parameters (slip, guess, transition rates) to ensure smooth difficulty scaling.
- [x] Add explicit visual feedback for Mastery level changes in the UI post-submission.
- [x] Implement end-to-end integration tests mimicking a real user session.

## Phase 5: Auth Finalization & Deployment Prep (Planned)
- [x] Finalize Google OAuth configuration in Supabase and Next.js.
- [x] Ensure mobile responsiveness across all core pages (add mobile hamburger menu).
- [x] Setup production Docker Compose for Next.js + FastAPI + Piston.
- [x] Prepare deployment configuration (Cloudflare Tunnels, VPS, or PaaS).

## Phase 4.1: Critical Remediation (10-Module Blueprint)
- [x] M1: Database Schema & Pipeline Alignment
- [x] M2: LinUCB Agent Thread-Safety & Memory
- [x] M3: Frontend Data Wiring & Typography
- [x] M4: Authentication Security & State
- [x] M5: Submission Pipeline Stability
- [x] M6: Gemini API Robustness
- [x] M7: BKT & Prerequisite Consistency
- [x] M8: Architecture & Database Scaling
- [x] M9: UI Workflow & Next Problem UX
- [x] M10: Missing Research & Academic Features

## Phase 6: The Brutal Truth Remediation (AUDIT_REPORT Fixes)
- [x] Step 1: Fix LinUCB - Make A and  matrices global and database-backed, contextualized by student state, instead of independent per user.
- [x] Step 2: Implement /api/next-problem endpoint and wire the Dashboard's 'Resume Practice' button to it, closing the adaptive loop.
- [x] Step 3: Implement BKT parameter training script to remove hard-coded heuristics and set realistic priors.
- [x] Step 4: Implement Server-Side Time-on-Task tracking to prevent client-side spoofing.
- [x] Step 5: Fix simulator.py to remove rigged logic that forces LinUCB to succeed.
- [x] Step 6: Implement Diagnostic Escalation (FR-5) in problems.py based on struggle thresholds.
