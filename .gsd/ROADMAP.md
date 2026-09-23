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
- [ ] Thoroughly test the "Next Problem" adaptive flow (/api/problem/next logic).
- [ ] Tune BKT parameters (slip, guess, transition rates) to ensure smooth difficulty scaling.
- [ ] Add explicit visual feedback for Mastery level changes in the UI post-submission.
- [ ] Implement end-to-end integration tests mimicking a real user session.

## Phase 5: Auth Finalization & Deployment Prep (Planned)
- [ ] Finalize Google OAuth configuration in Supabase and Next.js.
- [ ] Ensure mobile responsiveness across all core pages (add mobile hamburger menu).
- [ ] Setup production Docker Compose for Next.js + FastAPI + Piston.
- [ ] Prepare deployment configuration (Cloudflare Tunnels, VPS, or PaaS).

## Phase 4.1: Critical Remediation (10-Module Blueprint)
- [x] M1: Database Schema & Pipeline Alignment
- [x] M2: LinUCB Agent Thread-Safety & Memory
- [x] M3: Frontend Data Wiring & Typography
- [ ] M4: Authentication Security & State
- [ ] M5: Submission Pipeline Stability
- [ ] M6: Gemini API Robustness
- [ ] M7: BKT & Prerequisite Consistency
- [ ] M8: Architecture & Database Scaling
- [ ] M9: UI Workflow & Next Problem UX
- [ ] M10: Missing Research & Academic Features
