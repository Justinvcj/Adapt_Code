# AdaptCode — Full Architecture & Tech Stack

**Single-source reference.** Consolidates `02_ARCHITECTURE.md` (current + research-hardening target) and `05_PRD.md` (new product surface: onboarding, diagnostic escalation, complexity reasoning, code-quality analysis) into one top-to-bottom system view. Everything marked **[BUILT]** exists in the repo today; **[PLANNED]** comes from the implementation plan; **[NEW]** comes from the PRD and does not exist yet in any form.

---

## 1. Tech Stack

| Layer | Technology | Status | Notes |
|---|---|---|---|
| **Frontend framework** | Next.js 14 (App Router), React 18, TypeScript | BUILT | `frontend/src/app/**` |
| **Styling** | Tailwind CSS | BUILT | |
| **Code editor** | Monaco Editor (`@monaco-editor/react`) | BUILT | In-browser IDE, syntax highlighting |
| **Frontend UX libs** | Framer Motion (animation), Lucide React (icons), react-hot-toast (notifications), react-markdown + rehype-sanitize (rendering problem descriptions/explanations safely) | BUILT | |
| **Frontend charting** | Recharts | PLANNED | Knowledge-graph + mastery visualization, no backend change needed |
| **Frontend testing** | Jest, React Testing Library | BUILT (minimal coverage) | `frontend/__tests__`, one page under test |
| **Backend framework** | FastAPI (Python), Uvicorn (ASGI server) | BUILT | `backend/app/` |
| **Validation / schemas** | Pydantic v2 | BUILT | `models/schemas.py` |
| **HTTP client (server→services)** | httpx (async) | BUILT | Calls to Judge0, Supabase Auth |
| **Rate limiting** | SlowAPI | BUILT | Per-route limits (`core/rate_limit.py`) |
| **Numerical computing** | NumPy | BUILT | LinUCB matrix math |
| **Database** | Supabase (hosted/self-hostable PostgreSQL) | BUILT | `users`, `problems`, `sessions`, `session_events`, `mastery_scores`, `agent_state`, `active_problem_state` |
| **Auth** | Supabase Auth (JWT), dev-token bypass in `TEST_MODE` | BUILT | `core/dependencies.py` |
| **Code execution sandbox** | Judge0 (self-hosted, Docker) | BUILT | Multi-language isolated execution/grading |
| **AI tutoring / explanation LLM** | ZhipuAI GLM-4-Flash | BUILT | `services/ai_tutor.py` — 3-part failure explanation |
| **AI tutoring — complexity reasoning** | Same LLM path (GLM-4-Flash) or lightweight static analysis (AST-based loop/recursion-depth detection) | NEW | See §4.5 |
| **AI/heuristic — code-style analysis** | Rule-based pattern detection (AST-based) as v1, optional LLM-based review as v2 | NEW | See §4.6 |
| **Containerization** | Docker, Docker Compose | BUILT | `docker-compose.yml` (backend + frontend + Judge0) |
| **Backend testing** | Pytest, pytest-asyncio | BUILT (minimal, mocked) | `backend/tests/` |
| **CI** | GitHub Actions | PLANNED | Runs pytest + jest on every push/PR |
| **Research / evaluation** | Pure Python (NumPy, Matplotlib, SciPy for significance tests), in-memory DB stub — zero live-DB dependency | PLANNED | `research/` package, isolated from production Supabase |
| **Adaptive algorithms** | Bayesian Knowledge Tracing (custom, continuous-evidence variant); LinUCB contextual bandit (disjoint, per-student, ridge regression) | BUILT | `services/bkt.py`, `services/linucb.py` |
| **Prerequisite modeling** | Static DAG (12 concepts, 3 tiers) | BUILT | `services/prerequisites.py` |
| **Deployment target** | Any Docker-capable host (self-hosted or cloud VM) + Supabase (cloud or self-hosted) | BUILT | No proprietary/paid-only dependency (NFR-6 in PRD) |

**Stack philosophy (per PRD NFR-6):** every load-bearing component is open-source or free-tier-capable — FastAPI, Next.js, PostgreSQL/Supabase, Judge0, and an LLM path that does not require paid-only access at production scale. No component here is a hard proprietary dependency.

---

## 2. Top-to-Bottom Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 0 — CLIENT (Browser)                                              │
│  Next.js 14 App Router, server + client components, Monaco in-browser    │
└──────────────────────────────────┬───────────────────────────────────────┘
                                    │ HTTPS, Bearer JWT (Supabase session token)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 1 — FRONTEND APPLICATION (frontend/src)                           │
│                                                                            │
│  app/                                                                     │
│   ├─ login/, register/                       Auth pages          [BUILT] │
│   ├─ (app)/dashboard/                        Mastery overview     [BUILT]│
│   ├─ (app)/practice/                         Monaco IDE + judge   [BUILT]│
│   ├─ (app)/history/                          Submission log       [BUILT]│
│   ├─ (app)/onboarding/                       Topic-map first-run  [NEW]  │
│   ├─ (app)/admin/                            Role-gated ops view  [PLANNED]│
│   └─ (app)/knowledge-graph component          Visual concept DAG   [PLANNED]│
│                                                                            │
│  components/  CodeEditor · ProblemPanel · AITutorPanel · ErrorBoundary   │
│  lib/  api.ts (typed fetch client) · auth-context.tsx (session state)   │
└──────────────────────────────────┬───────────────────────────────────────┘
                                    │ REST (JSON), all requests via lib/api.ts
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 2 — EDGE / MIDDLEWARE (backend/app/main.py + core/)               │
│                                                                            │
│   SecurityHeadersMiddleware   (X-Frame-Options, CSP, HSTS, etc.)  [BUILT]│
│   CORSMiddleware               (origin allowlist, credentials)    [BUILT]│
│   SlowAPI rate limiting        (per-route: 5–30 req/min)          [BUILT]│
│   get_current_user()           (JWT verification via Supabase     [BUILT]│
│                                  Auth API, or DEV_TOKEN_* bypass                │
│                                  when TEST_MODE=true)                          │
└──────────────────────────────────┬───────────────────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 3 — API ROUTERS (backend/app/routers)                             │
│                                                                            │
│   auth.py         POST /register, /login                          [BUILT]│
│   problems.py      GET /problem/next   (adaptive selection)       [BUILT]│
│                     GET /hint/{id}                                 [BUILT]│
│                     GET /problems                                  [BUILT]│
│   execution.py     POST /execute        (graded run)              [BUILT]│
│                     POST /execute_custom (scratch run)            [BUILT]│
│   mastery.py        GET /mastery        (per-concept + unlocks)   [BUILT]│
│   session.py         POST /session/start, /session/end            [BUILT]│
│   stats.py           GET /stats         (streak, solved, avg)     [BUILT]│
│   history.py          GET /history       (paginated events)        [BUILT]│
│   admin.py             GET /admin/users, /admin/stats  (role-gated)[BUILT, no UI]│
│   onboarding.py         GET /onboarding/topics                     [NEW]  │
│                          POST /onboarding/select                   [NEW]  │
│   diagnostics.py         POST /diagnose/{problem_id}  (struggle    [NEW]  │
│                          escalation trigger + root-cause response)         │
└──────────────────────────────────┬───────────────────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 4 — DOMAIN SERVICES (backend/app/services)                        │
│                                                                            │
│   prerequisites.py                                                        │
│     PREREQUISITE_GRAPH (12 concepts, DAG)                          [BUILT]│
│     CONCEPT_TIERS (3 tiers → BKT param sets)                       [BUILT]│
│     can_access_concept() / get_weakest_unmastered_prerequisite()  [BUILT]│
│                                                                            │
│   bkt.py — BKTDoctor                                                      │
│     calculate_effective_correctness()  (folds in hints/attempts/  [BUILT]│
│       compile-errors/time, not just pass-fail)                            │
│     update_mastery()  (continuous-evidence Bayesian update,       [BUILT]│
│       tiered P(learn)/P(guess)/P(slip))                                   │
│                                                                            │
│   linucb.py — LinUCBAgent                                                 │
│     select_action()  (UCB arm selection, 16-dim context,          [BUILT]│
│       masked by prerequisite validity)                                    │
│     update()  (ridge-regression parameter update per arm)         [BUILT]│
│     Current arm space: {easy, medium, hard} ONLY — concept choice  [PARTIAL]│
│       within the chosen difficulty is still random.select()               │
│     Target: ConceptDifficultyRouter — two-stage bandit             [PLANNED]│
│       (concept-selection stage + difficulty stage), see              │
│       `02_ARCHITECTURE.md` §2.1 Option A                                  │
│                                                                            │
│   ai_tutor.py                                                             │
│     generate_explanation()  (3-part: what/why/what-to-review,     [BUILT]│
│       Zhipu GLM-4-Flash, on failed submissions)                           │
│     generate_complexity_explanation()  (NEW — reasons about the    [NEW]  │
│       submitted code's structure to explain WHY its measured              │
│       runtime/memory came out the way it did, on success too)            │
│                                                                            │
│   code_quality.py  (NEW)                                                  │
│     analyze_style()  — AST-based structural pattern detection:     [NEW]  │
│       naming, nesting depth, idiom usage, reinvented built-ins,           │
│       factorable repetition. Runs independent of pass/fail,               │
│       never blocks submission.                                            │
│                                                                            │
│   diagnostics.py  (NEW)                                                   │
│     check_struggle_thresholds()  — per-difficulty attempt/hint/    [NEW]  │
│       time thresholds against active_problem_state                       │
│     trace_root_cause()  — combines weakest-prerequisite lookup     [NEW]  │
│       (existing prerequisites.py) with attempt-history pattern            │
│       analysis (e.g. recurring missing-base-case pattern) to             │
│       produce a NAMED diagnosis, not a generic message                   │
└──────────────────────────────────┬───────────────────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 5 — EXTERNAL SERVICES                                             │
│                                                                            │
│   Judge0 (Docker container)              Multi-language sandboxed  [BUILT]│
│                                            execution + grading             │
│   Supabase Auth API                       JWT issuance/verification[BUILT]│
│   Zhipu AI API (GLM-4-Flash)              LLM explanation generation[BUILT]│
└──────────────────────────────────┬───────────────────────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  LAYER 6 — DATA (Supabase / PostgreSQL)                                  │
│                                                                            │
│   users                  auth-linked profile, role (student/admin) [BUILT]│
│   problems                title, description, concept_tag,         [BUILT]│
│                            difficulty_level, test_cases (JSONB),           │
│                            hint_text, solution_code/explanation           │
│   sessions                 per-login-session grouping               [BUILT]│
│   session_events            one row per submission — the raw         [BUILT]│
│                            dataset for BKT/LinUCB AND for the paper        │
│   mastery_scores            per-student per-concept P(mastery)      [BUILT]│
│   agent_state                per-student LinUCB A-matrices/b-vectors[BUILT]│
│                            → needs per-concept keying if the        [PLANNED]│
│                              two-stage router (Layer 4) ships              │
│   active_problem_state       per-(student,problem) start_time,      [BUILT]│
│                            hint_used — feeds struggle-threshold           │
│                            detection for diagnostics.py                   │
│   onboarding_state (NEW)      first-login topic pick, conservative   [NEW]  │
│                            prior-seeding flag                             │
└────────────────────────────────────────────────────────────────────────-─┘
```

---

## 3. Offline / Research Layer (parallel to the production stack, no shared runtime dependency)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  research/  — closes the "evaluation evidence" gap for the paper          │
│                                                                            │
│   env.py             Synthetic student model (hidden ability vector,      │
│                       stochastic P(correct | difficulty, true ability))   │
│   db_stub.py          In-memory Supabase-interface-compatible stub —      │
│                       lets the REAL BKTDoctor/LinUCBAgent run unmodified  │
│                       with zero network/DB dependency                     │
│   agents/              linucb_agent.py (wraps the real production agent), │
│                       random_agent.py, fixed_curriculum_agent.py,          │
│                       epsilon_greedy_agent.py (baselines)                  │
│   run_experiment.py    CLI sweep across agents × synthetic students ×      │
│                       sessions, seeded and reproducible                   │
│   metrics.py            Cumulative regret, mastery-growth curves,          │
│                       convergence episode, significance testing          │
│   plots.py               Figures straight from experiment CSVs — these    │
│                       become the paper's Results figures                  │
└──────────────────────────────────────────────────────────────────────────┘
```

This layer imports `app.services.bkt.BKTDoctor` and `app.services.linucb.LinUCBAgent` directly (via the `db_stub`), so results describe the *actual production algorithm*, not a re-implementation — this is what makes the evaluation externally valid.

---

## 4. Core Data Flows

### 4.1 Submission → Grading → Adaptive Update (steady state) [BUILT]

```
Student submits code
  → POST /execute (rate-limited 5/min)
  → Judge0 runs against each test_case sequentially, stops at first failure
  → is_correct, compile_errors, status_desc, execution_time, memory derived
  → reward computed: base_reward(difficulty) − hint_penalty − time_penalty
  → LinUCBAgent.update(action=difficulty_index, context=16-dim vector, reward)
        A[action] += outer(context, context);  b[action] += reward·context
  → BKTDoctor.update_mastery(current_mastery, effective_correctness, concept)
  → session_events row inserted (raw dataset)
  → IF incorrect: ai_tutor.generate_explanation() → 3-part causal explanation
  → IF correct:  ai_tutor.generate_complexity_explanation() [NEW] → why this
                  runtime/memory resulted from this code structure
  → code_quality.analyze_style() [NEW] → structural feedback, independent
                  of pass/fail, appended to the response either way
```

### 4.2 Next-Problem Selection [BUILT → PLANNED upgrade]

```
GET /problem/next
  → fetch mastery_scores → filter problems by can_access_concept()
  → build 16-dim context vector (12 static mastery + 4 dynamic behavioral)
  → [BUILT]    LinUCBAgent.select_action() → difficulty only
                → random.choice(valid problems at that difficulty)
  → [PLANNED]  ConceptDifficultyRouter.select_action() → (concept, difficulty)
                → deterministic problem selection within that pair
  → active_problem_state upserted (start_time, hint_used=False)
```

### 4.3 First-Time Onboarding [NEW]

```
First login → GET /onboarding/topics
  → returns the 12-concept map with conservative default mastery priors
  → student picks concept + difficulty (never blocked, regardless of
    prerequisite state — see PRD §6.1)
POST /onboarding/select
  → seeds mastery_scores with conservative priors if none exist
  → routes directly to the chosen (concept, difficulty) problem
  → flags this as a high-information first data point internally
```

### 4.4 Struggle → Diagnostic Escalation [NEW]

```
On each /execute call, diagnostics.check_struggle_thresholds() evaluates
active_problem_state (attempts, hint_used, elapsed time) against
per-difficulty thresholds
  IF thresholds crossed:
    → diagnostics.trace_root_cause():
        1. prerequisites.get_weakest_unmastered_prerequisite(concept)
        2. pattern-analyze the student's attempt history on THIS problem
           (recurring missing-base-case, off-by-one, wrong data
           structure choice, etc.)
    → response includes a NAMED diagnostic message + an offer (not a
      requirement) to redirect to the identified prerequisite problem
```

### 4.5 Complexity Reasoning [NEW]

```
On a correct (or even incorrect-but-compiling) submission:
  → static AST pass over submitted code: loop nesting depth, recursion
    presence + branching factor, data structure operations used
  → heuristic complexity estimate derived from the AST pass
  → LLM prompt (Zhipu GLM-4-Flash) given the code + the heuristic
    estimate + the problem description, asked to produce a plain-
    language explanation of WHY that complexity resulted from THIS
    code's structure — explicitly labeled as an estimate, not a
    formally verified bound
```

### 4.6 Code-Quality / Style Analysis [NEW]

```
On every submission (correct or not):
  → AST-based pattern detection (v1, no LLM cost):
      - naming conventions
      - nesting depth vs. early-return opportunities
      - reinvented built-ins (e.g. manual max-tracking instead of max())
      - repeated logic blocks that could be factored
  → optional LLM-based deeper review (v2) for nuanced idiom feedback
  → surfaced as a distinct feedback section, never gating submission
```

---

## 5. Deployment Architecture

```
┌───────────────────────────────────────────────────────────────┐
│  Docker Compose (single host, or split across hosts in prod)   │
│                                                                  │
│   frontend container   Next.js production build, port 3000     │
│   backend container    FastAPI + Uvicorn, port 8000             │
│   judge0 containers    Judge0 server + workers + its own        │
│                        Postgres/Redis (per Judge0's own compose)│
└───────────────────────────────┬─────────────────────────────────┘
                                 │
                                 ▼
                    Supabase (cloud project, or self-hosted
                    via Supabase's own Docker distribution)
                    — Postgres + Auth, external to this compose file
```

All four core services (frontend, backend, Judge0, Supabase) are independently self-hostable on open-source infrastructure, satisfying PRD NFR-6. The only external network dependency at runtime is the Zhipu AI API call for explanation generation — everything else can run fully offline/on-prem if required.

---

## 6. Summary: What's Real vs. What's Planned vs. What's New

| Status | Meaning | Count of major components |
|---|---|---|
| **BUILT** | Exists in the repo today, verified by reading the code | Auth, prerequisite graph, BKT, LinUCB (difficulty-only), 8 API routers, Judge0 integration, AI 3-part explanation, dashboard/practice/history UI, Docker Compose, minimal test suite |
| **PLANNED** | Not built yet, but scoped in `03_IMPLEMENTATION_PLAN.md` to close correctness/evaluation gaps | Two-stage concept+difficulty router, `research/` evaluation harness, CI, knowledge-graph visualization, admin UI, expanded problem bank |
| **NEW** | Not built, not previously planned — introduced by `05_PRD.md`'s expanded product vision | Onboarding flow, diagnostic-escalation system, complexity-reasoning explanations, code-quality/style analysis |
