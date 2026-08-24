# AdaptCode — Master Implementation Plan (Detailed)

**This is the single, authoritative build plan.** It merges:
- the research-hardening work from `03_IMPLEMENTATION_PLAN.md` (correctness fixes, routing, evaluation harness), and
- the new product surface from `05_PRD.md` (onboarding, diagnostic escalation, complexity reasoning, code-quality analysis),

into one top-to-bottom sequence, grounded against the real repo (`backend/app/**`, `frontend/src/**`, `schema.sql`, `seed_db.py`, `simulator.py`).

**How to execute this.** Give one task at a time to your coding agent (Claude Code / Cursor) with this file plus `06_FULL_ARCHITECTURE_AND_TECH_STACK.md` as context. Every task has: exact files touched, what to change, and a **DONE-WHEN** verification gate. Do not advance until the gate passes. This *is* the "test and improve again and again" loop — it's built into every task, not bolted on at the end.

**Golden rules for the whole plan**
1. Work on a branch. Never commit to `main` until a phase gate passes.
2. Wrap, don't rewrite. The BKT and LinUCB math is correct — new behavior wraps the existing classes; it does not replace their internals.
3. One variable per experiment. When tuning anything the paper depends on, change one thing, re-run, record why.
4. Nothing user-facing may crash. Every new endpoint gets a top-level error guard from the moment it's written (the current `/execute` bug is the cautionary tale — see §P1).
5. Every new state-changing path logs success or failure visibly. No silent `except: pass`.

---

## Phase Overview & Dependency Order

```
P0  Safety net (branch, CI, backup)          ── blocks nothing, enables everything
P1  Correctness fixes (existing bugs)          ── must precede any data-generating work
P2  Routing decision + two-stage bandit        ── blocks P6 (eval must know what it measures)
P2.5 Onboarding flow (frontend-forward)         ── independent, can run parallel to P2
P3  Diagnostic escalation (FR-5)                ── depends on P1 (active_problem_state) + P2 (routing)
P4  Complexity reasoning (FR-6.2)               ── depends on P1; extends ai_tutor
P5  Code-quality analysis (FR-7)                ── independent service; depends on P1
P6  Offline evaluation harness (the paper)      ── depends on P2 (and P3 if diagnostics is in-scope for paper)
P7  Content depth (real user study only)         ── optional; depends on P1 validation script
P8  Visualization & admin UI                     ── independent; low risk
P9  Iterate / freeze for paper                    ── continuous loop after P6
```

---

# PHASE 0 — Safety Net

**Goal:** make every later change verifiable and cheap to undo.

### P0.1 — Working branch
- Create `git checkout -b build/adaptcode-v1`. All work lands here.
- **DONE-WHEN:** `git status` on `main` stays clean for the whole plan.

### P0.2 — Continuous Integration
- Add `.github/workflows/ci.yml`:
  - Job 1 (backend): `python 3.10`, `pip install -r backend/requirements.txt`, `cd backend && pytest`.
  - Job 2 (frontend): `node 18`, `cd frontend && npm ci && npm test`.
  - Trigger on `push` and `pull_request`.
- **DONE-WHEN:** a deliberately-failing throwaway test shows a red X in the Actions tab; removing it goes green.

### P0.3 — Resolve the duplicate compose file
- Two `docker-compose.yml` exist (repo root and `backend/`). Determine which brings up all three services correctly.
- Add a one-line header comment to the non-canonical one (`# NOT CANONICAL — use ../docker-compose.yml`) or delete it.
- **DONE-WHEN:** `docker compose up` from the documented canonical location brings up frontend + backend + Judge0 with no port conflicts.

### P0.4 — Database backup
- Snapshot the current Supabase schema + data before any migration or simulator work.
- **DONE-WHEN:** a restorable dump file exists locally and its restore has been tested against a scratch database once.

**PHASE GATE P0:** CI green on the branch; canonical compose documented; backup verified restorable.

---

# PHASE 1 — Correctness Fixes

These are live bugs (from `01_ANALYSIS.md`). They silently corrupt the very data every later phase and the paper depend on. Fix first.

### P1.1 — Guard `/execute` against empty/malformed test cases
**File:** `backend/app/routers/execution.py`
**Problem:** `is_correct`, `compile_errors`, `status_desc`, `result` are assigned only *inside* `for i, tc in enumerate(test_cases):`. If `test_cases == []`, the loop never runs and execution falls through to `if is_correct:` → `NameError`, surfaced as a raw 500.
**Change:**
- Immediately after fetching `test_cases`, add: if it's not a non-empty list, return a clean `HTTPException(status_code=422, detail="This problem has no valid test cases.")`.
- Initialize `is_correct = False`, `compile_errors = 0`, `status_desc = "No test cases"`, `result = {}` *before* the loop as defensive defaults.
- Wrap the whole `execute_code` body in a top-level `try/except` that logs with `{user_id, problem_id}` context and returns a structured error response (never a raw trace).
**DONE-WHEN:** new test `tests/test_execution.py::test_execute_empty_testcases` seeds a problem with `test_cases=[]`, calls `/execute`, asserts status 422 (not 500) and no stack trace in the body.

### P1.2 — DB-level guard so P1.1's state can't be re-seeded
**File:** new migration `backend/migrations/002_testcases_not_empty.sql` (do **not** edit the original `schema.sql`).
**Change:** `ALTER TABLE problems ADD CONSTRAINT problems_testcases_nonempty CHECK (jsonb_array_length(test_cases) > 0);`
**DONE-WHEN:** attempting to insert a problem with `test_cases='[]'::jsonb` is rejected at the DB layer; existing rows still validate (run a count before/after).

### P1.3 — Make silent DB-write failures visible
**File:** `backend/app/routers/execution.py` (the reward/LinUCB block, the BKT block, the event-insert block)
**Problem:** each is `try: ... except Exception as e: logger.error(...)` with no re-raise and no counter. A student's mastery/bandit update can silently vanish with no signal.
**Change:**
- Keep the try/except (a single failed update shouldn't 500 the whole submission), but:
  - Log at `WARNING` (not just error) with `{user_id, problem_id, stage}` so the failing stage is identifiable.
  - Increment a persisted counter: add a tiny `system_failures(stage TEXT, occurred_at TIMESTAMPTZ DEFAULT now(), context JSONB)` table via migration `003`, and insert a row on each swallowed failure.
- **DONE-WHEN:** a test that forces the LinUCB update to throw (monkeypatch `linucb_agent.update` to raise) confirms (a) the request still returns 200 with a valid grading result, and (b) a `system_failures` row with `stage='linucb_update'` was written.

### P1.4 — Fix the shared-scope `mastery_dict` hazard
**File:** `backend/app/routers/execution.py`
**Problem:** `mastery_dict` is assigned inside the reward/LinUCB `try`. The BKT block below references it. If the first block throws before assignment, the BKT block throws `NameError` and is also swallowed → double silent failure.
**Change:** initialize `mastery_dict = {}` before the reward block; have the BKT block fetch mastery independently if `mastery_dict` is empty rather than assuming the earlier block populated it.
**DONE-WHEN:** test monkeypatches the LinUCB block to throw *before* `mastery_dict` assignment; asserts the BKT update still runs against a freshly-fetched mastery value (verify `mastery_scores` upsert still happens).

### P1.5 — Resolve `users.hashed_password`
**Files:** `backend/app/routers/auth.py`, migration `004` if dropping.
**Problem:** column exists but auth is delegated to Supabase Auth; column appears unused.
**Change:** confirm via grep it's unreferenced; either wire a documented fallback or drop it via migration.
**DONE-WHEN:** grep shows zero live references, and whichever choice was made is reflected in schema + a one-line comment explaining why.

### P1.6 — Environment-gate the hardcoded CORS localhost
**Files:** `backend/app/main.py`, `backend/app/core/config.py`
**Problem:** `allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"]` always allows localhost, even in prod.
**Change:** add `DEBUG: bool` to settings; only append `http://localhost:3000` when `DEBUG` is true.
**DONE-WHEN:** with `DEBUG=false`, a test client request with `Origin: http://localhost:3000` is not granted CORS allow headers.

**PHASE GATE P1:** CI green including 5 new backend tests; all four migrations (002–004 + any) apply cleanly against the P0.4 backup restore.

---

# PHASE 2 — Routing Architecture (the core adaptivity)

This is the decision that determines whether "AdaptCode decides what you solve next" is literally true. Per PRD FR-3 and `02_ARCHITECTURE.md` §2.1.

### P2.1 — DECISION (human, not agent)
Choose:
- **Option A — two-stage concept+difficulty bandit** (recommended; matches the full product vision and is the stronger paper claim), or
- **Option B — reframe** as "BKT-gated unlocking + bandit difficulty calibration" (zero code change, weaker claim, ships today).

Write the decision as a docstring at the top of `services/linucb.py` so it's never ambiguous again.
**DONE-WHEN:** the decision is committed as a comment/docstring. *The rest of Phase 2 assumes Option A; if Option B, skip to Phase 2.5.*

### P2.2 — Build the two-stage router (Option A)
**File:** new `backend/app/services/router.py` — class `ConceptDifficultyRouter`.
**Design (wrap, don't rewrite):**
- Reuse `LinUCBAgent` unchanged for the difficulty stage.
- Add a concept-selection stage: either (a) one `LinUCBAgent` instance per unlocked concept for difficulty + a higher-level concept bandit, or (b) a single flattened bandit whose arm space is the currently-unlocked `(concept, difficulty)` pairs, using the existing `valid_actions_mask` mechanism (it already supports masking, so variable arm counts per call generalize naturally).
- Context vector stays the existing 16-dim vector.
**DONE-WHEN:** `tests/test_router.py` asserts, for a fixed context + seed, the router returns a *specific* `(concept, difficulty)` pair (not just difficulty), deterministically.

### P2.3 — Wire router into `/problem/next`
**File:** `backend/app/routers/problems.py`
**Change:** replace `random.choice(target_problems)` — concept is now chosen by the router; problem selection is deterministic within the chosen `(concept, difficulty)` cell (fall back to random *only* within genuinely-tied problems in the same cell).
**DONE-WHEN:** given a mocked router return + fixed seed, `/problem/next` returns a deterministic problem in a test; the "concept is random" behavior is provably gone.

### P2.4 — Per-concept agent state
**Files:** migration `005_agent_state_per_concept.sql`, `services/linucb.py` state I/O, `services/router.py`.
**Problem:** `agent_state` is `PRIMARY KEY (student_id)` only — one A/b set per student. Two-stage routing needs per-concept difficulty state.
**Change:** add `concept_tag` to `agent_state`'s key (composite PK `(student_id, concept_tag)`), or store a nested JSON keyed by concept. Migrate existing rows to a default concept bucket.
**DONE-WHEN:** test drives updates for two different concepts for one student and asserts their A/b matrices evolve independently.

### P2.5 — Reconcile docs with reality
**Files:** `README.md`, code comments referencing "Component 6: The Coach."
**Change:** update the Mermaid diagram + terminology to describe whichever option shipped, so no doc claim contradicts the code.
**DONE-WHEN:** a reader can predict what `/problem/next` returns from the README alone, correctly.

**PHASE GATE P2:** routing behavior matches the chosen option, proven by tests; no README/comment contradicts the code.

---

# PHASE 2.5 — First-Time Onboarding (PRD FR-8)

Frontend-forward; minimal backend. Can run in parallel with Phase 2.

### P2.5.1 — Onboarding endpoints
**File:** new `backend/app/routers/onboarding.py`, mounted in `main.py`.
- `GET /onboarding/topics` → returns the 12 concepts with their tier + default conservative mastery prior (from `bkt_doctor.p_prior`), plus prerequisite edges (from `PREREQUISITE_GRAPH`) so the frontend can render the map.
- `POST /onboarding/select` → body `{concept_tag, difficulty_level}`; seeds `mastery_scores` with conservative priors for the student if none exist; returns the first problem for that `(concept, difficulty)`. **Never blocks the pick** regardless of prerequisites (PRD §6.1) — but records it as a high-information first attempt.
**File:** migration `006_onboarding_state.sql` — `onboarding_state(student_id PK, first_concept TEXT, seeded BOOLEAN, created_at)`.
**DONE-WHEN:** a brand-new test user with zero history can hit both endpoints and receive a valid first problem; `mastery_scores` gets conservative priors; the pick is never rejected even for `(dynamic_programming, hard)`.

### P2.5.2 — Onboarding UI
**Files:** new `frontend/src/app/(app)/onboarding/page.tsx`, plus a topic-map component.
- Renders the 12-concept map (reuse the graph component from Phase 8 if built first; otherwise a simple grid for now).
- Concept pick → difficulty pick (easy/medium/hard) → routes into `/practice` with the returned problem.
- First-login detection: if `onboarding_state.seeded` is false, redirect here after login.
**DONE-WHEN:** manual QA — a fresh account lands on onboarding, picks a topic+difficulty, and reaches a problem in the practice IDE without any dead end.

**PHASE GATE P2.5:** new user → first problem in ≤ 2 clicks after login, no forced blocking, no unhandled error.

---

# PHASE 3 — Diagnostic Escalation (PRD FR-5)

The "picked hard, can't solve it, tell me *why* and what to review" feature. Depends on P1 (active_problem_state integrity) and P2 (routing to the redirect target).

### P3.1 — Struggle-threshold detection
**File:** new `backend/app/services/diagnostics.py` — `check_struggle_thresholds(student_id, problem_id, difficulty) -> bool`.
- Per-difficulty thresholds (config in `core/config.py`): e.g. `easy: {attempts: 4, hints: 2, minutes: 15}`, `medium: {attempts: 5, hints: 2, minutes: 20}`, `hard: {attempts: 6, hints: 3, minutes: 30}`. *(Provisional — tune in Phase 9; the open question in PRD §11.1.)*
- Reads attempts/hint/elapsed from `active_problem_state` + recent `session_events` for this `(student, problem)`.
**DONE-WHEN:** unit test with a synthetic attempt history crossing each threshold returns `True`; just under returns `False`.

### P3.2 — Root-cause tracing
**File:** `backend/app/services/diagnostics.py` — `trace_root_cause(student_id, concept_tag, attempt_history) -> Diagnosis`.
- Combine two signals:
  1. `prerequisites.get_weakest_unmastered_prerequisite(concept, mastery_dict)` (existing) — the mastery-score view.
  2. **Attempt-pattern analysis** over the student's code attempts on this problem: detect recurring structural failures (e.g. recursive attempts with no base case, repeated off-by-one on loop bounds, wrong container type). This is an AST/heuristic pass over the stored attempt code.
- Produce a **named** diagnosis object: `{suspected_gap_concept, evidence_summary, suggested_action}` — not a generic "you're struggling."
**DONE-WHEN:** the acceptance test from PRD FR-5: a synthetic student failing a `dynamic_programming/hard` problem 5× while never writing a base case yields a diagnosis naming `recursion` (the DAG prerequisite), with the base-case pattern cited as evidence.

### P3.3 — Diagnostic endpoint + integration into `/execute`
**Files:** `backend/app/routers/diagnostics.py` (`POST /diagnose/{problem_id}`), and a hook in `execution.py` that calls `check_struggle_thresholds` after each graded submission.
- If thresholds crossed, the `/execute` response includes a `diagnosis` block offering (never forcing) a redirect to a prerequisite problem selected via the Phase 2 router.
**DONE-WHEN:** an integration test simulates repeated failing submissions and asserts the `diagnosis` block appears exactly once thresholds are crossed, contains a named gap, and offers a redirect the student can decline.

### P3.4 — Frontend surfacing
**Files:** `frontend/src/components/AITutorPanel.tsx` (or a new `DiagnosticBanner.tsx`).
- Render the diagnosis as a distinct, non-blocking banner with an "Practice the prerequisite" action and a "Keep trying this one" dismiss.
**DONE-WHEN:** manual QA — crossing thresholds shows the banner; both actions work; dismissing keeps the student on the original problem.

**PHASE GATE P3:** the full struggle → named-diagnosis → optional-redirect loop works end-to-end, proven by one integration test + manual QA.

---

# PHASE 4 — Complexity Reasoning (PRD FR-6.2)

"Why did this time complexity occur" — not just reporting Judge0's wall-clock number. Extends `ai_tutor.py`.

### P4.1 — Static structural pass
**File:** new `backend/app/services/complexity.py` — `estimate_complexity(code, language) -> {big_o_estimate, structural_notes}`.
- AST-based (Python via `ast`; for other languages, start Python-only and mark others as "estimate unavailable" rather than guessing wrong): loop nesting depth, presence + branching of recursion, known-costly built-in calls.
- Produce a heuristic Big-O estimate + the structural facts that imply it. **Label as estimate, not proof.**
**DONE-WHEN:** unit tests: a single loop → O(n); nested loop → O(n²); a divide-and-conquer recursion → O(n log n) estimate, each with the structural note that justifies it.

### P4.2 — Explanation generation
**File:** `backend/app/services/ai_tutor.py` — `generate_complexity_explanation(code, problem, estimate)`.
- Prompt GLM-4-Flash with the code + the P4.1 heuristic estimate + problem description; ask for a plain-language explanation of *why this code's structure* yields that complexity, referencing the actual code (not a generic definition).
- Runs on **correct** submissions too, not only failures.
**DONE-WHEN:** the FR-6.2 acceptance test: for a correct O(n²) submission, the response explains *why* it's O(n²) by pointing at the nested iteration in the student's own code, not a textbook definition of O(n²).

### P4.3 — Wire into `/execute` response
**File:** `backend/app/routers/execution.py`
**Change:** on a compiling submission, attach `complexity_explanation` to the response (guarded — never let its failure break grading).
**DONE-WHEN:** integration test confirms the field is present on a correct submission and its absence/failure never 500s the request.

**PHASE GATE P4:** complexity explanations appear on both pass and fail for supported languages, reference the actual code, and are clearly labeled estimates.

---

# PHASE 5 — Code-Quality / Style Analysis (PRD FR-7)

Evaluates *how* the student wrote the code, independent of pass/fail. Never blocks submission.

### P5.1 — Structural pattern detector
**File:** new `backend/app/services/code_quality.py` — `analyze_style(code, language) -> [Observation]`.
- v1 = rule-based AST detection (no LLM cost): naming signals, nesting depth vs. early-return opportunities, reinvented built-ins (manual max instead of `max()`), factorable repeated blocks, concept-inappropriate idioms.
- Each observation is `{severity: info|suggestion, message, line_hint}`.
**DONE-WHEN:** the FR-7 acceptance test: two *both-passing* submissions — one idiomatic, one convoluted — produce materially different observation lists (the convoluted one flags specific patterns; the clean one returns few/none).

### P5.2 — Surface in response + UI
**Files:** `execution.py` (attach `style_observations`, guarded), `frontend/src/components/AITutorPanel.tsx` (a distinct "Code style" section, clearly non-blocking, framed as suggestions given the "never gatekeep" principle from PRD §6.1).
**DONE-WHEN:** manual QA — style feedback shows as a clearly-separate, dismissible suggestions section; it never affects the pass/fail verdict or the grade.

**PHASE GATE P5:** style analysis runs on every submission, differentiates clean vs. convoluted passing code, and is visibly non-gating.

---

# PHASE 6 — Offline Evaluation Harness (the paper's evidence)

Builds `research/` — isolated from live Supabase. This is what turns "it works" into "here are the numbers." Depends on P2 (must know the action space it's measuring); extend to P3 if diagnostics is in the paper's scope.

### P6.1 — Synthetic student environment
**File:** `research/env.py` — hidden per-concept ability vector, ZPD-based stochastic `P(correct | difficulty, ability, zpd_distance)`, `.step(action) -> (reward, observed_signals)`. Document every generative assumption (this becomes the paper's "Simulation Environment" subsection).
**DONE-WHEN:** two fixed-seed runs of the env alone produce identical trajectories.

### P6.2 — In-memory DB stub
**File:** `research/db_stub.py` — implements the exact subset of the Supabase client interface that `BKTDoctor`/`LinUCBAgent` call (`.table().select().eq().execute()`, `.upsert().execute()`), so the **real production classes run unmodified** with zero network.
**DONE-WHEN:** the real `LinUCBAgent` runs `select_action`/`update` against the stub with a monkeypatched socket that raises on any network access — and nothing raises.

### P6.3 — Agents (baselines + the real one)
**File:** `research/agents/` — `random_agent.py`, `fixed_curriculum_agent.py`, `epsilon_greedy_agent.py` (baselines), `linucb_agent.py` (thin wrapper over the real `app.services` classes via the stub). All share one `select_action`/`update` interface.
**DONE-WHEN:** `run_experiment.py` can swap any agent by name with no other change.

### P6.4 — Experiment runner
**File:** `research/run_experiment.py` — CLI `--agents --students --sessions --seed`. Same seed → identical synthetic student population across all agents (fair comparison). Writes `results/<timestamp>/<agent>.csv` (one row per student×session: action, reward, true mastery, observed mastery).
**DONE-WHEN:** two runs with the same `--seed` produce byte-identical CSVs.

### P6.5 — Metrics
**File:** `research/metrics.py` — cumulative reward, cumulative regret vs. an oracle (best-action-from-ground-truth), convergence episode, and a significance test (Mann-Whitney U) of LinUCB's final-mastery distribution vs. each baseline. Emits `summary.json`.
**DONE-WHEN:** `summary.json` is produced; sanity holds (regret non-negative, non-decreasing).

### P6.6 — Plots
**File:** `research/plots.py` — regret curve, mastery-growth curve, arm-selection-over-time, all agents overlaid; reads CSVs only (no re-run).
**DONE-WHEN:** `figures/*.png` regenerate from a finished run's CSVs alone.

### P6.7 — Full sweep + honest sanity check
- Run 100 synthetic students × 30 sessions × 4 agents. **Look at the output by hand** before trusting it: does LinUCB actually beat random and fixed-curriculum on cumulative reward and final mastery? If not, that's a real finding to investigate — do not paper over it.
**DONE-WHEN:** you have reviewed `summary.json` + figures and can defend every number, including any mixed results.

### P6.8 — Reproducibility doc
**File:** `research/README.md` — one command to regenerate every figure; what each `env.py` assumption means for external validity (what a reviewer should be skeptical of).
**DONE-WHEN:** someone who has never seen the repo regenerates all figures from the documented command alone.

**PHASE GATE P6:** `results/`, `summary.json`, `figures/` exist, are reproducible from a seed, and you understand every number in them.

---

# PHASE 7 — Content Depth (optional — real user study only)

### P7.1 — Decide if a real pilot is needed
Simulated evaluation (P6) may be sufficient for the paper; a real pilot needs more content. Human decision.

### P7.2 — Expand the bank
**File:** `backend/seed_db.py` — 5 → 15–20 problems per concept (180–240 total), same easy/medium/hard split and test-case format, so nothing downstream changes.
**DONE-WHEN:** problem-count assertion passes; 5 new problems verified to compile against their own `solution_code` in Judge0.

### P7.3 — Authoring validation script
**File:** `backend/scripts/validate_problems.py` — asserts every problem has non-empty test cases and that `solution_code` actually produces each `expected_output` when run. Prevents the P1.1 bug class as content grows.
**DONE-WHEN:** script over all problems returns zero violations; wired into CI.

---

# PHASE 8 — Visualization & Admin UI

### P8.1 — Knowledge-graph visualization
**Files:** add `recharts` to `frontend/package.json`; new component rendering the 12-concept DAG with mastery-driven fill + unlock state, consuming existing `/api/mastery` (no backend change).
**DONE-WHEN:** unlocking a concept in the DB visibly changes the rendered graph on next load.

### P8.2 — Admin page (or remove the orphan)
**Files:** new `frontend/src/app/(app)/admin/page.tsx` consuming existing `/api/admin/*`, **or** remove `admin.py` + its mount if unused.
**DONE-WHEN:** either `/admin` renders real data (role-gated), or `/api/admin/*` now 404s and a test proves the endpoints are gone.

### P8.3 — Full-suite regression
**DONE-WHEN:** backend + frontend + any research-layer tests you added to CI all green end-to-end.

---

# PHASE 9 — Iterate & Freeze (continuous)

Repeat as long as you're actively refining the paper/product:
1. Pick the weakest current claim (paper or product).
2. Find the exact figure/number meant to support it.
3. Change **one** variable — a bandit `alpha`, a reward constant in `execution.py`, a struggle threshold from P3.1, an `env.py` assumption — re-run P6.7, record what moved and why in `research/CHANGELOG.md`.
4. Never more than one variable per run.
5. Once claims stabilize, **freeze**: record the exact commit hash + seed + command that produced the final figures, and cite that hash in the paper's reproducibility statement.

---

## Fast-Path (if the deadline is tight)

Minimum defensible product + paper without the heaviest lifts:

```
P0 (all) → P1 (1.1, 1.3, 1.4) → P2.1 = Option B (no bandit rewrite)
   → P2.5 (onboarding) → P4 (complexity) OR P5 (style) — pick the one that
   best sells the "why, not just what" thesis → P6 (all — the evidence)
   → P8.1 (one figure) → P9
```

This yields correctness, the "explains why" differentiator, onboarding, and real evaluation numbers — deferring the two-stage bandit (P2 Option A), diagnostics (P3), and content expansion (P7), all of which are valuable but not blocking for a first defensible release.

---

## Task Index (for handing to a coding agent one at a time)

| ID | Title | Files (primary) | Gate |
|---|---|---|---|
| P0.1 | Branch | git | main clean |
| P0.2 | CI | `.github/workflows/ci.yml` | red→green demonstrated |
| P0.3 | Compose dedupe | `docker-compose.yml`×2 | clean `up` |
| P0.4 | DB backup | — | restore tested |
| P1.1 | Guard empty test cases | `execution.py` | 422 not 500 |
| P1.2 | DB non-empty constraint | migration 002 | insert rejected |
| P1.3 | Visible write failures | `execution.py` + migration 003 | failure row written |
| P1.4 | mastery_dict scope | `execution.py` | BKT still runs |
| P1.5 | hashed_password | `auth.py` / migration 004 | no dead refs |
| P1.6 | CORS gate | `main.py`, `config.py` | localhost rejected in prod |
| P2.1 | Routing decision | `linucb.py` docstring | committed |
| P2.2 | Two-stage router | `router.py` | deterministic (concept,diff) |
| P2.3 | Wire router | `problems.py` | random gone |
| P2.4 | Per-concept state | migration 005, `linucb.py` | independent A/b |
| P2.5 | Docs reconcile | `README.md` | no contradiction |
| P2.5.1 | Onboarding API | `onboarding.py`, migration 006 | first problem served |
| P2.5.2 | Onboarding UI | `onboarding/page.tsx` | ≤2 clicks to problem |
| P3.1 | Struggle thresholds | `diagnostics.py`, `config.py` | boundary test |
| P3.2 | Root-cause trace | `diagnostics.py` | names recursion |
| P3.3 | Diagnose endpoint | `diagnostics.py`, `execution.py` | banner once |
| P3.4 | Diagnostic UI | `DiagnosticBanner.tsx` | both actions work |
| P4.1 | Complexity static pass | `complexity.py` | O(n)/O(n²)/O(n log n) |
| P4.2 | Complexity explanation | `ai_tutor.py` | cites actual code |
| P4.3 | Wire complexity | `execution.py` | present, non-breaking |
| P5.1 | Style detector | `code_quality.py` | clean vs convoluted differ |
| P5.2 | Style UI | `AITutorPanel.tsx` | non-gating |
| P6.1 | Sim env | `research/env.py` | seed-deterministic |
| P6.2 | DB stub | `research/db_stub.py` | no network |
| P6.3 | Agents | `research/agents/` | swappable |
| P6.4 | Experiment runner | `research/run_experiment.py` | identical CSVs on seed |
| P6.5 | Metrics | `research/metrics.py` | summary.json sane |
| P6.6 | Plots | `research/plots.py` | figures from CSVs |
| P6.7 | Full sweep | — | human-reviewed |
| P6.8 | Repro doc | `research/README.md` | regenerable by stranger |
| P7.2 | Expand bank | `seed_db.py` | count + compile check |
| P7.3 | Validate script | `scripts/validate_problems.py` | zero violations, in CI |
| P8.1 | Graph viz | `frontend` + recharts | reflects unlocks |
| P8.2 | Admin UI | `admin/page.tsx` | renders or removed |
| P8.3 | Regression | — | all green |
| P9 | Iterate/freeze | `research/CHANGELOG.md` | commit+seed frozen |
