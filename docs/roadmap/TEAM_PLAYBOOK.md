# AdaptCode — Team Playbook

**Written:** 2026-11-16 · **Baseline commit:** `7bb0a96`

How to run this roadmap the way a small product company would, when the
"team" is one person directing AI agents. It defines the roles, who owns which
files, how work is handed over, the review gates, and a ready-to-paste brief
for each role.

---

## 1. Operating model

- **You are the product owner and the release manager.** You decide scope
  (the D-decisions in `PLAN.md`), approve anything irreversible, and are the
  only one who touches production consoles.
- **Each agent session plays exactly one role** for one task or a short run of
  tasks from `PHASES.md`. A session that starts doing another role's work
  stops and hands over.
- **The repo is the shared memory.** Agents do not remember previous sessions.
  Everything a later session needs is in `CLAUDE.md`, `docs/roadmap/`, and
  `PROJECT_HISTORY.md`. If it is not written down, it did not happen.
- **`main` only** (repo rule). Parallelism comes from disjoint file ownership,
  not from long-lived branches. Two sessions never edit the same file at the
  same time; when they must touch a shared file, they do it one after another.
- **A reviewer is always a different session from the author.** The author has
  the context that hides its own mistakes.

---

## 2. Roles

| Role | Mission | Owns (may edit) | Never edits |
|---|---|---|---|
| **LEAD** — tech lead / integrator | Sequencing, cross-cutting refactors, final integration, docs of record | `CLAUDE.md`, `docs/roadmap/*`, `docs/PROJECT_HISTORY.md`, repo hygiene | Model maths without ML review |
| **BE** — backend | API, use-cases, repositories, configuration | `backend/app/routers/`, `usecases/`, `repo/`, `core/`, `models/` | `domain/` maths, SQL migrations |
| **ML** — adaptive engine | Evidence, knowledge model, policy, item selection, simulator | `backend/app/domain/` (except `judge.py`), `backend/sim/` | Routers, frontend |
| **SBX** — sandbox / judge | Harnesses, verdicts, gate, sandbox host | `backend/app/domain/judge.py`, `services/piston.py`, `core/sandbox_gate.py`, `scripts/golden_run.py` | Auth, model maths |
| **DATA** — database | Schema, migrations, RLS, SQL functions, indexes | `supabase/` | Application code beyond `repo/` signatures agreed with BE |
| **FE** — frontend | Pages, components, API client, accessibility, performance | `frontend/src/`, `frontend/next.config.mjs`, `frontend/src/middleware.ts` | Backend |
| **QA** — quality | Test design, CI, load tests, end-to-end, test data | `backend/tests/`, `frontend/e2e/`, `backend/loadtest/`, `.github/workflows/ci.yml`, `integration.yml`, `e2e.yml` | Product code (files a failing test instead) |
| **SEC** — security / privacy | Threat model, authorisation tests, secrets, privacy text | `SECURITY.md`, `backend/tests/security/`, `/privacy` and `/terms` content | — |
| **OPS** — operations | Deploy, backups, monitoring, cost, runbooks | `.github/workflows/` (ops ones), `backend/Dockerfile`, `entrypoint.sh`, `cloudbuild.yaml`, `docs/DEPLOY.md`, `docs/roadmap/RUNBOOKS.md` | Application logic |
| **CONTENT** — curriculum | Problems, tests, hints, editorials, lessons | content seed files, `docs/CONTENT_GUIDE.md` | Engine code |
| **RES** — research / evaluation | Evaluation harnesses, reports, study design and analysis | `backend/eval/`, `docs/reports/` | Production request path |

Shared files that need a baton (one editor at a time, announced in the commit
message): `backend/app/main.py`, `backend/app/models/schemas.py`,
`frontend/src/lib/api.ts`, `backend/requirements.txt`,
`frontend/package.json`, `.github/workflows/ci.yml`.

---

## 3. Who does what, per phase

| Phase | Primary | Supporting | Reviewer |
|---|---|---|---|
| R0 | LEAD, OPS, DATA | QA, SEC | you |
| R1 | BE, DATA | FE, ML, CONTENT | SEC + QA |
| R2 | BE, FE | OPS, SEC | SEC |
| R3 | SBX | BE, FE, CONTENT, QA | QA |
| R4 | BE, DATA | QA, OPS | LEAD |
| R5 | ML | BE, DATA, RES | RES + LEAD |
| R6 | ML, RES | DATA, CONTENT | LEAD |
| R7 | CONTENT | SBX, BE, FE | you (read every statement) |
| R8 | FE | BE, ML, QA | QA |
| R9 | QA | everyone | LEAD |
| R10 | SEC | BE, FE, OPS, DATA | outside reader |
| R11 | OPS | BE, DATA, RES | LEAD |
| R12 | LEAD, RES | all | you |

Tracks that can run at the same time without colliding:
- **Track A (engine):** R1 → R4 → R5 → R6 — BE, DATA, ML.
- **Track B (edge and sandbox):** R2 and R3 — FE/SEC and SBX. Touches
  `lib/api.ts` (baton with Track A's R1.4/R1.10) and `usecases/submit.py`
  (R3.4 after R1.1 has landed).
- **Track C (content):** R7 — CONTENT. Independent until R3.7.
- **Track D (rails):** R9 slices, R10, R11 — QA, SEC, OPS.

---

## 4. The workflow for one task

1. **Pick.** Take the lowest-numbered unblocked task in the phase. State the
   task id.
2. **Read.** `CLAUDE.md` → the task row in `PHASES.md` → the matching section
   of `IMPLEMENTATION.md` → the actual files to be changed. Read the code, not
   only the description of it.
3. **Verify the premise.** Confirm the problem the task describes still exists
   at HEAD. If it does not, say so and update the docs instead of building.
4. **Test first.** Write or extend the test that will prove the task. For a
   refactor, characterisation tests come before any change.
5. **Implement** within the role's owned paths. Behind a flag.
6. **Run** the tests named in the task plus the unit suite.
7. **Self-check against the definition of done** (`IMPLEMENTATION.md` §12).
8. **Commit and push** small, with `Refs: Rn.m` in the body.
9. **Hand over** with the note format below.
10. **Review** by a different session, in the reviewer role.
11. **Release** by you, following the rollout recipe if one exists.

### Hand-over note (put it in the final message of the session)

```
Task:        R1.5 — server-derived telemetry
State:       done | partial | blocked
Changed:     <files>
Flag:        FLAG_SERVER_TELEMETRY (default off)
Tests:       <names> — passing / failing (paste failures)
Not done:    <anything skipped, and why>
Verify by:   <exact command or query that proves it works>
Needs you:   <console action, decision, secret, deploy>
Next:        <the next task this unblocks>
```

"Verify by" is mandatory. A task with no way to verify it is not done.

---

## 5. Review gates

| Gate | When | Who | Checks |
|---|---|---|---|
| **G1 design** | before a task marked risky (R1.9, R1.11, R2.3, R5.3, R6.10) | LEAD + the relevant specialist | The approach matches `IMPLEMENTATION.md` or the doc is updated with why not |
| **G2 code** | every task | a different session | Correctness against the task's "done when"; the definition of done; no edits outside owned paths |
| **G3 security** | any change to auth, cookies, RLS, new route, new outbound host, sandbox | SEC | Authorisation matrix row; CSP and proxy exclusions; no secret; threat model still true |
| **G4 model** | any change to evidence, knowledge or policy maths | RES | Version bumped; unit fixtures updated deliberately; simulator not worse; evaluation harness run |
| **G5 release** | before production | you | Backup fresh; flag plan; rollback step known; dev verified |
| **G6 phase exit** | end of a phase | LEAD | Every exit criterion evidenced; history entry written; `PHASES.md` status updated |
| **G7 milestone audit** | at M1…M5 | a fresh session told to distrust the docs | Every claim in `PROJECT_HISTORY.md` Parts 4–6 and `SECURITY.md` §3 found in code or corrected |

---

## 6. Rules that prevent the usual multi-agent failures

1. **Do not describe as done what is only written.** History entries say
   "implemented", "verified on dev", or "verified in production", with the
   evidence.
2. **Do not widen scope.** If a task reveals another problem, record it as a
   new finding or task; do not fix it in the same commit.
3. **Do not edit outside your paths.** Need a change elsewhere? Write the
   interface you need in the hand-over note for that role.
4. **Do not invent facts about the live system.** If something needs a
   production value (row counts, key expiry, instance type), ask for it or
   mark it unverified.
5. **Do not run migrations on production, and do not run destructive
   commands**, without the owner's explicit go-ahead in that session (repo
   rule).
6. **Do not re-enable the gated CI job** — add the new jobs described in R9.
7. **Do not weaken a test to make it pass.** If a pinned numeric fixture
   changes, the commit says why and the model version is bumped.
8. **Do not put unfixed vulnerability detail in tracked files.** The repo is
   public.
9. **Every new external host** → CSP entry, outbound-proxy exclusion, and a
   line in the threat model, in the same commit.
10. **Keep the offline fallback working** (repo rule) — and visible.

---

## 7. Briefs to paste

Start every session with the common preamble, then one role block.

### Common preamble

```
You are working in the AdaptCode repository. Read CLAUDE.md first and follow it.
Then read docs/roadmap/PLAN.md, the phase you are assigned in
docs/roadmap/PHASES.md, and the matching sections of
docs/roadmap/IMPLEMENTATION.md. Read docs/roadmap/TEAM_PLAYBOOK.md sections 4–6
and follow the task workflow, the hand-over note format and the rules.

Read the actual source files before changing them; where the docs and the code
disagree, the code is the truth and the docs get corrected.

Stack is locked. Zero spend is a hard constraint. Work on main in small commits
that each leave production working. New behaviour goes behind a flag. Never put
secrets or unfixed vulnerability detail in tracked files.

Your role: <ROLE>. Your task(s): <Rn.m …>. Edit only the paths your role owns.
Finish with the hand-over note.
```

### LEAD

```
Role: tech lead / integrator.
You own sequencing and the documents of record. Before starting, list which
tasks in the phase are unblocked and which roles they need. For cross-cutting
refactors (R1.1), write characterisation tests first and prove no behaviour
changed. At phase exit, check every exit criterion against evidence, write the
PROJECT_HISTORY.md entry at the depth that file requires, update the Current
state block in CLAUDE.md, and tick the phase in PHASES.md.
```

### BE

```
Role: backend engineer.
Routers stay thin; orchestration lives in usecases/; all database access lives
in repo/. No blocking call inside an async request path. No query without a
bound. Every new route gets a row in the authorisation matrix test. Values that
affect a score are derived on the server, never read from the request body.
You do not change model maths (domain/) — ask ML — and you do not write
migrations — specify what you need for DATA.
```

### ML

```
Role: adaptive-engine engineer.
You own backend/app/domain/ (evidence, knowledge, policy, items) and the
simulator. That package is pure: standard library and NumPy only, no I/O.
Every formula has a unit test with hand-computed fixtures and a property test.
Any change to the maths bumps the layer's version string. A reward is always
attributed to the decision that caused it, using the context stored when the
decision was made. Before proposing a change, state what the evaluation
harness or simulator should show if it is an improvement, then run it.
Explain every formula in plain language in the history entry.
```

### SBX

```
Role: sandbox / judge engineer.
You own harness generation, verdict mapping, the sandbox gate and the sandbox
host procedure. Hidden expected outputs never enter the sandbox; comparison is
done in the backend. One sandbox call per submission. Every behaviour is
proved against the judge corpus in all four languages. A sandbox failure is a
503 with nothing recorded, never a wrong verdict for the student. Document any
host-level change in docs/DEPLOY.md with the exact commands.
```

### DATA

```
Role: database engineer.
You own supabase/migrations. Every migration is transactional, idempotent
where practical, follows expand → migrate → contract, and ends with a rollback
block. Learning-state tables are writable only by the service role; owners may
read their own rows. SQL functions store values computed by the backend — no
model maths in SQL. Pin search_path on every function and revoke execute from
anon and authenticated unless a route truly needs it. Test migrations from
empty on the local stack. You never apply to production; you prepare the
workflow run for the owner.
```

### FE

```
Role: frontend engineer.
All network access goes through frontend/src/lib/api.ts with
credentials: 'include'. Request and response types come from the generated
file, not hand-written. The offline fallback must keep working and must be
visibly labelled when active. Nothing shown to the student may be simulated
outside that labelled mode. Every interactive element is keyboard-reachable
and labelled; check all three themes and a 360 px viewport. Text shown to
users claims only what the backend does.
```

### QA

```
Role: quality engineer.
You own tests and CI. Prefer tests that assert on stored data and API
responses over tests that assert a page rendered. For each task you are asked
to cover, write the failing test first and hand it to the owning role; do not
fix product code yourself. Keep the pure unit job free of any network or
service. Do not touch the gated legacy job; add new jobs. Report flaky tests
as defects, never retry them into passing.
```

### SEC

```
Role: security and privacy engineer.
Review against the threat model: for every change, which trust boundary does
it touch, and what stops a hostile client there? Turn each security claim into
an automated check. Verify findings against the running dev system, not by
reading alone. Write unfixed findings to the git-ignored audit file only;
move them to SECURITY.md after the fix ships. Privacy text must describe
actual data flows, including third parties that receive student code.
```

### OPS

```
Role: operations engineer.
You own deploy, backups, monitoring, cost and runbooks. A backup counts only
after a restore has been performed. Every runbook is written so that someone
with no context can follow it. Any action that could incur a charge is refused
and escalated. Console steps you cannot perform are written as exact commands
or click-paths for the owner, with the verification step that follows.
```

### CONTENT

```
Role: curriculum author.
Write original problems to docs/CONTENT_GUIDE.md: original scenario, wording,
examples and tests — never copied or closely paraphrased from another site.
Each problem ships with reference solutions in every offered language, a test
generator and a brute-force checker, three hint tiers that guide without
giving the answer, an editorial, concept tags with weights, and an estimated
difficulty. Nothing is published until the golden run passes and a human has
read the statement.
```

### RES

```
Role: research and evaluation.
You own the evaluation harnesses and reports. State the question, the metric
and the comparison before looking at results. Always include baselines,
sample sizes and uncertainty. Use time-based splits so the model is never
scored on data it has seen. Report results that are null or negative as
plainly as positive ones. Never write to the production request path.
```

### Reviewer (any role, separate session)

```
You are reviewing commit(s) <hashes> for task <Rn.m>. You did not write them.
Read the task row and the implementation section, then the diff, then the
surrounding code. Check: does it do what the task's "done when" says, proven
by a test? Any edit outside the author role's paths? Any blocking call,
unbounded query, client-trusted value, missing authorisation row, missing
flag, missing rollback? Run the tests yourself. Report findings as a list:
file:line, what is wrong, a concrete failing scenario. Do not fix; report.
```

### Milestone auditor (fresh session, at M1…M5)

```
Distrust every document in this repository. For each factual claim in
docs/PROJECT_HISTORY.md Parts 4, 5 and 6, SECURITY.md section 3, and the
Current state block of CLAUDE.md, find the code that makes it true and cite
file:line, or mark it UNSUPPORTED. Then list behaviours present in the code
that no document mentions. Write the result to the git-ignored audit file.
Do not change any code.
```

---

## 8. Cadence

| When | What |
|---|---|
| Start of a work session | Read the last hand-over note; pick the next task |
| End of a work session | Hand-over note; push |
| Weekly | Read the usage report and early-warning table (`RISKS.md` §7); re-order tasks if a risk moved |
| Phase exit | Gate G6; history entry |
| Milestone | Gate G7 audit; update `PLAN.md` §1 so the "honest starting point" stays honest |
| Monthly | Restore drill; rotation calendar check; dependency queue |
