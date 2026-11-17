# AdaptCode — Forward Plan

**Written:** 2026-11-16 · **Baseline commit:** `7bb0a96` · **Owner:** Justin
**Status:** proposed — nothing in this plan has been executed yet.

This is the entry point for the roadmap. Read it first, then:

| File | What it answers |
|---|---|
| [`PLAN.md`](PLAN.md) (this file) | Where the project really stands, what is strong and weak about it, what we are going to do and in what order, and why |
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | The system as it is actually built today, and the target design each phase moves toward |
| [`PHASES.md`](PHASES.md) | The 14 phases (R0–R13): goal, tasks, owner role, exit criteria, effort |
| [`IMPLEMENTATION.md`](IMPLEMENTATION.md) | The engineering detail: schemas, SQL, API contracts, algorithms, configs, test strategy |
| [`RISKS.md`](RISKS.md) | Risk register, free-tier budget and its cliffs, contingencies |
| [`TEAM_PLAYBOOK.md`](TEAM_PLAYBOOK.md) | How to split the work across roles / AI agents without them colliding, and the brief to hand each one |
| `AUDIT_FINDINGS.md` | The detailed code audit behind this plan (`F-01`…`F-35`). **Kept out of git** because the repo is public and the items are not fixed yet |

Phase names use an `R` prefix (R0, R1, …) on purpose. `PROJECT_HISTORY.md` notes
that "Phase 4" has meant three different things in this repo; `R` numbers are
global and will not be reused.

---

## 1. The honest starting point

### 1.1 What is real and good

- **A full loop works end to end.** A student signs in, opens a real problem,
  writes code in Monaco, the code is executed in an isolated sandbox, a verdict
  comes back, a mastery number changes, a next problem is proposed, and a failed
  attempt gets an LLM explanation that withholds the answer. Many student
  projects never get one real loop; this one has it deployed.
- **The infrastructure design is sound and cheap.** Vercel → Cloud Run →
  Supabase, with the sandbox on a separate host that has no public port and is
  reachable only over Tailscale. That last decision is better than what many
  funded products do.
- **Security has had real attention**: RLS, per-email login lockout, per-user
  submit cap, runtime pinning, audit log, a written threat model, secrets in
  Secret Manager.
- **The history is documented** to a depth that makes the project explainable
  and transferable (`PROJECT_HISTORY.md`).
- **The algorithms are the right family.** Knowledge tracing plus a bandit for
  sequencing is how serious adaptive-learning systems are built, both run
  in-process on NumPy with no GPU and no training job, and both keep their state
  in Postgres so the backend stays stateless.

### 1.2 What the code audit found

The audit read the source rather than the docs. The detail is in
`AUDIT_FINDINGS.md`; the headline is that **the adaptive part — the reason the
project exists — is mostly not operating in production**:

| # | Finding (neutral title) | Why it matters |
|---|---|---|
| F-01 | Behavioural signals are not sent by the frontend | The BKT evidence weight is effectively 0 or 1; hints, attempts and compile errors have no effect |
| F-05 | Mastery threshold is reached after two accepted submissions | "Mastered" does not mean mastered; difficulty is ignored; re-submitting counts again |
| F-06 | Bandit reward attribution is misaligned | The bandit's numbers do not estimate the effect of its own decisions |
| F-07 | Bandit state is one shared row with unsynchronised updates | Not personalised as documented; updates are lost under concurrency |
| F-09 | Next problem within a bucket is the first unsolved row | Every student sees the same order |
| F-35 | The Run button reports success without running code | The one remaining fake element, and it misleads students |
| F-20 | Repo and live DB disagree on how `problems` is readable | Either schema drift or a broken submit path; must be checked first |
| F-03/04 | Learning state can be written outside the backend | Scores and leaderboard are forgeable |
| F-17 | Session cookie is cross-site | Login likely fails on Safari and other third-party-cookie-blocking browsers |
| F-11–14 | Non-atomic pipeline, blocking I/O, whole-table reads, one sandbox call per test | Fine for a demo; falls over with a classroom of concurrent users |
| F-21–24 | No schema source of truth, no dev/prod split, no backups, an expiring network key | One mistake or one expiry away from an outage or data loss |
| F-27 | Problem content is derived from a commercial site | Legal exposure the moment this is promoted |

None of this is unusual for a project built fast by one person with AI help.
It does change the plan: **before adding features, make the existing claims
true.** A platform that says "we model your knowledge" must be able to show the
model predicts something.

### 1.3 On "nothing like this exists"

Be careful with this claim, in interviews and in marketing. I cannot survey
today's market from inside this session, but the building blocks are decades
old and widely deployed: Bayesian Knowledge Tracing comes from 1990s
intelligent-tutoring research; mastery-based progression and adaptive
sequencing are core to several large learning products; coding-practice sites
offer structured study plans and roadmaps; and bandits for content sequencing
are a published, practised technique.

What is plausibly distinctive here is the **combination**, done in the open on
real code execution:

1. a per-concept knowledge estimate updated on every real code submission,
2. evidence weighted by *how* the student got there (hints, retries, time),
3. a prerequisite graph that gates what can be recommended,
4. a learning policy that chooses the next step and improves from outcomes,
5. explanations that diagnose without giving the answer,
6. running at zero infrastructure cost.

A defensible positioning sentence: *"An open, measurable adaptive tutor for
data structures and algorithms — it models what you know from how you actually
code, and can show that its model predicts your next result."* The second half
is the part competitors with static lists cannot say, and it is the part this
plan builds (R5, R6, R12).

"Unique" is a claim to earn with evidence, not to assert. Do a one-day
competitor review in R12 before writing any public copy.

---

## 2. Strengths, weaknesses, opportunities, threats

**Strengths**
- Working deployed product with real execution and a real problem bank.
- Good security architecture for the sandbox; written threat model.
- Stateless backend; closed-form online algorithms; near-zero running cost.
- Exceptional documentation of decisions.
- A student founder who is also the target user and has classmates to test with.

**Weaknesses**
- Core adaptive claims not yet true in production (F-01, F-05, F-06, F-07).
- No evidence the model is accurate or that the platform improves learning.
- Thin tests on the core; backend CI off; single environment; no backups.
- Single maintainer; heavy reliance on AI-generated code that has drifted from
  its own documentation.
- Content provenance.
- Cross-site cookie; blocking I/O; single small sandbox host.

**Opportunities**
- Fix the model and *measure* it — predictive accuracy and a small controlled
  study turn a class project into a research-grade result and a credible
  portfolio piece.
- Open-source the engine: adaptive sequencing with a pluggable problem bank is
  reusable beyond DSA.
- Classroom use (teacher view of a cohort's concept mastery) is a real need
  with little free tooling.
- Student programmes and research/education credits can extend the free runway.

**Threats**
- Free tiers change or expire (the sandbox VM is the nearest cliff — RISKS §4).
- LLM assistants make "solve this problem" trivial; the value has to be in
  *diagnosis and sequencing*, not in holding problems.
- A content takedown request.
- A sandbox escape or a data incident with no backup and no incident plan.
- Burnout: fourteen phases for one person is a long road. The plan is ordered
  so that stopping after any phase still leaves the product better.

---

## 3. Principles for everything that follows

1. **Truth before features.** If the product says it does something, the code
   does it and a test proves it. Fix or remove; never leave a claim hanging.
2. **Zero spend is a hard constraint.** Every design choice is checked against
   `RISKS.md` §3 (free-tier budget). Nothing is introduced that needs a card to
   keep running. Budget alerts are set to notify at the first cent.
3. **The stack is locked.** Next.js on Vercel, FastAPI on Cloud Run, Piston on
   EC2 over Tailscale, Supabase, Gemini, BKT + LinUCB. This plan changes how
   those pieces are used, not which pieces they are. The only place an
   alternative is even mentioned is as a written contingency for a free tier
   ending (RISKS §4).
4. **The server decides.** Anything that affects a score is measured or
   verified on the backend. The browser is a display.
5. **One atomic write per learning event.** A submission either fully happened
   (event, mastery, decision log) or did not.
6. **Everything adaptive is logged so it can be evaluated.** Every decision
   records its context, the action, the probability it was chosen with, and
   later its outcome. Without this, nothing can ever be measured or improved.
7. **Feature flags and reversible migrations.** The project already does this
   well (Turnstile, runtime pins). Keep doing it; every phase ships dark first.
8. **Small commits on `main`, per the repo rules.** Work is sliced so each
   commit leaves production working. Parallel agents own disjoint paths
   (`TEAM_PLAYBOOK.md`).
9. **Fail loudly.** The offline fallback hid a CORS outage for weeks. Keep the
   fallback (it is a repo rule), but every fallback activation must be visible:
   a banner in the UI and an event in Sentry.
10. **Write it down.** Each completed phase gets its `PROJECT_HISTORY.md` entry
    as `CLAUDE.md` requires.

---

## 4. The roadmap at a glance

Effort is in "focused weeks" for one person working with AI agents. Treat the
numbers as relative sizes, not promises.

| Phase | Name | Purpose | Size |
|---|---|---|---|
| **R0** | Truth and safety baseline | Verify live state, backups, environments, schema source of truth, close immediate exposures | 1 |
| **R1** | Integrity of the learning signal | Server-side telemetry, real Run, backend hints, atomic submission, write lock-down | 2 |
| **R2** | Same-origin API and session hardening | First-party cookie, CSRF, trustworthy client IP, session refresh | 1 |
| **R3** | Execution engine v2 | One sandbox call per submission, all four languages, back-pressure, golden-run validation of every problem | 2 |
| **R4** | Backend performance and reliability | Non-blocking data access, no whole-table reads, caching, load test | 1.5 |
| **R5** | Adaptive engine v2 — the policy | Decision log, correct delayed reward, safe concurrent updates, better item selection, simulator | 2 |
| **R6** | Knowledge model v2 — and proof | Fitted parameters, difficulty-aware evidence, forgetting, a standing accuracy report | 2 |
| **R7** | Content originality and quality | Original statements, licensing, stronger tests, editorials, review workflow | 3 (parallel) |
| **R8** | Learner experience | Placement diagnostic, "why this problem", review queue, mobile, accessibility | 2 |
| **R9** | Quality engineering and CI/CD | Test pyramid, CI gates, staging, contract types, migration pipeline | 1.5 (starts in R0) |
| **R10** | Security and privacy programme | Refreshed threat model, authorisation matrix, sandbox depth, privacy accuracy, incident runbook | 1.5 |
| **R11** | Observability, operations, cost guardrails | SLOs, uptime checks, budget alarms, restore drill, runbooks | 1 |
| **R12** | Evidence and launch | Closed beta, controlled comparison, competitor review, public launch | 3 (calendar-bound) |
| **R13** | Growth: classrooms and open engine | Teacher/cohort view, engine extraction, new tracks | open-ended |

### 4.1 Order and dependencies

```
R0 ──► R1 ──► R2 ──► R4 ──► R5 ──► R6 ──► R12 ──► R13
        │      └──► R3 ──┘                 ▲
        │                                  │
        ├──► R7 (content, runs alongside from R1 to R12)
        ├──► R9 (CI ratchet: a slice lands with every phase)
        └──► R10 / R11 (continuous; hard gates before R12)
                      R8 starts after R5 (needs the decision log for "why this problem")
```

Why this order:
- **R0 first** because two findings (F-20, F-22) could mean production is
  already broken or already at risk, and because every later phase needs
  backups and a second environment to be safe.
- **R1 before any model work.** Tuning a model fed constant or forgeable inputs
  is wasted effort. R1 also starts producing clean data, and data takes
  calendar time to accumulate — the earlier it starts, the sooner R6 can fit
  anything.
- **R2 and R3 are independent of each other** (one is auth/network, one is the
  sandbox) and can run in parallel.
- **R4 before R5** so that the new decision-logging writes land on a
  non-blocking, transactional data layer rather than being bolted onto the
  current one.
- **R5 before R6** because the policy bug (F-06) is a pure correctness fix that
  needs no data, while fitting the knowledge model needs the clean data R1
  started collecting.
- **R7 is a separate track** — writing and reviewing content does not touch the
  engine code and should not wait for it.
- **R12 is gated** by R10 and R11: no public launch without backups proven by a
  restore, an incident runbook, and accurate privacy text.

### 4.2 Milestones

| Milestone | Reached after | What you can truthfully say |
|---|---|---|
| **M1 — Honest** | R0–R2 | "Everything the UI shows is real, scores cannot be forged, it works in every major browser, and we can recover from a mistake." |
| **M2 — Solid** | R3–R4 | "All four languages are graded, a classroom can use it at once, every problem's tests are verified against a reference solution." |
| **M3 — Actually adaptive** | R5–R6 | "The policy learns from its own decisions, and here is the report showing how well the knowledge model predicts the next attempt." |
| **M4 — Launchable** | R7–R11 | "Original content, accessible on a phone, tested in CI, monitored, backed up, with a privacy policy that matches reality." |
| **M5 — Evidenced** | R12 | "Here is what happened when real students used it, compared against a static sequence." |

If time runs out, **M3 is the point at which the project's central claim is
true.** Everything before it is prerequisite; everything after it is reach.

---

## 5. What "done" looks like for the whole plan

Product:
- A new student takes a short placement diagnostic, gets a starting mastery
  profile, and is always shown *why* the next problem was chosen.
- Run executes the code against the visible examples; Submit grades against
  hidden tests in Python, JavaScript, Java and C++.
- Mastery moves in proportion to the evidence: harder problems and unaided
  solves count more, repeats count less, and long absences decay it toward
  review.
- Hints come from the backend, are tiered, and the cost shown to the student is
  the cost applied.

Engineering:
- One migration history reproduces the database from empty. Two environments.
- A submission is one transaction. No request reads a whole table.
- CI runs unit, integration and end-to-end tests on every push; a failing test
  blocks a deploy.
- p95 submit latency under 6 s for a 10-test problem at 25 concurrent users on
  the free tiers (target to be confirmed by the R4 load test).

Evidence:
- A standing, regenerated report: AUC / log-loss / calibration of "will the
  next attempt be accepted" for the production model versus simple baselines.
- A logged-propensity decision dataset that allows any new policy to be
  evaluated offline before it is shown to a student.
- One controlled comparison with real users, written up honestly whatever it
  shows.

Operations:
- Nightly encrypted backups with a restore that has actually been performed.
- Alerts for downtime, for sandbox unreachability, for free-tier consumption,
  and for any billing above zero.
- A one-page incident runbook and a key-rotation calendar.

---

## 6. Decisions I need from you

These are yours to make; the plan proceeds on the recommended default until you
say otherwise. None of them blocks R0.

| # | Decision | Recommended default | Needed by |
|---|---|---|---|
| D1 | Turn the backend CI job back on (unit tests only, no live services)? `CLAUDE.md` forbids this without your say-so. | Yes — as a *new* job that runs only tests needing no network, leaving the gated job as is | R0/R9 |
| D2 | Second Supabase project for development (the free plan allows two)? | Yes | R0 |
| D3 | Keep the repo public? | Yes, and keep unfixed findings out of it (already done for the audit file) | now |
| D4 | Bandit scope: one global model, per-student models, or global + per-student correction? | Global model with logged propensities now; revisit with data in R6 | R5 |
| D5 | What to do with the existing mastery numbers once the model changes? | Recompute from the event log where possible; otherwise reset with a notice | R6 |
| D6 | Content: rewrite all 473 statements, or cut to a smaller original set first? | Start with ~120 original, verified problems (10 per concept), grow from there | R7 |
| D7 | Leaderboard: keep public by default, or opt-in? | Opt-in, display name only | R1 |
| D8 | Licence, if the engine is opened | Decide in R12; nothing depends on it earlier | R12 |
| D9 | Apply for student programme benefits (free domain, cloud credits)? | Yes — a domain unlocks the Cloudflare item in `SECURITY.md` §4.3 at no cost | R2 |

---

## 7. How to use this plan with an AI agent

1. Open a session in this repo. The agent reads `CLAUDE.md`, then this file.
2. Tell it which phase and which task ID (e.g. "R1.3"). Each task in
   `PHASES.md` names the files it may touch and its exit test.
3. The agent reads the matching section of `IMPLEMENTATION.md` for the design.
4. It implements, runs the tests named in the task, and commits to `main` with
   the scope prefix the repo already uses.
5. When a phase's exit criteria are all met, it appends the phase to
   `PROJECT_HISTORY.md` Part 3 and updates the "Current state" block in
   `CLAUDE.md`.
6. Tick the phase off in `PHASES.md` (each phase has a status line).

`TEAM_PLAYBOOK.md` has the ready-to-paste brief for each role and the file
ownership map that keeps parallel agents from editing the same file.
