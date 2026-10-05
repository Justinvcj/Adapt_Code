# AdaptCode — Demo Mode snapshot

**Snapshot date:** 2026-10-05
**Context:** College presentation. System in demo mode so the UI loop (register → open problem → submit → verdict → mastery change) looks complete without the Piston sandbox being reachable.

When the user says "we are back to production", every item in this file must be reverted or genuinely implemented before claiming prod-ready. **No partial reverts. No bluffs.**

---

## 1. What is faked in demo mode

### 1.1 `POST /api/submit` — Piston bypass
- **File:** `backend/app/routers/problems.py`
- **Trigger:** env var `TEST_MODE=true` (set in `backend/.env`).
- **Behavior:** when TEST_MODE is true, the handler skips the Piston call entirely and fabricates a verdict:
  - If submitted code contains the substring `return` (any case) → `verdict="accepted"`, all test cases "passed".
  - Otherwise → `verdict="wrong_answer"`, zero passed.
- **Still real:** session_event row is still written to Supabase, mastery_scores still updated via BKT, LinUCB next-problem selection still runs. So the audience sees the pedagogical loop react.
- **Fake:** the verdict itself. No code is actually executed. `runtime_ms` is a canned number.
- **How to revert:** flip `TEST_MODE=false` in `backend/.env`. The bypass block guards on this flag only.

### 1.2 Fixes landed while in demo mode (NOT demo-mode specific — keep in prod)
- `backend/app/core/database.py` — added `get_supabase = get_supabase_admin` alias so `bkt.py` and `gemini.py` import cleanly.
- `backend/app/routers/problems.py` — `GET /api/problems` and `GET /api/problems/{id}` previously referenced `user.jwt` outside scope (NameError). Changed to use the public admin client, since the problems table is global and read-only for students. These are real fixes, not demo hacks.

### 1.3 Known-broken that demo mode hides
Any path through `submit_code` that calls the module-level helpers `get_problem`, `get_mastery_vector`, `get_recent_events`, `save_mastery`, `get_unsolved_problem` references `user.jwt` at module scope (NameError). The TEST_MODE short-circuit returns before these are reached. **Prod revert MUST refactor these helpers to accept the user object, before unsetting TEST_MODE.**

---

## 2. What is real in demo mode (unchanged, works end-to-end)

- `POST /api/auth/register` — real Supabase sign-up.
- `POST /api/auth/login` — real Supabase sign-in, sets `adaptcode_session` cookie.
- `POST /api/auth/logout` — real.
- `GET  /api/auth/me` — real.
- `GET  /api/mastery` — real Supabase read, falls back to empty mastery for a new user.
- `GET  /api/stats` and `/api/stats/heatmap` — real.
- `GET  /api/next-problem` — real LinUCB selection.
- `POST /api/start` — real session tracking row.
- `POST /api/abandon` — ⚠️ same NameError pattern as submit's helpers. Not called by UI yet; **unblock before prod revert**.
- `GET  /api/problems` + `/api/problems/{id}` — fixed, real.
- `GET  /api/explanation/{event_id}` — real poll; Gemini background task runs only when verdict != accepted, which under TEST_MODE "return" bypass means it fires for the "wrong_answer" branch.

---

## 3. Prod-revert checklist (what "we are back to production" means)

In order, no skipping:

1. **Fix Tailscale on local dev machine** → verify `curl http://100.114.155.33:2000/api/v2/runtimes` returns the Piston runtimes list.
2. **Refactor NameError helpers in `backend/app/routers/problems.py`:**
   `get_problem`, `get_mastery_vector`, `get_recent_events`, `save_mastery`, `get_unsolved_problem` — all take `jwt: str` (or `user: CurrentUser`) and pass through.
   Same for the body of `POST /api/abandon` (uses `server_time` which is also unbound inside that handler — fix too).
3. **Flip `TEST_MODE=false`** in `backend/.env` (and remove from any deploy env).
4. **Smoke test** `/api/submit` end-to-end against real Piston — must return a real verdict for both an accepted and a wrong-answer submission.
5. **Delete this file** (`docs/DEMO_MODE.md`) in the same commit that flips `TEST_MODE=false`, so the repo stops advertising a demo mode that no longer exists.

Only after step 5 may any of us claim the system is "fraud-free, hallucination-free, bluff-free production".

---

## 4. Honest limits of this demo mode

- The AI explanation for a wrong answer still calls Gemini. Rate limits or key errors will show as "pending" indefinitely to the user.
- The problem bank in Supabase must contain at least one problem per concept, or `next-problem` falls back to the first problem in the table.
- `TEST_MODE` is read via `os.environ.get("TEST_MODE")` in `submit_code` only — it does not currently affect any other handler. Any demo-mode behavior added later must be documented here in section 1.
