# AdaptCode — Architecture: As Built and Target

**Written:** 2026-11-16 · **Baseline commit:** `7bb0a96`
**Supersedes:** `docs/ARCHITECTURE.md` (dated 2026-09-23) for anything about
the deployed system. That older file still describes Piston on `localhost`.

Part A describes the system **as the code actually behaves today**. Part B is
the **target** the roadmap moves toward, with the phase that delivers each
change. Part C records the architectural decisions and the alternatives that
were rejected.

The stack itself does not change between A and B. What changes is where trust
sits, how writes are grouped, and what gets recorded.

---

## Part A — As built

### A.1 Deployment topology

```
                         Browser
                            │
        ┌───────────────────┼─────────────────────────────┐
        │ page, JS          │ XHR (credentials: include)  │ OAuth redirect only
        ▼                   ▼                             ▼
  Vercel (Next.js 14)   Cloud Run: adaptcode-backend   Supabase Auth
  adapt-code.vercel.app   asia-southeast1                (Google OAuth)
                          1 vCPU / 1 GiB, 0–5 instances
                          concurrency 40, timeout 60 s
                          one container: tailscaled (userspace) + uvicorn
                            │            │              │
              SOCKS5/HTTP proxy          │ HTTPS        │ HTTPS
              (tailnet only)             ▼              ▼
                            │        Supabase        Gemini API
                            ▼        PostgREST +     (flash-lite)
                     AWS EC2         direct Postgres
                     Piston :2000    (psycopg2, a few paths)
                     100.114.155.33
                     no public ingress
```

Facts worth holding on to:
- The page origin and the API origin are **different sites**. The session
  cookie is therefore a third-party cookie, set with `SameSite=None; Secure`
  in production (F-17).
- All outbound traffic from the container goes through the Tailscale proxy
  unless the host is in `NO_PROXY` (`entrypoint.sh`). Every new outbound
  dependency needs a `NO_PROXY` entry *and* a CSP entry on the frontend.
- The backend holds no state between requests except small in-process caches
  (JWKS, user-exists, slug map, BKT params). Each Cloud Run instance has its
  own copy.

### A.2 Components

| Component | Location | Responsibility today |
|---|---|---|
| Web app | `frontend/src/app/` | Pages, Monaco editor, hint display, mock fallback when the API is unreachable |
| API client | `frontend/src/lib/api.ts` | Typed fetch wrapper; throws `ApiOffline` / `ApiError` |
| Auth | `backend/app/routers/auth.py`, `core/dependencies.py` | Email/password via Supabase Auth, OAuth bridge, mints the `adaptcode_session` cookie (the Supabase access token), verifies it against JWKS per request |
| Submission pipeline | `backend/app/routers/problems.py` | Quota → load → execute → BKT → event → bandit → next problem → explanation task |
| Knowledge model | `backend/app/services/bkt.py` | Weighted-evidence BKT |
| Policy | `backend/app/services/linucb.py` | LinUCB over 5 pedagogical actions, 16-dim context |
| Prerequisites | `backend/app/services/prerequisites.py` | 12-concept DAG, threshold 0.85 |
| Sandbox client | `backend/app/services/piston.py` | Harness for Python/JS, one HTTP call per test case |
| Tutor | `backend/app/services/gemini.py` | Background explanation, 3-field JSON |
| Abuse controls | `services/login_lockout.py`, `services/submit_quota.py`, `core/rate_limit.py`, `services/turnstile.py` | Per-email lockout, per-user daily cap, per-IP SlowAPI, CAPTCHA (flag off) |
| Admin | `backend/app/routers/admin.py`, `frontend/src/app/admin/` | Problem CRUD with audit log |

### A.3 The submission pipeline as it actually runs

```
POST /api/submit {problem_id, code, language}          ← only these 3 fields arrive (F-01)
 1  check_submit_quota(user)            psycopg2, new connection, blocking
 2  resolve slug → uuid                 in-process cache, 300 s TTL
 3  load problem                        user-JWT client (see F-20)
 4  load mastery vector, last 5 events  user-JWT client
 5  run_test_cases                      N sequential Piston calls (F-14)
 6  read active_problem_state           server-side elapsed time, clamped to 3600 s
 7  w = compute_effective_weight        hint/attempt/compile inputs are defaults
 8  new_mastery = update_mastery        WRITE #1: mastery_scores upsert (user-JWT)
 9  find or create session              WRITE #2 (maybe)
10  insert session_event                WRITE #3; reward_signal column stores w
11  load global bandit row              fresh service-role client
12  x = build_context(post-update mastery, recent events)
13  action = select_action(x, allowed)  (+ escalation override → action 3)
14  reward = f(verdict of THIS problem)
15  agent.update(action, x, reward)     attribution issue (F-06)
16  upsert global bandit row            WRITE #4, whole JSON blob, no lock (F-07)
17  select_next_problem                 first unsolved row in bucket (F-09)
18  if not accepted: background task → Gemini → WRITE #5 explanations
```

Four to five independent writes over HTTP, no transaction (F-11). Every step
marked with a client call blocks the event loop (F-12).

### A.4 Data model as built

The authoritative schema is the **live database**, not `backend/schema.sql`
(F-21). From the code and migrations, the tables in use are:

| Table | Written by | Notes |
|---|---|---|
| `users` | backend (service role), owner update policy | `role`, `is_pro`, `display_name` |
| `problems` | admin routes, seed scripts | `test_cases` JSONB with `is_hidden`, `starter_code` JSONB incl. `_meta` (function name, parameters), `solution_code` |
| `sessions` | backend through user-JWT client | effectively one long session per user |
| `session_events` | backend through user-JWT client | one row per submit or abandon; no language, no code, no test counts |
| `mastery_scores` | backend through user-JWT client | `NUMERIC(4,3)`, unique `(student_id, concept_tag)` |
| `agent_state` | backend, service role | one sentinel row in practice |
| `active_problem_state` | backend through user-JWT client | start time per (student, problem) |
| `explanations` | background task, service role | unique per event |
| `bkt_params` | nobody (manual) | optional per-concept override |
| `login_attempts`, `audit_log`, `system_failures` | backend direct Postgres | RLS on, no policies |

Owner-scoped *write* policies exist on the learning-state tables because the
backend writes through the user's token (F-03).

### A.5 Trust boundaries as built

| Boundary | Today |
|---|---|
| Browser → API | Cookie (third-party), CORS allow-list, per-IP limit keyed on a header-derived address (F-18) |
| Browser → Supabase | Anon key + (for OAuth users) a real access token in browser storage; RLS is the only guard, and it permits owner writes to learning state |
| API → Supabase | Mixed: user-JWT client for most reads/writes, service role for some, direct Postgres for lockout/quota/audit |
| API → Piston | Tailnet only; no authentication on Piston itself; no concurrency cap |
| API → Gemini | API key; student code leaves the system |
| Student code → sandbox host | Piston's isolation; host-level hardening not documented in the repo |

### A.6 What is missing as a matter of architecture

- No second environment (F-22), no migration ledger (F-21), no backups (F-23).
- No record of *decisions* — only of outcomes. There is no way to reconstruct
  what the policy chose, in what context, and with what probability.
- No model versioning: if a formula changes, old and new mastery values are
  indistinguishable.
- No separation between "run my code" and "grade my submission" (F-35).
- No back-pressure anywhere between the public internet and a single small VM.

---

## Part B — Target architecture

### B.1 Topology (same boxes, different lines)

```
                         Browser
                            │  one origin: adapt-code.vercel.app (or the custom domain)
                            ▼
                  Vercel (Next.js 14)
                  ├─ pages / static
                  └─ rewrite  /api/*  ──────────────►  Cloud Run backend        [R2]
                       adds X-AdaptCode-Edge: <shared secret>
                       forwards the client address
                                                        │
              ┌──────────────────────┬──────────────────┼──────────────────┐
              ▼                      ▼                  ▼                  ▼
        Postgres (pooled)      Piston on EC2        Gemini           Sentry
        one RPC per learning   one call per        on demand,        (errors +
        event  [R1, R4]        submission [R3]     cached [R8]       fallback events)
              ▲
              │ nightly
     GitHub Actions: pg_dump → encrypted artifact [R0]
     GitHub Actions: model fitting + accuracy report [R6]
     GitHub Actions: uptime probe + free-tier usage check [R11]
```

What changed and why:

1. **Same-origin API (R2).** The browser only ever talks to the Vercel origin.
   Vercel rewrites `/api/*` to Cloud Run. The session cookie becomes
   first-party, so it can be `SameSite=Lax` (or `Strict`) and works in every
   browser. CORS and the `connect-src` exception for the backend disappear.
   Cloud Run rejects any request that lacks the shared edge header, so the
   public `run.app` URL stops being a second front door, and the client address
   comes from a header only the edge can set.
2. **The backend is the only writer of learning state (R1).** All owner-write
   RLS policies on `mastery_scores`, `session_events`, `agent_state`,
   `explanations`, `active_problem_state` and the new tables are removed.
   Owner **read** policies stay as defence in depth. The frontend's Supabase
   client remains for the OAuth redirect only.
3. **One atomic write per learning event (R1/R4).** The pipeline computes
   everything in Python, then calls a single Postgres function that writes the
   attempt, the mastery change, the decision outcome and the next decision in
   one transaction.
4. **One sandbox call per submission (R3)** with a concurrency gate in front.
5. **Scheduled, free compute for everything offline.** GitHub Actions cron jobs
   do backups, model fitting, evaluation reports, uptime probes and quota
   checks. Nothing offline runs on Cloud Run.

### B.2 Target request flows

**Run (new, R1/R3)** — executes visible examples only; never touches mastery.

```
POST /api/run {problem_id, code, language}
  quota (separate, more generous bucket) → sandbox gate → 1 Piston call
  → per-case results for the visible cases
  → record: attempt row with kind='run' (feeds server-side attempt counts)
```

**Submit (R1, R3, R5)**

```
POST /api/submit {problem_id, code, language, client_attempt_id}
 1  authenticate; idempotency check on client_attempt_id
 2  load in parallel (non-blocking): problem, mastery vector, open attempt
    state, the pending decision that served this problem (if any)
 3  sandbox gate → 1 Piston call for all tests → verdict + per-test detail
 4  derive telemetry SERVER-SIDE from the open attempt:
       runs so far, failed submits so far, compile errors so far,
       hint tiers revealed, elapsed time, whether already solved before
 5  knowledge model: evidence weight → new mastery (model version stamped)
 6  policy: close the pending decision with its reward;
            build the context; choose the next action with a logged
            probability; choose the item
 7  ONE transaction (record_submission RPC):
       insert attempt · upsert mastery · insert mastery_history ·
       update decision(outcome, reward) · apply bandit update under lock ·
       insert next decision · upsert problem_stats · close attempt state
 8  respond: verdict, per-test summary, mastery before/after,
             next problem + the reason it was chosen
 9  explanation: NOT automatic. The UI offers "Explain what went wrong";
    POST /api/explain/{attempt_id} checks a per-user daily budget and a
    cache keyed on (problem, failure signature) before calling Gemini  [R8]
```

**Hints (R1)**

```
GET  /api/problems/{id}/hints            → tiers available + unlock state (no bodies)
POST /api/problems/{id}/hints/{tier}     → returns the hint body, records the reveal
```

### B.3 Target data model (additions and changes)

Full DDL is in `IMPLEMENTATION.md` §2. Summary:

| Table | Change | Purpose | Phase |
|---|---|---|---|
| `attempts` (evolves `session_events`) | add `kind` (`run`/`submit`/`abandon`), `language`, `passed`, `total`, `runtime_ms`, `code_sha256`, `client_attempt_id` (unique), `is_first_solve`, `model_version` | Complete, server-derived record of every execution | R1 |
| `attempt_state` (evolves `active_problem_state`) | add counters: `runs`, `failed_submits`, `compile_errors`, `max_hint_tier`, `started_at timestamptz` | The server's own view of the work in progress | R1 |
| `hints` | new; `(problem_id, tier, body)` | Hints leave the frontend bundle | R1 |
| `hint_reveals` | new | Evidence of help used | R1 |
| `mastery_scores` | add `model_version`, `evidence_count`, `last_practiced_at` | Versioning, confidence, forgetting | R1/R6 |
| `mastery_history` | new, append-only | Recompute, charts, model evaluation | R1 |
| `bandit_decisions` | new: context, allowed actions, action, propensity, policy version, served problem, reward, rewarded_at | The decision log — the basis of all evaluation | R5 |
| `bandit_models` (replaces the sentinel row in `agent_state`) | per `(scope, policy_version)`, with a `version` counter | Safe concurrent updates, multiple policies side by side | R5 |
| `problem_stats` | new, one row per problem; maintained inside the RPC | No whole-table scan to show acceptance | R4 |
| `item_params` | new: per-problem difficulty estimate + uncertainty | Difficulty-aware evidence and item choice | R6 |
| `concept_params` (evolves `bkt_params`) | add `model_version`, `fitted_at`, `n_observations`, forgetting half-life | Fitted, versioned parameters | R6 |
| `problem_concepts` | new: `(problem_id, concept_tag, weight)` | A problem can exercise more than one concept | R6/R7 |
| `experiments`, `experiment_assignments` | new | Controlled comparisons | R12 |
| `schema_migrations` | via Supabase CLI | One ordered history | R0 |
| `profiles.leaderboard_opt_in` | new column on `users` | Consent | R1 |

Row-level security in the target state:

| Table group | anon | authenticated | service role |
|---|---|---|---|
| Learning state (attempts, mastery, decisions, hints revealed, attempt state) | none | **select own rows only** | all |
| Catalogue (`problems`, `hints`, `item_params`, `problem_concepts`) | none | none (served by the API, which strips hidden fields) | all |
| Models and params | none | none | all |
| Operational (`audit_log`, `login_attempts`, `system_failures`) | none | none | all |
| `users` | none | select own; update own display fields only | all |

### B.4 The adaptive engine, target shape

```
                ┌───────────────────────────────────────────────┐
                │                 Policy layer (R5)             │
                │  guards (prerequisites, mastery floors)       │
                │  → action choice (LinUCB + logged propensity) │
                │  → item choice within the action's bucket     │
                └───────────────▲───────────────┬───────────────┘
                     context    │               │ decision row
                                │               ▼
   ┌────────────────────────────┴───┐     ┌──────────────────────┐
   │   Knowledge model (R6)         │     │  bandit_decisions     │
   │  P(mastery) per concept        │     │  (context, action,    │
   │  + uncertainty (evidence count)│     │   propensity, reward) │
   │  + forgetting                  │     └──────────┬───────────┘
   └───────────────▲────────────────┘                │ nightly
        evidence   │                                 ▼
   ┌───────────────┴────────────────┐     ┌──────────────────────┐
   │  Evidence model (R1, R6)       │     │ Offline evaluation   │
   │  verdict × how it was achieved │     │ + parameter fitting  │
   │  × item difficulty             │     │ (GitHub Actions)     │
   │  × first solve vs repeat       │     └──────────────────────┘
   └───────────────▲────────────────┘
                   │ server-derived telemetry
              attempts / attempt_state / hint_reveals
```

Three layers with one-way dependencies: evidence → knowledge → policy. Each has
a version string stamped on what it writes. Each can be replaced without
touching the others, and each is a pure function that can be unit-tested with
no database (the database work is confined to the repository module and the
RPC).

Key behavioural changes (formulas in `IMPLEMENTATION.md` §4–§5):

- **Reward belongs to the decision that caused it.** A decision row is written
  when a problem is served; the reward is filled in when that problem's attempt
  ends (accepted, abandoned, or timed out by a sweep). Only then is the model
  updated, with the *context stored at decision time*.
- **Reward measures learning, not just a green tick.** A policy rewarded for
  acceptance learns to serve easy problems. The target reward combines the
  outcome with the change in predicted mastery and penalises abandonment, with
  the weights kept in configuration and versioned.
- **Exploration is explicit and recorded.** A small fixed fraction of decisions
  is uniformly random among allowed actions; every decision records the
  probability with which its action was chosen. This is what makes unbiased
  offline evaluation possible.
- **Guards stay hard-coded.** Prerequisite gating and "no harder until basic
  competence" remain rules outside the learned policy, as today. Overrides
  (the escalation rule) are recorded as `policy='override'` and are **not**
  used to train the bandit.
- **Item choice is its own step.** Within the bucket the action selects, choose
  by expected information: difficulty close to the student's level, not solved
  before, not seen recently, and — when the action is review — the item whose
  concept is most decayed.

### B.5 Backend internal structure (target)

```
backend/app/
  main.py                    wiring only
  core/
    config.py                typed settings, fail fast on missing prod config
    security.py              cookie, CSRF, edge-header check, client address
    db.py                    one pooled async Postgres access layer + PostgREST client reuse
    sandbox_gate.py          semaphore + queue-depth 503
    flags.py                 feature flags (env-driven)
  domain/                    PURE — no I/O, no framework imports
    evidence.py              telemetry → evidence weight
    knowledge.py             BKT update, forgetting, versioning
    policy.py                context, guards, LinUCB math, reward
    items.py                 item scoring within a bucket
    judge.py                 harness generation, output comparison, verdicts
  repo/                      ALL database access
    attempts.py  mastery.py  decisions.py  problems.py  users.py  stats.py
  services/                  outbound integrations
    piston.py  gemini.py  turnstile.py
  routers/                   thin: validate → call use-case → shape response
  usecases/
    run_code.py  submit.py  next_problem.py  reveal_hint.py  explain.py
```

The rule that makes this worth doing: **`domain/` imports nothing from
`repo/`, `services/` or FastAPI.** That is what allows the model and the judge
to be tested exhaustively in CI without Supabase or Piston — and that is what
resolves the reason the backend CI job was switched off.

This is a refactor by extraction, done incrementally as each phase touches a
file — not a rewrite. `problems.py` is split first (R1), because every later
phase edits it.

### B.6 Frontend target structure

- All network access stays in `lib/api.ts`; base path becomes relative
  (`/api/...`) after R2, so `NEXT_PUBLIC_API_URL` is only needed for local
  development against a non-proxied backend.
- API types are **generated** from the backend's OpenAPI document at build time
  in CI (the document is produced in the CI job, not served in production), so
  the frontend and backend cannot drift on request shapes again (this is how
  F-01 happened).
- The offline fallback remains (repo rule), with two changes: a visible
  "offline / demo data" banner whenever it is active, and a Sentry event on
  activation in production.
- Monaco is served from the app's own origin instead of a public CDN, which
  lets the CSP drop the CDN and, with nonces, `unsafe-inline` (R10).

### B.7 Environments and delivery

| | Local | Dev / staging | Production |
|---|---|---|---|
| Frontend | `next dev` | Vercel preview deployments | Vercel production |
| Backend | `uvicorn` | Cloud Run service `adaptcode-backend-dev` (scale to zero) | `adaptcode-backend` |
| Database | Supabase CLI local stack (Docker) | Supabase project #2 | Supabase project #1 |
| Sandbox | Piston container locally | same EC2 host, reached over the tailnet | same EC2 host |
| Secrets | `.env` files | Secret Manager (watch the free allowance — RISKS §3) | Secret Manager |

Migrations flow one way: written locally → applied to dev by CI → applied to
production by a manually triggered workflow that takes a backup first.
Deployments are Cloud Run revisions; rollback is routing traffic to the
previous revision.

### B.8 Observability target

- **Structured logs** with a request id propagated from the edge, the user id
  hashed, and the timing of each pipeline stage.
- **Four service indicators**: availability of `/api/health`, p95 latency of
  submit, sandbox reachability, explanation success rate.
- **Product indicators** computed nightly into a small table: active learners,
  submissions, acceptance rate, fallback activations, decision counts per
  action, model accuracy.
- **Alerts** to email: probe failures, any Sentry issue spike, free-tier usage
  above 70 %, any billed amount above zero, Tailscale key within 14 days of
  expiry, last backup older than 36 hours.

---

## Part C — Architecture decision records

Short form. Each is a decision this plan makes, the reason, and what was
rejected.

**ADR-01 — Proxy the API through the Vercel origin.**
*Because* a cross-site cookie is unreliable across browsers and forces
`SameSite=None`. *Rejected:* a custom domain with `api.` subdomain (costs
money unless a student-programme domain is obtained — if D9 delivers one, this
becomes the better long-term answer and the proxy remains as a fallback);
storing a token in browser storage (worse security than today).
*Cost:* rewritten requests count against Vercel's limits and inherit its proxy
timeout — which is why R3 must bring submit time well under it.

**ADR-02 — Service-role-only writes for learning state.**
*Because* a score the user can write is not a score. *Rejected:* keeping
user-token writes with stricter `WITH CHECK` clauses — a check cannot verify
that an "Accepted" row corresponds to code that actually passed.

**ADR-03 — One Postgres function per learning event.**
*Because* PostgREST has no multi-statement transactions and the pipeline needs
atomicity. *Rejected:* an ORM with a session (adds a large dependency and a
second way of talking to the database); compensating writes (complex and still
not atomic). The function takes fully computed values — **no model maths in
SQL** — so the algorithms stay in Python where they are tested.

**ADR-04 — Decision log with propensities, global model first.**
*Because* nothing about the policy can be evaluated or defended without it,
and a global model learns from all students where per-student models would
each start from nothing. *Rejected for now:* per-student matrices (data
starvation with a small user base). A per-student correction term can be added
later (D4) because the log supports replaying any policy.

**ADR-05 — Keep BKT, extend it; do not jump to deep knowledge tracing.**
*Because* BKT is interpretable, runs in closed form, needs little data, and is
explainable in an interview and to a student. *Rejected:* neural knowledge
tracing — needs far more data than this project will have for a long time and
would break the "no training infrastructure" property. R6 sets up the
evaluation harness so that any future model has to beat BKT on the same test.

**ADR-06 — Batch all tests into one sandbox execution.**
*Because* latency and sandbox load scale with HTTP round trips, not with test
count. *Rejected:* parallel calls per test (multiplies load on one small host).
*Cost:* a crash on one test must not hide the others — the driver isolates
each case and reports per-case results (IMPLEMENTATION §3).

**ADR-07 — GitHub Actions as the batch/cron platform.**
*Because* it is free for public repositories, already in use, and keeps
offline work off Cloud Run's metered CPU. *Rejected:* Cloud Scheduler + Cloud
Run jobs (consumes the free compute allowance); Supabase cron for model
fitting (wrong place for NumPy code).

**ADR-08 — Explanations on demand, cached.**
*Because* the free LLM quota is the scarcest resource in the system and many
failures are the same failure. *Rejected:* automatic explanation on every
failed submit (current behaviour) — it spends quota on students who did not
want it and fails for everyone once the day's quota is gone.

**ADR-09 — Refactor by extraction into `domain/`, `repo/`, `usecases/`.**
*Because* the single 580-line router is edited by every phase and cannot be
tested without live services. *Rejected:* a rewrite (loses working behaviour
and stalls everything else).

**ADR-10 — Keep the sandbox on its own host, behind the tailnet.**
Unchanged from today. Recorded here because it is the most important security
property of the system and must survive any future hosting change (RISKS §4).
