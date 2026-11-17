# AdaptCode — Phases R0 to R13

**Written:** 2026-11-16 · **Baseline commit:** `7bb0a96`

How to read a phase:
- **Goal** — the one sentence that is true when the phase is done.
- **Addresses** — audit finding IDs (`F-xx`; detail in the local-only
  `AUDIT_FINDINGS.md`).
- **Tasks** — numbered `Rn.m`. Each names its owner role (see
  `TEAM_PLAYBOOK.md`), the paths it touches, and how to know it is finished.
- **Exit criteria** — all must hold before the phase is ticked.
- **Not in this phase** — things that look related and are deliberately left.

Roles: **LEAD** tech lead / integrator · **BE** backend · **ML** adaptive
engine · **SBX** sandbox and infrastructure · **FE** frontend · **DATA**
database · **QA** quality · **SEC** security · **OPS** operations · **CONTENT**
curriculum · **RES** research and evaluation.

Status legend: ☐ not started · ◐ in progress · ☑ done. Update the status line
of each phase as it moves.

---

## R0 — Truth and safety baseline

**Status:** ☐ · **Size:** ~1 week · **Depends on:** nothing

**Goal.** We know exactly what is running in production, we can restore it if
we break it, and there is one place that defines the schema.

**Addresses.** F-20, F-21, F-22, F-23, F-24, F-26, F-32, F-33, plus
verification of every item marked VERIFY.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R0.1 | Run the verification checklist at the end of `AUDIT_FINDINGS.md` against the live project and record the answers in that file | LEAD | — (read-only) | Every VERIFY item is answered "confirmed" or "not an issue", with the evidence |
| R0.2 | Rotate the admin password; remove credentials from the handoff template | SEC | outside repo | Old password no longer signs in |
| R0.3 | Check the Tailscale key type and expiry; put the expiry in a calendar; write the renewal runbook | OPS | `docs/DEPLOY.md` | Runbook exists; date known |
| R0.4 | Nightly logical backup: GitHub Actions workflow runs `pg_dump`, encrypts with a key held in repository secrets, stores as a workflow artifact with retention, and fails loudly | OPS | `.github/workflows/backup.yml` | Three consecutive nightly artifacts exist |
| R0.5 | Restore drill: restore last night's dump into a local Supabase stack and run a row-count comparison | OPS | `docs/roadmap/RUNBOOKS.md` (new) | Drill documented with counts matching |
| R0.6 | Create the second Supabase project (dev) if only one exists (decision D2) | DATA | dashboard | Dev project reachable; keys in `backend/.env` for local use |
| R0.7 | Adopt Supabase CLI migrations: dump the live schema as `supabase/migrations/<ts>_baseline.sql`; mark it applied on production; apply it to dev from empty | DATA | `supabase/` (new) | `supabase db reset` on a local stack produces a schema identical to production (diff is empty) |
| R0.8 | Retire the old SQL files: move `backend/schema.sql`, `clean_schema.sql`, `migrations.sql`, `apply_rls.sql`, `backend/migrations/*`, root `production_schema.sql` into `backend/legacy_sql/` with a README saying they are historical | DATA | those files | No tooling or doc points at the old files as current |
| R0.9 | Keep-alive: a scheduled workflow makes one cheap authenticated read against each Supabase project so neither pauses | OPS | `.github/workflows/keepalive.yml` | Workflow green for a week |
| R0.10 | Cost guardrails: GCP budget with an alert at the smallest amount; AWS billing alarm; Artifact Registry cleanup policy keeping the last three images | OPS | cloud consoles, `docs/DEPLOY.md` | Alerts exist; registry holds ≤ 3 images |
| R0.11 | Record the sandbox host facts: instance type, region, launch date, free-tier end date, security-group rules | OPS | `RISKS.md` §4 | Table filled in |
| R0.12 | Backend CI, unit-only (needs D1): add a job that runs the tests which need no network (`test_bkt`, `test_linucb`, `test_prerequisites`, `test_starter_gen`, the mocked lockout/quota tests). Leave the existing gated job untouched | QA | `.github/workflows/ci.yml` | New job green on `main` |
| R0.13 | Add secret scanning to CI and a pre-commit hook | SEC | `.github/workflows/ci.yml`, `.pre-commit-config.yaml` | A test commit containing a fake key is rejected |
| R0.14 | Delete dead code and branches: `core/executor.py` if unused, root `ARCHITECTURE.md` duplicate, stale local branches, close stale Dependabot PRs so they regenerate | LEAD | as listed | `git branch -a` is short; grep finds no importer of removed files |
| R0.15 | Point `CLAUDE.md` and the old `docs/ARCHITECTURE.md` at `docs/roadmap/` | LEAD | those files | Links resolve |

**Exit criteria**
1. Verification answers recorded; F-20 resolved one way or the other (if
   submit is broken in production, fixing it is promoted to the first task of
   R1 and done immediately).
2. A backup has been restored successfully.
3. Local `supabase db reset` reproduces production schema.
4. Budget alerts exist on both clouds.
5. A CI job runs backend unit tests on every push (if D1 is yes).

**Not in this phase.** No behaviour changes. No schema changes other than
capturing what exists.

---

## R1 — Integrity of the learning signal

**Status:** ☐ · **Size:** ~2 weeks · **Depends on:** R0

**Goal.** Every number that feeds the model is measured by the server, written
atomically, and cannot be written by the student.

**Addresses.** F-01, F-02, F-03, F-04, F-05 (the repeat-solve part), F-10,
F-11, F-19, F-25, F-35.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R1.1 | Split `routers/problems.py` into `usecases/submit.py`, `usecases/next_problem.py`, `repo/*.py` and a thin router, with **no behaviour change**. Characterisation tests first: capture current responses for a fixed set of inputs with mocked I/O, then refactor until they pass unchanged | BE | `backend/app/routers/problems.py`, new `usecases/`, `repo/` | Characterisation tests pass before and after |
| R1.2 | Migration: `attempt_state` counters, `attempts` new columns, `hints`, `hint_reveals`, `mastery_history`, `users.leaderboard_opt_in` (IMPLEMENTATION §2) | DATA | `supabase/migrations/` | Applied on dev; reversible script written |
| R1.3 | Real Run: `POST /api/run` executes visible examples through the sandbox and returns per-case results; increments `attempt_state.runs` and `compile_errors`; never touches mastery; own quota bucket | BE + SBX | `usecases/run_code.py`, `routers/`, `services/piston.py` | Wrong code shows a failing case; right code passes; mastery unchanged after 20 runs |
| R1.4 | Frontend Run: replace the simulated `runCode` with the API call; show per-case output; keep the offline simulator **only** behind the offline banner | FE | `frontend/src/app/(app)/problem/[id]/page.tsx`, `lib/api.ts` | E2E: a deliberately wrong solution shows a failure on Run |
| R1.5 | Server-derived telemetry: submit ignores client-reported counters and reads them from `attempt_state` and `hint_reveals`; remove those fields from the request model | BE | `usecases/submit.py`, `models/schemas.py` | Unit test: forged counters in the body have no effect |
| R1.6 | Hints on the backend: seed `hints` from `frontend/src/data/hints.ts`; list and reveal endpoints with server-side unlock rules; reveal is recorded | BE + CONTENT | `usecases/reveal_hint.py`, seed script | Hint bodies are absent from the JS bundle; a reveal creates a row |
| R1.7 | Frontend hints: `HintsPanel` uses the endpoints; the cost label shown equals the cost the backend applies (single source: the API returns the label) | FE | `components/adapt/HintsPanel.tsx`, `data/hints.ts` (reduced to offline fallback) | Label and applied weight match in a test |
| R1.8 | First-solve rule: an accepted submission for a problem already solved by this student is recorded but applies no positive mastery evidence (it can still count as practice for forgetting in R6) | ML | `domain/evidence.py` | Unit test: second accept leaves mastery unchanged |
| R1.9 | Atomic write: `record_submission` Postgres function; the use-case computes values and makes one call (IMPLEMENTATION §2.4) | DATA + BE | migration, `repo/attempts.py` | Fault-injection test: an error inside the function leaves no partial rows |
| R1.10 | Idempotency: `client_attempt_id` (UUID generated by the frontend per click) unique on `attempts`; a repeat returns the stored result | BE + FE | as above | Double-click test produces one row |
| R1.11 | Write lock-down: backend switches all learning-state writes to the service role; migration drops owner INSERT/UPDATE/DELETE policies on learning-state tables, keeps owner SELECT | DATA + SEC | migration, `repo/*` | Authorisation test: a user token gets 0 rows affected / 403 on every write to those tables |
| R1.12 | Onboarding: `POST /api/onboarding/complete` validates concept names, can be used once, and writes a **provisional prior** (a modest starting value flagged `provisional`) rather than the mastery threshold. Real placement comes in R8 | BE + ML | `routers/mastery.py` | Self-declaring everything no longer unlocks everything |
| R1.13 | `/api/diagnostic`: return only public fields, or remove until R8 | BE | router | Response contains no `test_cases` / `solution_code` |
| R1.14 | Leaderboard: opt-in only, no `user_id` in the response (decision D7) | BE + FE | `routers/leaderboard.py`, RPC, settings page | Non-opted-in users absent; no internal ids |
| R1.15 | Fallback visibility: banner when the offline path is active; Sentry event in production | FE | `lib/api.ts`, layout | Blocking the API in a test shows the banner |
| R1.16 | Deploy sequence and backfill: ship code that tolerates both schemas, migrate, switch writes, then drop policies. Rollback steps written | LEAD | `RUNBOOKS.md` | Production migrated with zero failed submits in Sentry |

**Exit criteria**
1. `select hint_used, attempt_count, compile_errors, count(*) from attempts`
   on new rows shows real variation.
2. The authorisation test suite proves a student token cannot write any
   learning-state table.
3. Run and Submit both execute real code; no simulated success path exists
   outside the labelled offline mode.
4. Killing the backend mid-submit (test) leaves the database consistent.
5. `PROJECT_HISTORY.md` updated, including corrections to the Part 4/Part 5
   statements that the audit found inaccurate.

**Not in this phase.** No change to BKT parameters or to the bandit maths
(R5, R6). No new languages (R3).

---

## R2 — Same-origin API and session hardening

**Status:** ☐ · **Size:** ~1 week · **Depends on:** R0 (can run alongside R1 if owners differ) 

**Goal.** Login works in every major browser, the cookie is first-party, and
the backend can trust the client address it rate-limits on.

**Addresses.** F-17, F-18, F-34, and `SECURITY.md` §4.3 partially.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R2.1 | Reproduce: test login persistence on Safari (macOS/iOS), Firefox strict, Chrome incognito; record results | QA | — | Table of results in the phase notes |
| R2.2 | Reproduce: rate-limit bypass test with a rotating forwarded-address header against dev | SEC | — | Result recorded |
| R2.3 | Vercel rewrite `/api/:path*` → backend origin (server-side env var, not `NEXT_PUBLIC_`); frontend `API_BASE` becomes relative in production | FE | `frontend/next.config.mjs`, `lib/api.ts` | Network tab shows only same-origin calls |
| R2.4 | Edge secret: Vercel adds a header with a shared secret; backend middleware rejects requests without it in production (health probe path exempt) | BE + OPS | `core/security.py`, Vercel + Cloud Run config | Direct call to the `run.app` URL returns 403 |
| R2.5 | Client address: derive only from the edge-supplied header when the edge secret is valid; restrict uvicorn's forwarded-header trust | BE | `core/rate_limit.py`, `entrypoint.sh` | R2.2 test now yields 429s |
| R2.6 | Cookie: `SameSite=Lax`, `Secure`, `HttpOnly`, `Path=/`, host-only; add double-submit CSRF token for state-changing methods | BE + FE | `routers/auth.py`, `core/security.py`, `lib/api.ts` | CSRF test: POST without the token is rejected |
| R2.7 | Session refresh: store the refresh token in a second httpOnly cookie scoped to the refresh path; `POST /api/auth/refresh`; the API client retries once on 401 | BE + FE | `routers/auth.py`, `lib/api.ts` | A session survives > 1 hour in an E2E test with a shortened token lifetime on dev |
| R2.8 | OAuth: after the bridge call succeeds, sign the browser Supabase client out locally and disable session persistence so no access token stays in browser storage | FE | `lib/supabase.ts`, `app/auth/callback/page.tsx` | Storage contains no Supabase token after login |
| R2.9 | Simplify: remove the backend origin from CSP `connect-src`; reduce CORS to local development only | FE + BE | `next.config.mjs`, `main.py` | CSP report shows no violations in E2E |
| R2.10 | Per-user rate limits on authenticated routes (key on user id when present) | BE | `core/rate_limit.py` | Test: two users behind one address do not share a bucket |
| R2.11 | Update `SECURITY.md` to match reality after the change | SEC | `SECURITY.md` | Reviewed |
| R2.12 | If a free domain is obtained (D9): add it to Vercel, then follow `SECURITY.md` §5 for Cloudflare | OPS | DNS | Optional; tracked separately |

**Exit criteria**
1. Login persists on all browsers in R2.1's table.
2. The public Cloud Run URL refuses requests that did not come through the edge.
3. CSRF and rate-limit tests pass in CI.
4. Sessions outlive the access-token lifetime.

**Risks specific to this phase.** The proxy has its own timeout and request
limits (RISKS §3). Until R3 shortens submit, a slow submission can exceed it;
ship R2.3 behind an environment switch so it can be reverted in one redeploy.

---

## R3 — Execution engine v2

**Status:** ☐ · **Size:** ~2 weeks · **Depends on:** R1.3 (Run endpoint)

**Goal.** A submission is one sandbox call, in any of the four languages, with
accurate verdicts, and the sandbox cannot be overloaded.

**Addresses.** F-14, F-15, and the content-validity part of F-27.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R3.1 | Judge test corpus: for each language, a set of tiny programs with known outcomes (accept, wrong answer, runtime error, compile error, infinite loop, large output, deep recursion, reads nothing) | QA + SBX | `backend/tests/judge_corpus/` | Corpus runs against a local Piston container |
| R3.2 | Batched driver for Python and JavaScript: one program receives all cases, runs each in isolation, prints one result record per case with status and timing (IMPLEMENTATION §3) | SBX | `domain/judge.py` | Corpus passes; a 10-case problem makes one sandbox call |
| R3.3 | Typed harness for Java and C++ generated from `starter_code._meta` (parameter and return types) covering the types the bank actually uses; unsupported signatures are flagged, and that language is hidden for that problem | SBX | `domain/judge.py`, `services/starter_gen.py` | Corpus passes in all four languages |
| R3.4 | Verdicts: add Time Limit Exceeded and Output Limit; per-case timing; distinguish "sandbox unavailable" (HTTP 503 to the client, **no** attempt recorded, no mastery change) from a student error | BE + SBX | `domain/judge.py`, `usecases/submit.py` | Killing Piston in a test yields 503 and no rows |
| R3.5 | Sandbox gate: process-wide semaphore sized to the host; bounded wait; 503 with `Retry-After` beyond it; one shared HTTP client with connection reuse | BE | `core/sandbox_gate.py`, `services/piston.py` | Load test: 50 simultaneous submits degrade to 503s, not timeouts |
| R3.6 | Frontend: friendly "judge is busy, retrying" state with automatic retry | FE | problem page | E2E with a forced 503 |
| R3.7 | Golden run: script executes each problem's reference solution in each language against all its tests and reports failures, flaky cases, slow cases and problems with fewer than N hidden tests | CONTENT + SBX | `backend/scripts/golden_run.py` | Report generated; every listed problem either passes or is unpublished |
| R3.8 | `problems.status` column (`draft` / `published` / `retired`); only published problems are served | DATA + BE | migration, `repo/problems.py` | Unverified problems disappear from the catalogue |
| R3.9 | Sandbox host hardening review: Piston run limits (memory, processes, output, network off), host firewall egress, metadata-service access blocked from containers, no instance role, automatic security updates, documented rebuild procedure | SBX + SEC | `docs/DEPLOY.md`, host | Checklist complete; rebuild rehearsed once |
| R3.10 | Sandbox liveness: health endpoint reports queue depth and last successful run; circuit breaker opens after consecutive failures | BE | `main.py`, `services/piston.py` | Dashboards/alerts in R11 can read it |

**Exit criteria**
1. Judge corpus green in all four languages in CI (against a Piston container
   started in the workflow).
2. p95 submit time for a 10-test problem under 6 s on dev.
3. Golden run: 100 % of published problems pass their own reference solution
   in every language offered for them.
4. An overloaded sandbox returns 503 quickly and records nothing.

**Not in this phase.** Custom checkers for problems with multiple valid
answers (tracked in R7), interactive problems, additional languages.

---

## R4 — Backend performance and reliability

**Status:** ☐ · **Size:** ~1.5 weeks · **Depends on:** R1

**Goal.** The backend serves a classroom concurrently without blocking, and no
endpoint's cost grows with the size of a table.

**Addresses.** F-12, F-13, parts of F-11.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R4.1 | Baseline: load-test script (open-source tool, run from a laptop against dev) for list, problem, run, submit; record p50/p95 and error rate at 5/25/50 users | QA | `backend/loadtest/` | Baseline numbers in the phase notes |
| R4.2 | Data access layer: one module owning connection reuse; every database call from a request handler is non-blocking (async client or explicit thread offload); a lint rule or test forbids direct client construction elsewhere | BE | `core/db.py`, `repo/*` | No blocking call remains in any `async def` path (checked by a test that instruments the loop) |
| R4.3 | Use the pooled connection endpoint for direct Postgres; one connection pool per instance sized for Cloud Run's instance cap | BE + DATA | `core/db.py`, config | Connection count under load stays within the plan's limit |
| R4.4 | `problem_stats` maintained transactionally; `/api/problems` reads catalogue + stats only | DATA + BE | migration, `repo/stats.py` | Query plan shows no scan of `attempts` |
| R4.5 | Catalogue caching: in-process cache with short TTL, `ETag`/`Cache-Control` on the public list so the edge can cache it | BE | router | Repeat request returns 304 |
| R4.6 | Replace per-user "read all events" with aggregate queries/RPCs (`/api/mastery`, solved set, stats, heatmap); add missing indexes; explicit pagination everywhere a list is returned | DATA + BE | migrations, `repo/*` | Seeded test user with 5 000 attempts returns correct counts |
| R4.7 | Parallelise independent reads in submit | BE | `usecases/submit.py` | Stage timings in logs show overlap |
| R4.8 | Cold start: measure; trim image and imports; document the measured cold-start time and the decision to stay at min-instances 0 | OPS | `Dockerfile`, `entrypoint.sh` | Number recorded; no regressions |
| R4.9 | Timeouts and retries: explicit timeout on every outbound call; one retry with jitter only for idempotent reads | BE | `services/*`, `core/db.py` | Chaos test: slow database produces a clean 503 |
| R4.10 | Structured logging with request id and per-stage timings | BE | `core/logging.py`, middleware | A single submit can be traced end to end in the logs |
| R4.11 | Re-run R4.1 and compare | QA | — | Targets below met or the gap explained |

**Targets** (confirm or revise from the R4.1 baseline): at 25 concurrent users
on dev — catalogue p95 < 300 ms, problem detail p95 < 400 ms, submit p95 < 6 s,
error rate < 1 %, zero whole-table reads.

**Exit criteria.** Targets met; a table ten times larger (seeded on dev) does
not change endpoint latency materially.

---

## R5 — Adaptive engine v2: the policy

**Status:** ☐ · **Size:** ~2 weeks · **Depends on:** R1, R4

**Goal.** The policy is rewarded for its own decisions, updates safely under
concurrency, and every decision is recorded well enough to evaluate any other
policy offline.

**Addresses.** F-06, F-07, F-08, F-09, and the policy half of F-10.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R5.1 | Extract policy maths into `domain/policy.py` (pure) with property tests: matrices stay symmetric positive-definite; scores are finite; allowed-action guards are never violated | ML | `domain/policy.py`, tests | Tests green |
| R5.2 | Migration: `bandit_decisions`, `bandit_models` (IMPLEMENTATION §2, §5) | DATA | migration | Applied on dev |
| R5.3 | Decision lifecycle: write a decision when a problem is served (context, allowed set, action, propensity, policy version, item); close it when that problem's attempt ends; update the model **from the stored context** | ML + BE | `usecases/submit.py`, `usecases/next_problem.py`, `repo/decisions.py` | Unit test replays a scripted sequence and checks each reward lands on the decision that caused it |
| R5.4 | Sweeper: decisions left open beyond a time limit are closed as "no outcome" with a defined reward, by a scheduled job | ML + OPS | script + workflow | No decision stays open > limit |
| R5.5 | Safe updates: the model row carries a version; the update is applied inside `record_submission` under a row lock as an additive delta, not a whole-blob overwrite | DATA + ML | migration, RPC | Concurrency test: 100 parallel updates all land |
| R5.6 | Explicit exploration with logged propensity; overrides recorded as `policy='override'` and excluded from training | ML | `domain/policy.py` | Decision rows show propensities summing correctly in a test |
| R5.7 | Reward v2: defined in one function, versioned, combining outcome, help used, and change in predicted mastery, with an abandonment penalty; weights in config (IMPLEMENTATION §5.3) | ML | `domain/policy.py` | Unit tests for each case; documented rationale |
| R5.8 | Item selection: score candidates in the chosen bucket by target difficulty, novelty and recency; draw from the top few with recorded randomness | ML | `domain/items.py`, `repo/problems.py` | Two students with different histories get different items; test asserts no solved item is chosen while unsolved ones exist |
| R5.9 | Wire `hint_augmented` end to end: the response tells the UI to pre-open the first hint tier, and that reveal is recorded as system-initiated (not penalised as student-initiated) | ML + FE | `usecases/next_problem.py`, `HintsPanel` | E2E shows the pre-opened hint; evidence weight unaffected |
| R5.10 | Simulator: synthetic students with known hidden mastery and learning rates, used to check the policy beats random and static sequencing, and to regression-test future changes | ML + RES | `backend/sim/` | Report: cumulative learning for v2 vs random vs fixed order |
| R5.11 | Offline evaluation tool: inverse-propensity estimate of a candidate policy's value from the decision log | RES | `backend/eval/ope.py` | Runs on simulator output and recovers the known answer within tolerance |
| R5.12 | Migration of existing state: archive the old sentinel row; start v2 from a clean model (the old numbers are not interpretable) | DATA | migration | Old row retained in an archive table |
| R5.13 | "Why this problem": the response includes a short structured reason (action, concept, the mastery value that triggered it) | ML + BE | response model | Field present and tested |

**Exit criteria**
1. A scripted end-to-end test proves reward attribution.
2. Parallel-update test loses no updates.
3. In the simulator, v2 achieves higher cumulative learning than random and
   than a fixed order, across several seeds.
4. Every production decision row has a propensity.

**Not in this phase.** Per-student personalisation of the bandit itself (D4),
changes to BKT (R6).

---

## R6 — Knowledge model v2, and proof that it predicts

**Status:** ☐ · **Size:** ~2 weeks of work, but gated on data volume · **Depends on:** R1 (clean data), R5

**Goal.** Mastery numbers are calibrated: when the model says 70 %, students
succeed about 70 % of the time — and there is a regenerated report that shows
it.

**Addresses.** F-05, F-29.

| ID | Task | Role | Touches | Done when |
|---|---|---|---|---|
| R6.1 | Evaluation harness first: from the attempt log, build (student, concept, time) → "next first-attempt accepted?" pairs with a time-based train/test split; compute AUC, log-loss, calibration curve | RES | `backend/eval/kt_eval.py` | Runs on simulator data and on production export |
| R6.2 | Baselines in the harness: always-predict-base-rate; per-student running average; per-problem acceptance rate | RES | same | Baseline numbers reported |
| R6.3 | Score the current model in the harness — this is the "before" number | RES | — | Recorded in the report |
| R6.4 | Difficulty-aware evidence: an accepted hard problem is stronger evidence than an accepted easy one; a failed easy problem is stronger negative evidence. Implement through per-item guess/slip adjustments derived from `item_params` (IMPLEMENTATION §4.3) | ML | `domain/evidence.py`, `domain/knowledge.py` | Unit tests; harness shows no regression |
| R6.5 | Item difficulty estimates: online rating update per attempt, stored in `item_params` with an uncertainty that shrinks with observations | ML + DATA | `domain/items.py`, RPC | Estimates converge in the simulator to the planted difficulty order |
| R6.6 | Mastery threshold and unlock rule: require both a probability threshold **and** a minimum amount of evidence (distinct problems, at least one above easy) before a concept counts as mastered | ML | `domain/knowledge.py`, `prerequisites.py` | Two easy solves no longer unlock; unit tests |
| R6.7 | Forgetting: mastery decays toward the prior with time since last practice; applied on read, never destructively stored (IMPLEMENTATION §4.4) | ML | `domain/knowledge.py`, `repo/mastery.py` | Unit tests; decayed concepts appear in the review queue (R8) |
| R6.8 | Parameter fitting job: nightly workflow fits per-concept parameters when a concept has enough observations, with bounds that keep the model identifiable; writes a new `model_version`; never auto-promotes | RES + OPS | `backend/eval/fit_bkt.py`, workflow | Job produces a candidate and a comparison report |
| R6.9 | Promotion rule: a candidate version is promoted only if it beats the current version on held-out log-loss by a margin; promotion is a config change with a history entry | RES + LEAD | `RUNBOOKS.md` | Rule documented; first promotion (or first "not promoted") recorded |
| R6.10 | Recompute existing mastery under the promoted version from the attempt log (decision D5); keep the old values in `mastery_history` | DATA + ML | script | Before/after distribution reviewed |
| R6.11 | Multi-concept problems: `problem_concepts` with weights; evidence is split across concepts | ML + CONTENT | migration, `domain/evidence.py` | Tagged subset in use; harness shows no regression |
| R6.12 | Publish the accuracy report as a page in the repo (generated artefact) and, if desired, as a public page | RES | `docs/reports/` | Report regenerates nightly |

**Data gate.** Fitting and meaningful evaluation need real observations. As a
rule of thumb, wait for a few hundred first attempts per concept before
trusting fitted parameters; below that, keep the defaults with the R6.4–R6.7
structural fixes, which do not need data. The harness, baselines and simulator
(R6.1–R6.3) can be built immediately.

**Exit criteria**
1. The report exists and regenerates.
2. The production model beats all three baselines on held-out data — or the
   report says plainly that it does not yet, and why.
3. Mastery cannot be reached on two easy solves.

---

## R7 — Content originality and quality (parallel track)

**Status:** ☐ · **Size:** ~3 weeks of content work, spread from R1 to R12 · **Depends on:** R3.7 for verification

**Goal.** Every published problem is original (or properly licensed), verified
by a reference solution in every offered language, and has hints and an
explanation.

**Addresses.** F-27, content parts of F-10 and F-15.

| ID | Task | Role | Done when |
|---|---|---|---|
| R7.1 | Provenance audit: for each problem record its source and how close the text is to the source; classify keep / rewrite / drop | CONTENT | Spreadsheet or table committed (without copied text) |
| R7.2 | Decide the launch set (decision D6): recommended 10 problems per concept, spanning difficulties | LEAD + CONTENT | List agreed |
| R7.3 | Authoring standard: template for statement, constraints, examples, hidden tests (edge, boundary, scale, adversarial), reference solutions, three hint tiers, editorial, concept tags with weights, estimated difficulty | CONTENT | `docs/CONTENT_GUIDE.md` |
| R7.4 | Rewrite or newly write the launch set to the standard — original scenarios, original wording, original examples and tests. Well-known algorithmic tasks are ideas and can be re-expressed; text, examples and test data must be your own | CONTENT | Launch set authored |
| R7.5 | Test generation: each problem has a generator script and a brute-force checker so hidden tests are produced, not hand-typed | CONTENT + SBX | Generators committed; tests reproducible |
| R7.6 | Custom checkers for problems with several valid outputs | SBX | Checker interface in `domain/judge.py` |
| R7.7 | Review workflow in admin: draft → reviewed → published, with the golden run as a required check before publishing | BE + FE | Cannot publish a problem whose golden run fails |
| R7.8 | Concept lessons: a short explanation page per concept with a worked example, linked from the graph | CONTENT + FE | 12 pages |
| R7.9 | Item quality metrics (after data): acceptance rate, time, discrimination; flag outliers for review | RES | Report section |
| R7.10 | Licence and attribution file for content | LEAD | `CONTENT_LICENSE.md` |

**Use of AI for authoring.** Drafting with an LLM is fine; publishing unchecked
is not. Every problem must pass the golden run, and a human reads every
statement. LLM-written tests are often wrong at boundaries — the brute-force
checker in R7.5 exists for exactly that.

**Exit criteria.** The launch set is original, verified, hinted and explained;
anything not in the launch set is unpublished before public launch.

---

## R8 — Learner experience

**Status:** ☐ · **Size:** ~2 weeks · **Depends on:** R5 (reasons), R6 (decay) for full value; several tasks can start earlier

**Goal.** A new student is placed in minutes, always understands why they are
seeing a problem, and can use the product on a phone and with a keyboard only.

**Addresses.** F-04 (properly), F-28 (quota and UX half).

| ID | Task | Role | Done when |
|---|---|---|---|
| R8.1 | Placement diagnostic: a short adaptive sequence (about 6–10 items) that picks each next item where uncertainty is highest, then writes starting mastery with an honest evidence count | ML + FE + BE | New account finishes placement in under 10 minutes; resulting profile differs for a strong and a weak test persona |
| R8.2 | "Why this problem" surfaced on the problem page and on `/learn` | FE | Visible, plain language |
| R8.3 | Review queue: decayed concepts and previously failed problems resurface; the policy's "review" behaviour is visible as a list | FE + ML | Queue populated for a seeded user |
| R8.4 | Explanations on demand with cache and per-user daily budget; clear message when the budget or the provider quota is exhausted | BE + FE | Quota exhaustion shows a helpful state, not an error |
| R8.5 | Explanation output checks: reject or redact responses that contain full solutions; never render raw HTML | BE | Test with an injection attempt |
| R8.6 | Editor quality: draft autosave per problem and language (server-side), restore on return, reset to starter, keyboard shortcuts documented | FE + BE | Draft survives reload and device change |
| R8.7 | Submission history with code and per-test results | FE + BE | Past attempt viewable |
| R8.8 | Mobile and tablet layout for every page; the editor usable on a phone in a reduced mode | FE | Manual pass at 360 px and 768 px; E2E at mobile viewport |
| R8.9 | Accessibility to WCAG 2.1 AA: keyboard paths, focus order, contrast in all three themes, labels, reduced motion, screen-reader pass on the main flow | FE + QA | Automated checks clean; manual checklist done |
| R8.10 | Performance budget: self-hosted Monaco loaded on demand, route-level code splitting, images optimised; set and meet Core Web Vitals targets | FE | Budget enforced in CI |
| R8.11 | Progress that motivates without manipulating: mastery history chart, concept completion, streak that forgives a missed day; no fake urgency | FE | Shipped |
| R8.12 | Empty, loading, error and offline states reviewed on every page | FE | Checklist done |
| R8.13 | Text externalised so translation is possible later | FE | No hard-coded strings in new components |

**Exit criteria.** Five people who have never seen the product complete
sign-up → placement → first accepted problem without help, on a phone and on a
laptop. Record what confused them.

---

## R9 — Quality engineering and CI/CD

**Status:** ☐ · **Size:** ~1.5 weeks total, delivered as slices inside other phases · **Starts in:** R0

**Goal.** A change that breaks the product cannot reach production unnoticed.

**Addresses.** F-30, and the cause of F-01 (frontend/backend contract drift).

| ID | Task | Lands with | Done when |
|---|---|---|---|
| R9.1 | Unit job for backend pure modules | R0 | Green |
| R9.2 | Lint, format, type-check for both sides as required CI steps (introduce warnings-as-errors gradually, per directory) | R1 | New code is clean; legacy baseline recorded |
| R9.3 | Integration job: start the Supabase local stack and a Piston container in the workflow, apply migrations from empty, run API tests through the real stack | R3 | Green; this is the full replacement for the gated job |
| R9.4 | Contract: generate the OpenAPI document in CI, generate TypeScript types from it, fail the build if the generated file differs from what is committed | R1/R2 | A backend request-model change breaks the frontend build until types are regenerated |
| R9.5 | Authorisation matrix tests: for every route × {anonymous, student, other student, admin} assert the expected status | R1/R10 | Matrix complete |
| R9.6 | End-to-end: Playwright against a preview deployment wired to dev — sign-up, placement, run, submit wrong, hint, submit right, mastery moves, next problem | R2/R8 | Runs on every push to `main` |
| R9.7 | Model tests: property tests and simulator regression as a CI job | R5/R6 | Green |
| R9.8 | Migration checks: every migration applies from empty and has a written rollback; a workflow applies to dev automatically and to production on manual approval after a backup | R0/R1 | Used for all R1+ migrations |
| R9.9 | Deploy gate and rollback: production deploy only from a green `main`; post-deploy smoke test; documented one-command rollback to the previous Cloud Run revision | R4 | Rollback rehearsed |
| R9.10 | Dependency policy: weekly grouped updates, majors only by hand, security updates prioritised; audit tools for Python, npm and the container image in CI | R0/R10 | Queue under control |
| R9.11 | Coverage as information, with floors on `domain/` (high) and `usecases/` (moderate) | R5 | Floors enforced |
| R9.12 | Test data: seed script producing personas (new, strong, weak, returning after absence, heavy user) on dev | R1 | Used by E2E and load tests |

**Exit criteria.** The previously gated backend job is superseded by R9.1 and
R9.3; `CLAUDE.md` is updated to say so (needs D1).

---

## R10 — Security and privacy programme

**Status:** ☐ · **Size:** ~1.5 weeks · **Depends on:** R1, R2, R3; hard gate for R12

**Goal.** The threat model matches the system, every claim in `SECURITY.md` is
tested, and the privacy policy describes what really happens to student data.

| ID | Task | Role | Done when |
|---|---|---|---|
| R10.1 | Rewrite the threat model against the target architecture (assets, actors, entry points, trust boundaries; a structured pass per boundary) | SEC | `SECURITY.md` updated |
| R10.2 | Turn each "already closed" claim into an automated check where possible (headers, docs hidden, cookie flags, RLS, edge secret) | SEC + QA | Checks in CI |
| R10.3 | Content-Security-Policy with nonces; remove `unsafe-inline` / `unsafe-eval` as far as the editor allows; self-hosted editor assets | FE + SEC | CSP evaluator clean or exceptions justified |
| R10.4 | Enable Turnstile on sign-up (already built, flag off); add it to password reset | OPS | Live |
| R10.5 | Admin protection: second factor for admin accounts; admin routes additionally restricted; admin reads logged | SEC + BE | Tested |
| R10.6 | Secrets: inventory, owner, rotation interval, last rotated; rotate everything that has ever appeared in a chat, a commit or a document | SEC + OPS | Calendar exists; rotations done |
| R10.7 | Data inventory and retention: what is stored, why, for how long; delete or anonymise attempts and code after the retention period; IP addresses hashed in logs | SEC + DATA | Policy implemented by a scheduled job |
| R10.8 | Privacy policy and terms rewritten to match: third parties that receive student code, how model providers may use it, analytics, retention, deletion, contact; age statement and what happens for younger users | SEC + LEAD | `/privacy`, `/terms` updated; reviewed by a human who is not the author |
| R10.9 | Verify export and delete end to end against the new tables | BE + QA | Test covers every table with user data |
| R10.10 | Abuse cases: mass account creation, quota evasion through many accounts, leaderboard manipulation, scraping the problem bank, prompt injection, sandbox resource exhaustion — one mitigation or accepted-risk note each | SEC | Table in `SECURITY.md` |
| R10.11 | Incident response: one page — how to detect, who decides, how to take the site to maintenance mode, how to revoke all sessions, how to restore, how and when to tell users | SEC + OPS | `RUNBOOKS.md`; table-top exercise done once |
| R10.12 | `security.txt` and a private reporting address | SEC | Published |
| R10.13 | Independent review: run the automated security review on the whole diff since baseline; ask one outside person to try to break authorisation | SEC | Findings triaged |

**Exit criteria.** No open S1/S2 audit finding; privacy text reviewed; incident
exercise done.

---

## R11 — Observability, operations and cost guardrails

**Status:** ☐ · **Size:** ~1 week · **Depends on:** R4; hard gate for R12

**Goal.** You find out about a problem before a student tells you, and you find
out about a bill before it exists.

| ID | Task | Role | Done when |
|---|---|---|---|
| R11.1 | Service indicators and targets written down (availability, submit latency, sandbox reachability, explanation success) | OPS | `RUNBOOKS.md` |
| R11.2 | External uptime probe on a schedule (free monitor or a scheduled workflow) hitting a deep health endpoint that checks database and sandbox | OPS | Alert email received in a test outage |
| R11.3 | Synthetic submit: scheduled job logs in as a probe account and submits a known-good solution | OPS + QA | Fails loudly when the pipeline is broken |
| R11.4 | Sentry: release tagging, alert rules, noise filtered, quota watched | OPS | Alert rules live |
| R11.5 | Free-tier usage report: scheduled job gathers request counts, compute seconds, database size, LLM calls, proxy usage, and emails when any exceeds 70 % of its allowance | OPS | First weekly report received |
| R11.6 | Kill switches as feature flags: disable explanations, disable sign-ups, read-only mode, disable Run — each changeable without a deploy | BE + OPS | Each tested |
| R11.7 | Runbooks: backend down, sandbox down, database paused or full, LLM quota exhausted, tailnet key expired, bad deploy, bad migration | OPS | One page each |
| R11.8 | Product metrics table computed nightly | DATA + RES | Populated |
| R11.9 | Restore drill repeated on the grown database; time recorded | OPS | Done |
| R11.10 | Capacity note: from R4 load tests and R11.5 usage, state how many daily active students the free tiers support, and what gives out first | OPS + LEAD | Number in `RISKS.md` |

**Exit criteria.** A deliberately broken deploy on dev is detected by the probe
and rolled back using the runbook, by someone following only the written steps.

---

## R12 — Evidence and launch

**Status:** ☐ · **Size:** ~3 calendar weeks minimum (people need time to use it) · **Depends on:** R5, R6, R7 launch set, R10, R11

**Goal.** Real students have used it, and there is an honest written account
of what the adaptive engine did for them.

| ID | Task | Role | Done when |
|---|---|---|---|
| R12.1 | Competitor review (one day): what existing products offer for adaptive DSA practice; adjust positioning | LEAD | Notes committed |
| R12.2 | Experiment framework: deterministic assignment by user id, exposure logged, analysis script | RES + BE | `experiments` tables in use |
| R12.3 | Study design, written before data is seen: arms (adaptive policy vs fixed curriculum order, same content), primary measure (improvement between a pre-test and a post-test on held-out problems), secondary measures (problems to mastery, return rate, abandonment), sample size reality check, stopping rule | RES | Design document committed |
| R12.4 | Consent and ethics: participants are told it is a study and what is recorded; if this is tied to a university, ask whether it needs ethics approval | LEAD | Consent screen live |
| R12.5 | Closed beta with 20–50 classmates; feedback form; weekly fix cycle | LEAD + all | Two weeks of usage |
| R12.6 | Analysis and write-up, including null or negative results | RES | Report committed |
| R12.7 | Launch checklist: R10 and R11 gates, launch-set content only, landing copy matches evidence, support contact, status page | LEAD | All ticked |
| R12.8 | Public launch to a wider student audience; watch the capacity number from R11.10 | LEAD + OPS | Live |
| R12.9 | Decide on opening the engine and under what licence (D8) | LEAD | Decision recorded |
| R12.10 | Sustainability plan: which free allowances are closest to their limits, which student or education programmes to apply for, and what would trigger each contingency | LEAD | Section in `RISKS.md` updated |

**Honesty rule.** With tens of participants the study will be underpowered for
small effects. Say so. A clear description of method, limitations and what was
observed is worth more — to an interviewer, a reviewer or a buyer — than a
confident claim that cannot be supported.

---

## R13 — Growth: classrooms and an open engine (open-ended)

**Status:** ☐ · **Depends on:** R12

Candidate directions, to be chosen with evidence from R12 rather than now:

| ID | Direction | First step |
|---|---|---|
| R13.1 | **Cohorts and a teacher view** — a class sees concept-level mastery across students, assigns a concept, exports progress | Read-only cohort dashboard for one pilot class |
| R13.2 | **Engine extraction** — the evidence/knowledge/policy layers as a standalone library with a small interface, usable with any item bank | Separate package inside the repo with its own tests |
| R13.3 | **New tracks** — SQL, or a second subject, to prove the engine is content-agnostic | One small track of 30 items |
| R13.4 | **Per-student policy correction** (D4 revisited) | Offline evaluation on the decision log first |
| R13.5 | **Richer tutor** — a conversational hint that asks guiding questions, within a strict per-user budget | Prototype behind a flag for beta users |
| R13.6 | **Community content** with the R7 review workflow | Contributor guide and one external contribution |
| R13.7 | **Research publication** of the R12 results and the open decision dataset (anonymised, with consent) | Draft |

---

## Cross-phase rules

1. **Feature flag first.** New behaviour ships off, is turned on in dev, then
   for the admin account in production, then for everyone.
2. **Expand, migrate, contract.** Schema changes add first; code moves; old
   columns and policies are removed in a later commit.
3. **One phase, one history entry.** `PROJECT_HISTORY.md` Part 3 gets a dated
   entry when a phase closes; Parts 4–8 are updated where the phase changed
   them.
4. **Version stamps.** Any change to evidence, knowledge or policy maths bumps
   that layer's version string.
5. **No phase closes on a red CI.**
6. **If a phase reveals that an earlier assumption was wrong, update this file
   in the same commit.** The plan is allowed to change; it is not allowed to be
   silently out of date.
