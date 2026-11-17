# AdaptCode — Implementation Guide

**Written:** 2026-11-16 · **Baseline commit:** `7bb0a96`

The engineering detail behind `PHASES.md`. Each section names the phase tasks
it serves.

> **Status of the code in this file.** Everything here is a *reference design*
> written against the code at the baseline commit. None of it has been run.
> Treat SQL and code blocks as the intended shape, to be implemented with
> tests, not pasted. Where a platform behaviour is assumed (Vercel proxying,
> Piston limits, Supabase pooling, free-tier numbers) it is marked **CHECK** —
> confirm against the vendor's current documentation before relying on it.

Contents
1. Working conventions
2. Database: migrations, new tables, the atomic write
3. Judge: Run, batched execution, typed harnesses, verdicts
4. Knowledge model: evidence, update, difficulty, forgetting, fitting
5. Policy: decision log, LinUCB, reward, item selection, evaluation
6. Same-origin API, cookies, CSRF, client address
7. Backend structure and data access
8. Frontend changes
9. Testing strategy
10. CI/CD workflows
11. Rollout recipes
12. Definition of done

---

## 1. Working conventions

- **Branching.** Work on `main` (repo rule). Each task is one or more small
  commits that each leave production working. Use the existing prefixes:
  `feat(backend):`, `fix(frontend):`, `sec(db):`, `test:`, `docs:`, `chore:`.
  Include the task id in the body: `Refs: R1.5`.
- **Flags.** Environment-driven booleans read once in `core/flags.py`
  (`FLAG_REAL_RUN`, `FLAG_SERVER_TELEMETRY`, `FLAG_POLICY_V2`, …). Default off.
  A flag is deleted in the commit after it has been on in production for a
  week without incident.
- **Versions.** Three strings stamped onto what each layer writes:
  `EVIDENCE_VERSION`, `KT_VERSION`, `POLICY_VERSION` (e.g. `ev2`, `kt1`,
  `linucb-v2`). Bump on any change to the maths.
- **Purity.** `backend/app/domain/` contains only standard library + NumPy.
  A test asserts it imports nothing from `repo`, `services`, `routers`,
  `fastapi`, `supabase`, `httpx`.
- **No secrets in the repo**, including in this folder. Unfixed security
  findings stay in the git-ignored audit file.

---

## 2. Database

### 2.1 Migration system (R0.7, R9.8)

Adopt the Supabase CLI layout:

```
supabase/
  config.toml
  migrations/
    20261117000000_baseline.sql          # dump of the live schema, policies, functions
    20261120000000_r1_attempts.sql
    ...
  seed.sql                               # dev-only personas and a small problem set
```

Baseline procedure:
1. `supabase db dump --schema public` against production → baseline file
   (review it; remove nothing).
2. Mark it as already applied on production (migration repair) so the CLI does
   not try to re-run it.
3. `supabase db reset` locally → diff the local schema against production; the
   diff must be empty before anything else is built on it.
4. Apply to the dev project from empty.

Rules for every later migration:
- Idempotent where practical (`if not exists`), wrapped in a transaction.
- **Expand → migrate → contract** across separate commits.
- A `-- rollback:` comment block at the bottom with the exact undo statements.
- Never edit an applied migration; add a new one.
- Production application is a manually triggered workflow that takes a backup
  first (§10).

### 2.2 New and changed tables (R1.2, R4.4, R5.2, R6)

Names keep the existing `session_events` / `active_problem_state` tables and
add columns, to avoid a risky rename; the docs call them "attempts" and
"attempt state". A rename can be a later cosmetic migration.

```sql
-- R1: attempts (extends session_events)
alter table public.session_events
  add column if not exists kind text not null default 'submit'
      check (kind in ('run','submit','abandon')),
  add column if not exists language text,
  add column if not exists passed int,
  add column if not exists total int,
  add column if not exists runtime_ms int,
  add column if not exists code_sha256 text,
  add column if not exists client_attempt_id uuid,
  add column if not exists is_first_solve boolean,
  add column if not exists failed_submits_before int,
  add column if not exists runs_before int,
  add column if not exists max_hint_tier smallint,
  add column if not exists evidence_weight numeric(4,3),
  add column if not exists evidence_version text,
  add column if not exists kt_version text;

create unique index if not exists uq_events_client_attempt
  on public.session_events (student_id, client_attempt_id)
  where client_attempt_id is not null;

create index if not exists idx_events_student_problem_time
  on public.session_events (student_id, problem_id, "timestamp" desc);

-- R1: attempt state (extends active_problem_state)
alter table public.active_problem_state
  add column if not exists started_at timestamptz not null default now(),
  add column if not exists runs int not null default 0,
  add column if not exists failed_submits int not null default 0,
  add column if not exists compile_errors int not null default 0,
  add column if not exists max_hint_tier smallint not null default 0,
  add column if not exists decision_id uuid;          -- the decision that served this problem (R5)

-- R1: hints
create table if not exists public.hints (
  problem_id uuid not null references public.problems(problem_id) on delete cascade,
  tier smallint not null check (tier between 1 and 3),   -- 1 nudge, 2 scaffold, 3 near-solution
  body text not null,
  primary key (problem_id, tier)
);

create table if not exists public.hint_reveals (
  student_id uuid not null references public.users(user_id) on delete cascade,
  problem_id uuid not null references public.problems(problem_id) on delete cascade,
  tier smallint not null,
  initiated_by text not null default 'student' check (initiated_by in ('student','system')),
  revealed_at timestamptz not null default now(),
  primary key (student_id, problem_id, tier)
);

-- R1/R6: mastery
alter table public.mastery_scores
  add column if not exists evidence_count int not null default 0,
  add column if not exists distinct_solved int not null default 0,
  add column if not exists hardest_solved text,
  add column if not exists last_practiced_at timestamptz,
  add column if not exists provisional boolean not null default false,
  add column if not exists kt_version text;
alter table public.mastery_scores
  alter column mastery_probability type numeric(6,5);     -- 3 decimals is too coarse

create table if not exists public.mastery_history (
  id bigint generated always as identity primary key,
  student_id uuid not null,
  concept_tag text not null,
  event_id uuid,
  before numeric(6,5) not null,
  after  numeric(6,5) not null,
  kt_version text not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_mh_student_concept_time
  on public.mastery_history (student_id, concept_tag, created_at);

-- R4: per-problem aggregates (no table scans for the catalogue)
create table if not exists public.problem_stats (
  problem_id uuid primary key references public.problems(problem_id) on delete cascade,
  students_attempted int not null default 0,
  students_accepted  int not null default 0,
  submits int not null default 0,
  updated_at timestamptz not null default now()
);

-- R3: publication state
alter table public.problems
  add column if not exists status text not null default 'published'
      check (status in ('draft','published','retired')),
  add column if not exists languages text[] not null default '{python,javascript}';

-- R5: decision log
create table if not exists public.bandit_decisions (
  decision_id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.users(user_id) on delete cascade,
  policy_version text not null,
  policy_kind text not null default 'bandit' check (policy_kind in ('bandit','explore','override','fixed')),
  context double precision[] not null,
  allowed smallint[] not null,
  action smallint not null,
  propensity double precision not null check (propensity > 0 and propensity <= 1),
  concept_tag text not null,
  problem_id uuid references public.problems(problem_id) on delete set null,
  reason jsonb,
  created_at timestamptz not null default now(),
  outcome text check (outcome in ('solved','failed','abandoned','expired')),
  reward double precision,
  rewarded_at timestamptz,
  applied boolean not null default false          -- has this reward been folded into the model?
);
create index if not exists idx_bd_student_open
  on public.bandit_decisions (student_id, created_at desc) where rewarded_at is null;

-- R5: model state, one row per (policy, action); arrays are flattened row-major
create table if not exists public.bandit_models (
  policy_version text not null,
  action smallint not null,
  d smallint not null,
  a double precision[] not null,       -- d*d, starts as identity * ridge
  b double precision[] not null,       -- d, starts as zeros
  n bigint not null default 0,
  updated_at timestamptz not null default now(),
  primary key (policy_version, action)
);

-- R6: item and concept parameters
create table if not exists public.item_params (
  problem_id uuid primary key references public.problems(problem_id) on delete cascade,
  difficulty double precision not null default 0,    -- logit scale; 0 = average
  n int not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.bkt_params
  add column if not exists kt_version text not null default 'kt0',
  add column if not exists half_life_days numeric not null default 45,
  add column if not exists n_observations int not null default 0,
  add column if not exists fitted_at timestamptz;

create table if not exists public.problem_concepts (
  problem_id uuid not null references public.problems(problem_id) on delete cascade,
  concept_tag text not null,
  weight numeric(3,2) not null default 1.0 check (weight > 0 and weight <= 1),
  primary key (problem_id, concept_tag)
);

-- R1: consent
alter table public.users
  add column if not exists leaderboard_opt_in boolean not null default false,
  add column if not exists onboarding_completed_at timestamptz;
```

### 2.3 Row-level security after R1.11

```sql
-- learning-state tables: owner may read, nobody but service_role may write
do $$
declare t text;
begin
  foreach t in array array['mastery_scores','session_events','sessions',
                           'active_problem_state','explanations','agent_state',
                           'hint_reveals','mastery_history','bandit_decisions']
  loop
    execute format('alter table public.%I enable row level security', t);
    -- drop every existing policy on the table, then recreate read-only
    perform 1;
  end loop;
end $$;
-- then, per table (explicit statements, not dynamic, in the real migration):
--   drop policy if exists "<each write policy by name>" on public.<t>;
--   create policy "<t>_owner_select" on public.<t>
--     for select to authenticated using ((select auth.uid()) = student_id);
```

Write the real migration with explicit `drop policy` statements using the
names found by the R0.1 query, so the diff is reviewable. Tables with no
policies (`hints`, `problem_stats`, `bandit_models`, `item_params`,
`problem_concepts`, `problems`) are reachable only by the service role.

Order of operations is critical — see §11.1. Dropping policies before the
backend has switched to service-role writes breaks every submit.

### 2.4 The atomic write: `record_submission` (R1.9, R5.5)

Python computes everything; SQL only stores it, inside one transaction.

```sql
create or replace function public.record_submission(p jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
declare
  v_event_id uuid;
  v_existing uuid;
  v_first_attempt boolean;
  v_first_accept boolean;
begin
  -- idempotency
  select event_id into v_existing
    from session_events
   where student_id = (p->>'student_id')::uuid
     and client_attempt_id = (p->>'client_attempt_id')::uuid;
  if v_existing is not null then
    return jsonb_build_object('event_id', v_existing, 'duplicate', true);
  end if;

  -- facts needed for problem_stats, read before the insert
  select not exists (select 1 from session_events
                      where student_id = (p->>'student_id')::uuid
                        and problem_id = (p->>'problem_id')::uuid
                        and kind = 'submit')
    into v_first_attempt;
  select not exists (select 1 from session_events
                      where student_id = (p->>'student_id')::uuid
                        and problem_id = (p->>'problem_id')::uuid
                        and final_verdict = 'Accepted')
    into v_first_accept;

  insert into session_events (session_id, student_id, problem_id, concept_tag,
      difficulty_level, kind, language, final_verdict, passed, total, runtime_ms,
      time_on_task_seconds, hint_used, max_hint_tier, attempt_count,
      failed_submits_before, runs_before, compile_errors, code_sha256,
      client_attempt_id, is_first_solve, evidence_weight, evidence_version,
      kt_version, abandoned, reward_signal)
  select (p->>'session_id')::uuid, (p->>'student_id')::uuid, (p->>'problem_id')::uuid,
      p->>'concept_tag', p->>'difficulty_level', p->>'kind', p->>'language',
      p->>'final_verdict', (p->>'passed')::int, (p->>'total')::int, (p->>'runtime_ms')::int,
      (p->>'time_on_task_seconds')::int, (p->>'max_hint_tier')::int > 0,
      (p->>'max_hint_tier')::smallint, (p->>'failed_submits_before')::int + 1,
      (p->>'failed_submits_before')::int, (p->>'runs_before')::int,
      (p->>'compile_errors')::int, p->>'code_sha256', (p->>'client_attempt_id')::uuid,
      (p->>'is_first_solve')::boolean, (p->>'evidence_weight')::numeric,
      p->>'evidence_version', p->>'kt_version', p->>'kind' = 'abandon',
      (p->>'evidence_weight')::numeric
  returning event_id into v_event_id;

  -- mastery (one row per affected concept)
  insert into mastery_scores as m (student_id, concept_tag, mastery_probability,
      evidence_count, distinct_solved, hardest_solved, last_practiced_at, kt_version, provisional)
  select (p->>'student_id')::uuid, c->>'concept_tag', (c->>'after')::numeric,
         (c->>'evidence_count')::int, (c->>'distinct_solved')::int, c->>'hardest_solved',
         now(), p->>'kt_version', false
    from jsonb_array_elements(p->'mastery') c
  on conflict (student_id, concept_tag) do update
     set mastery_probability = excluded.mastery_probability,
         evidence_count = excluded.evidence_count,
         distinct_solved = excluded.distinct_solved,
         hardest_solved = excluded.hardest_solved,
         last_practiced_at = excluded.last_practiced_at,
         kt_version = excluded.kt_version,
         provisional = false;

  insert into mastery_history (student_id, concept_tag, event_id, before, after, kt_version)
  select (p->>'student_id')::uuid, c->>'concept_tag', v_event_id,
         (c->>'before')::numeric, (c->>'after')::numeric, p->>'kt_version'
    from jsonb_array_elements(p->'mastery') c;

  -- problem stats (distinct-student semantics, as the current endpoint computes)
  insert into problem_stats as s (problem_id, students_attempted, students_accepted, submits)
  values ((p->>'problem_id')::uuid,
          case when v_first_attempt then 1 else 0 end,
          case when v_first_accept and p->>'final_verdict' = 'Accepted' then 1 else 0 end,
          1)
  on conflict (problem_id) do update
     set students_attempted = s.students_attempted + excluded.students_attempted,
         students_accepted  = s.students_accepted  + excluded.students_accepted,
         submits = s.submits + 1,
         updated_at = now();

  -- close the decision that served this problem, fold its reward into the model (R5)
  if p ? 'closed_decision' then
    update bandit_decisions d
       set outcome = p->'closed_decision'->>'outcome',
           reward = (p->'closed_decision'->>'reward')::float8,
           rewarded_at = now(),
           applied = (p->'closed_decision'->>'train')::boolean
     where d.decision_id = (p->'closed_decision'->>'decision_id')::uuid
       and d.rewarded_at is null;                -- never reward twice
    if found and (p->'closed_decision'->>'train')::boolean then
      update bandit_models bm
         set a = (select array_agg(x + y order by i)
                    from unnest(bm.a, array(select jsonb_array_elements_text(p->'closed_decision'->'delta_a')::float8))
                         with ordinality as t(x, y, i)),
             b = (select array_agg(x + y order by i)
                    from unnest(bm.b, array(select jsonb_array_elements_text(p->'closed_decision'->'delta_b')::float8))
                         with ordinality as t(x, y, i)),
             n = bm.n + 1, updated_at = now()
       where bm.policy_version = p->'closed_decision'->>'policy_version'
         and bm.action = (p->'closed_decision'->>'action')::smallint;
    end if;
  end if;

  -- open the next decision
  if p ? 'next_decision' then
    insert into bandit_decisions (decision_id, student_id, policy_version, policy_kind,
        context, allowed, action, propensity, concept_tag, problem_id, reason)
    select (n->>'decision_id')::uuid, (p->>'student_id')::uuid, n->>'policy_version',
        n->>'policy_kind',
        array(select jsonb_array_elements_text(n->'context')::float8),
        array(select jsonb_array_elements_text(n->'allowed')::smallint),
        (n->>'action')::smallint, (n->>'propensity')::float8,
        n->>'concept_tag', (n->>'problem_id')::uuid, n->'reason'
      from (select p->'next_decision' as n) q;
  end if;

  -- attempt state: solved or abandoned closes it; a failed submit increments
  if p->>'final_verdict' = 'Accepted' or p->>'kind' = 'abandon' then
    delete from active_problem_state
     where student_id = (p->>'student_id')::uuid and problem_id = (p->>'problem_id')::uuid;
  else
    update active_problem_state
       set failed_submits = failed_submits + 1
     where student_id = (p->>'student_id')::uuid and problem_id = (p->>'problem_id')::uuid;
  end if;

  return jsonb_build_object('event_id', v_event_id, 'duplicate', false);
end $$;

revoke all on function public.record_submission(jsonb) from public, anon, authenticated;
grant execute on function public.record_submission(jsonb) to service_role;
```

Why the model update is an **additive delta**: `A += x xᵀ` and `b += r x` are
commutative, so applying them inside `UPDATE … SET a = a + delta` under the
row lock means concurrent submissions can never overwrite each other —
unlike today's read–modify–write of a JSON blob. The inverse is computed in
Python on read; at `d ≤ 24` that costs microseconds.

Things to get right when implementing:
- `unnest(a, b) with ordinality` requires equal lengths; assert `array_length`
  in the function and raise otherwise.
- The duplicate-request path must return the stored verdict payload so the
  client sees the same response; store the response JSON on the event row or
  recompute it from the row.
- Write a test that raises an exception at each statement boundary and asserts
  zero rows changed.

---

## 3. Judge

### 3.1 Run versus Submit (R1.3)

| | `POST /api/run` | `POST /api/submit` |
|---|---|---|
| Test cases | visible examples only (and optionally one custom input) | all, including hidden |
| Returns | per-case input, expected, actual, stdout, status | verdict, passed/total, first failing *visible* case; hidden cases reported by index and status only |
| Effect on mastery | none | yes |
| Recorded | increments `runs`, `compile_errors` in attempt state | full attempt row |
| Quota | generous per-minute and per-day bucket | existing daily cap |

**Rule that keeps grading honest:** expected outputs for hidden cases are never
sent to the sandbox. The driver only *produces* outputs; comparison happens in
the backend. A student who controls the process can print anything, but cannot
print the right answers without computing them.

### 3.2 Batched driver (R3.2)

One program per submission. Input on stdin is a JSON document
`{"cases": [[arg1, arg2, …], …], "limit_ms": 1000}`. Output is one line per
case, each prefixed with a per-request random marker generated by the backend
(so ordinary `print` debugging in student code cannot be confused with a
result line).

Python driver, appended after the student's code:

```python
import sys, json, time, io, signal, contextlib

def _ac_main(marker, fn_name):
    doc = json.loads(sys.stdin.read())
    limit = doc.get("limit_ms", 1000) / 1000.0
    def _alarm(*_): raise TimeoutError()
    signal.signal(signal.SIGALRM, _alarm)
    for i, args in enumerate(doc["cases"]):
        buf = io.StringIO()
        rec = {"i": i}
        t0 = time.perf_counter()
        try:
            signal.setitimer(signal.ITIMER_REAL, limit)
            with contextlib.redirect_stdout(buf):
                out = getattr(Solution(), fn_name)(*args)   # fresh instance per case
            signal.setitimer(signal.ITIMER_REAL, 0)
            rec.update(status="ok", out=out)
        except TimeoutError:
            rec.update(status="tle")
        except RecursionError:
            rec.update(status="rte", err="RecursionError")
        except BaseException as e:                          # includes SystemExit
            signal.setitimer(signal.ITIMER_REAL, 0)
            rec.update(status="rte", err=f"{type(e).__name__}: {e}"[:300])
        rec["ms"] = int((time.perf_counter() - t0) * 1000)
        rec["stdout"] = buf.getvalue()[:2000]
        try:
            line = json.dumps(rec, separators=(",", ":"))
        except (TypeError, ValueError):
            line = json.dumps({"i": i, "status": "rte", "err": "result is not JSON-serialisable"})
        sys.__stdout__.write(f"{marker}{line}\n")
        sys.__stdout__.flush()
```

Design points:
- A per-case time limit via `setitimer` turns one infinite loop into one `tle`
  record instead of losing every later case. It does not interrupt a tight C
  loop; the sandbox's overall timeout remains the backstop, and any case with
  no record is reported as "not run".
- Results are flushed per case so a later crash does not lose earlier results.
- Test arguments are deep-copied by `json.loads`, so a solution that mutates
  its input cannot affect later cases.
- Compare with the existing `_normalize_for_compare` semantics; add an optional
  per-problem comparison mode: `exact`, `unordered` (sort before compare),
  `float` (tolerance), `checker` (R7.6).

JavaScript uses the same protocol. Node has no safe in-process preemption, so
the JavaScript driver relies on the overall timeout and reports the first
missing record as `tle`.

**Sandbox limits — CHECK.** `services/piston.py` notes the host caps
`run_timeout` at 3000 ms. A batched run needs a budget for the whole set
(for example 10 s). Either raise the host's configured maximum run time, or
split the cases into chunks that fit the cap. Decide after measuring; do not
guess.

### 3.3 Typed harness for Java and C++ (R3.3)

Generated from `starter_code._meta` (`function_name`, `parameters[{name,type}]`,
`return_type`). Approach:

1. Enumerate the type signatures actually present in the problem bank (a
   one-off script). Expect a small set: `int`, `long`, `double`, `boolean`,
   `String`, 1-D and 2-D arrays/lists of those, and possibly linked-list and
   tree node types.
2. Implement a minimal JSON reader/writer for exactly that set in each
   language (no external libraries are available in the sandbox). Keep it in a
   template file per language, unit-tested through the judge corpus.
3. Generate `main` that reads the cases document, loops, calls the method on a
   fresh `Solution`, catches exceptions per case, prints marker lines.
4. Any problem whose signature is outside the supported set gets that language
   removed from `problems.languages` — the UI already hides missing tabs.

Linked lists and trees are serialised in the conventional level-order array
form; build/flatten helpers live in the template.

### 3.4 Verdict mapping (R3.4)

```
compile stage non-zero            → compile_error      (attempt recorded, counts as compile error)
any case status tle / missing     → time_limit_exceeded
any case status rte               → runtime_error
output larger than cap            → output_limit_exceeded
any case compares unequal         → wrong_answer
all equal, total > 0              → accepted
sandbox unreachable / 5xx / gate full → HTTP 503 to the client; NOTHING recorded
```

Precedence when several apply: compile error, then the status of the first
failing case in order.

### 3.5 Sandbox gate (R3.5)

```python
# core/sandbox_gate.py — reference shape
class SandboxGate:
    def __init__(self, max_concurrent: int, max_waiting: int, wait_seconds: float): ...
    async def __aenter__(self):
        if self._waiting >= self.max_waiting:
            raise SandboxBusy(retry_after=2)
        self._waiting += 1
        try:
            await asyncio.wait_for(self._sem.acquire(), timeout=self.wait_seconds)
        except asyncio.TimeoutError:
            raise SandboxBusy(retry_after=3)
        finally:
            self._waiting -= 1
    async def __aexit__(self, *exc): self._sem.release()
```

The gate is per instance. With Cloud Run's instance cap of 5, the effective
ceiling on the sandbox is `5 × max_concurrent`; size `max_concurrent` from a
measured test of the host (start at 2). A global queue would need shared state
and is not worth it at this scale.

### 3.6 Golden run (R3.7)

`backend/scripts/golden_run.py --env dev [--concept X] [--language Y]`:
for each published problem and each language in `problems.languages`, wrap the
stored reference solution, execute against all cases, and emit a table:
problem, language, verdict, slowest case ms, number of hidden cases, flaky
(run twice, compare). Exit non-zero if any published problem fails. Reference
solutions are needed per language; where one is missing, that language is
removed for that problem until it exists.

---

## 4. Knowledge model

### 4.1 Evidence weight v2 (R1.5, R1.8) — `domain/evidence.py`

Inputs are all server-derived:

```
accepted            bool
first_solve         bool    # no earlier Accepted for this (student, problem)
max_hint_tier       0..3    # student-initiated reveals only
failed_before       int     # failed submits on this attempt
elapsed_s           int     # server clock
difficulty          easy|medium|hard
```

```
if not accepted:                 w = 0, direction = negative
elif not first_solve:            no knowledge update (recorded as practice only)
else:
    hint_factor  = {0: 1.00, 1: 1.00, 2: 0.70, 3: 0.40}[max_hint_tier]
    retry_factor = 1 − 0.08 · min(failed_before, 5)          # 1.00 … 0.60
    time_factor  = 0.90 if elapsed_s > slow_threshold(difficulty) else 1.00
    w = max(0.20, hint_factor · retry_factor · time_factor)
```

- The hint factors are the ones the UI already advertises (`data/hints.ts`),
  so the label and the maths finally agree. The API returns the factor with
  the hint list; the UI renders what it is given.
- Compile errors are dropped from the weight (weak signal, easy to inflate by
  accident) but still recorded for analysis.
- A floor of 0.20 means a solved problem is never treated as a failure.
- A *failed* submit is negative evidence once per attempt, not once per click:
  only the first failed submit of an attempt applies a negative update;
  later failures on the same attempt are recorded but do not keep pushing
  mastery down. (Otherwise ten retries of a typo destroys a concept.)

### 4.2 The update (unchanged form) — `domain/knowledge.py`

```
P(obs | L)  = w·(1 − pS) + (1 − w)·pS
P(obs | ¬L) = w·pG       + (1 − w)·(1 − pG)
post        = P(obs|L)·L / (P(obs|L)·L + P(obs|¬L)·(1 − L))
L'          = post + (1 − post)·pT
```

The blended-likelihood form is this project's own extension of standard BKT.
Keep it, but treat it as a hypothesis: R6.1's harness is what says whether it
predicts better than plain 0/1 BKT. Add a property test: `L'` is monotone
non-decreasing in `w`.

### 4.3 Difficulty-aware guess and slip (R6.4)

An easy problem can be solved without real mastery; a hard one can be failed
with it. Express that through the per-observation parameters:

```
pG_item = clamp(pG_c · g[difficulty], 0.02, 0.45)     g = {easy: 1.5, medium: 1.0, hard: 0.5}
pS_item = clamp(pS_c · s[difficulty], 0.02, 0.45)     s = {easy: 0.75, medium: 1.0, hard: 1.5}
```

Once `item_params` has estimates (R6.5), replace the three-level table with a
smooth function of the item's difficulty relative to the concept average.

**This alone is not sufficient.** A hand calculation with the default
parameters and the easy multipliers still takes a student from 0.30 to about
0.85 in two clean easy solves, because `pT = 0.12` is large. That is why R6.6
adds an explicit evidence requirement, and why fitting (R6.8) matters.

### 4.4 Mastered means more than a number (R6.6)

```
mastered(concept) :=
      effective_mastery ≥ 0.85
  and distinct_solved   ≥ 3
  and hardest_solved    ∈ {medium, hard}
```

`MASTERY_THRESHOLD` stays the single constant; the extra conditions live next
to it in `prerequisites.py`. The UI shows progress toward each condition
("2 of 3 problems, needs one medium") so the rule is transparent.

### 4.5 Forgetting (R6.7)

Applied when mastery is *read*, never written back on its own:

```
Δ    = days since last_practiced_at
L_eff = l0 + (L − l0) · 2^(−Δ / half_life)          if L > l0, else L
```

Default `half_life = 45` days per concept, fitted later. The stored value is
the last posterior; a new observation starts from `L_eff`. This makes absence
visible (review queue) without destroying history, and it is reversible.

### 4.6 Item difficulty (R6.5) — `domain/items.py`

On a first-attempt outcome `y ∈ {0,1}` for student mastery `L` on the item's
concept:

```
θ  = logit(clamp(L_eff, 0.02, 0.98))
p  = σ(θ − b_item)
K  = K0 / (1 + n_item / n0)            K0 = 0.4, n0 = 20
b_item ← b_item − K · (y − p)
```

Initial `b` from the label: easy −1, medium 0, hard +1. Only first attempts
update the item, so retries do not bias it.

### 4.7 Fitting and promotion (R6.8, R6.9)

- Data: per (student, concept), the ordered sequence of first-attempt outcomes
  with their evidence weights.
- Method: maximise the likelihood of each next outcome under the model, per
  concept, with a bounded search (`pG, pS ∈ [0.02, 0.45]`, `pT ∈ [0.01, 0.4]`,
  `l0 ∈ [0.05, 0.8]`); a coarse grid followed by local refinement is enough
  at this scale and has no convergence surprises.
- Guard: skip any concept with fewer than a minimum number of students and
  observations; skip any fit that lands on a bound.
- Output: rows in `bkt_params` under a new `kt_version`, plus a report
  comparing held-out log-loss against the current version.
- Promotion is manual (a config change), recorded in `PROJECT_HISTORY.md`.

### 4.8 Evaluation harness (R6.1) — `backend/eval/kt_eval.py`

```
for each (student, concept) sequence, in time order:
    before each first attempt t:  p̂_t = model's P(correct) = L·(1−pS) + (1−L)·pG
    record (p̂_t, y_t), then update the model with the real outcome
split by time: fit on the first 70 % of calendar time, score on the rest
metrics: AUC, log-loss, Brier, calibration table (10 bins), n
baselines: global base rate · student running mean · item acceptance rate
```

Run nightly in GitHub Actions against a read-only export; commit the report
to `docs/reports/kt_accuracy.md`.

---

## 5. Policy

### 5.1 Decision lifecycle (R5.3)

```
serve problem P to student S
  ├─ build context x_t from CURRENT state
  ├─ allowed = guards(state)
  ├─ action, propensity = choose(x_t, allowed)
  ├─ item = pick_item(action, state)
  └─ INSERT bandit_decisions(decision_id, x_t, allowed, action, propensity, item)
        and remember decision_id in the attempt state for (S, P)

attempt on P ends (accepted | abandoned | expired by the sweeper)
  ├─ reward r = reward_fn(outcome, evidence, mastery before/after)
  ├─ if policy_kind in ('bandit','explore'):
  │      delta_A = x_t x_tᵀ ,  delta_b = r · x_t      ← uses the STORED context
  │      fold into bandit_models[action]              (inside record_submission)
  └─ mark the decision rewarded
```

A failed submit does **not** close the decision — the student is still on the
problem. Only the end of the attempt does. This is the correction for F-06.

### 5.2 Context v2 (`d = 20`)

| idx | feature |
|---|---|
| 0–11 | effective mastery per concept (decayed) |
| 12 | effective mastery of the *target* concept |
| 13 | lowest mastery among unlocked, unmastered concepts |
| 14 | recent first-attempt success rate (last 10) |
| 15 | recent help rate (share of last 10 with hint tier ≥ 2) |
| 16 | recent abandon rate (last 10) |
| 17 | days since last practice, `min(days, 30) / 30` |
| 18 | evidence count on the target concept, `min(n, 20) / 20` |
| 19 | bias (constant 1) |

The current vector has no bias term; without one the linear model cannot
represent an action that is good on average. A new `POLICY_VERSION` starts
from a clean model, so changing `d` needs no migration of old matrices.

### 5.3 Choosing an action, with a recorded probability (R5.6)

```
scores_a = θ_aᵀ x + α · sqrt(xᵀ A_a⁻¹ x)        for a in allowed,  θ_a = A_a⁻¹ b_a
greedy   = argmax_a scores_a
with probability ε (default 0.10):  action ~ Uniform(allowed), kind = 'explore'
otherwise:                          action = greedy,           kind = 'bandit'
propensity(action) = (1 − ε)·[action = greedy] + ε / |allowed|
```

Initialise `A_a = λI` with ridge `λ = 1`. Keep `α = 1.0` until the simulator
suggests otherwise. Guards (`allowed`) stay as they are today, plus: the
escalation rule becomes a guard that *restricts* `allowed` to
`{redirect_prerequisite, hint_augmented, easier_problem}` rather than forcing
one action — so the bandit still chooses, and the decision stays trainable.
Where a hard override is unavoidable, record `kind = 'override'`,
`propensity = 1`, and do not train on it.

### 5.4 Reward v2 (R5.7)

```
G = (L_after − L_before) / max(1 − L_before, 0.05)      # normalised gain on the target concept
E = 1 if the attempt ended solved else 0
r = clip( 0.7·G + 0.3·E − 0.5·[abandoned] , −1, 1 )
expired (walked away, no submit):  r = −0.2
```

Why not "accepted = 1": a policy paid for green ticks learns to serve easy
problems. Normalised gain is small when the student already knew the material
and large when a stretch problem was solved — especially once §4.3 makes hard
solves stronger evidence. `E` keeps a floor of reward for finishing; the
abandonment penalty discourages over-reaching. The reward depends on the
knowledge model, so the decision row records `kt_version` too.

Write the weights in config and the rationale in `PROJECT_HISTORY.md` Part 4.

### 5.5 Item selection (R5.8)

Given the action's `(concept, difficulty band)`:

```
candidates = published problems in the band, language-compatible
score(item) =  1.0 · unsolved
             − 0.6 · |target_b − b_item|          # target_b = logit(L_eff) + stretch(action)
             − 0.5 · seen_recently                # attempted in the last 7 days
             + 0.4 · previously_failed_and_old    # worth another go (review)
             + small random tie-break
pick uniformly among the top 3 by score
```

`stretch(action)`: easier −0.5, same 0, harder +0.5. A single query returns
only the columns needed (`problem_id, title, difficulty, b`) — never
`select *`.

### 5.6 Simulator (R5.10) — `backend/sim/`

Synthetic student: hidden per-concept knowledge state, per-concept learn rate,
guess/slip, a quit probability that rises after consecutive failures, and a
prerequisite penalty (low success on a concept whose prerequisites are
unknown). Items have hidden difficulty. Run N students × T steps under each
policy; report mean final true mastery, problems to mastery, and quit rate,
with seeds and confidence intervals.

Policies to compare: random allowed action; fixed curriculum order; current
production logic (frozen copy); v2. The simulator is a regression test (CI,
small N) and a design tool (locally, large N). It is not evidence about real
students — R12 is.

### 5.7 Offline policy evaluation (R5.11)

With logged propensities `p_i`, a candidate policy `π` that would choose
`π(x_i)`, and rewards `r_i`:

```
V̂_IPS(π)  = (1/n) Σ  r_i · 1[π(x_i) = a_i] / p_i
V̂_SNIPS(π) = Σ r_i·1[·]/p_i  /  Σ 1[·]/p_i          # lower variance; report both
```

Use only rows with `policy_kind in ('bandit','explore')`. Report the effective
sample size; with ε = 0.10 and few users the estimates will be noisy, and the
report must show the interval, not just the point.

---

## 6. Same-origin API, session, CSRF, client address

### 6.1 Proxy through the web origin (R2.3, R2.4)

Use Next.js middleware so a secret header can be attached (a plain `rewrites`
entry cannot add request headers):

```ts
// frontend/src/middleware.ts — reference shape
import { NextResponse, type NextRequest } from 'next/server';

export const config = { matcher: '/api/:path*' };

export function middleware(req: NextRequest) {
  const origin = process.env.BACKEND_ORIGIN;            // server-only variable
  if (!origin) return NextResponse.next();              // local dev without proxy
  const url = new URL(req.nextUrl.pathname + req.nextUrl.search, origin);
  const headers = new Headers(req.headers);
  headers.set('x-adaptcode-edge', process.env.EDGE_SHARED_SECRET ?? '');
  headers.set('x-adaptcode-client-ip', req.ip ?? headers.get('x-real-ip') ?? '');
  return NextResponse.rewrite(url, { request: { headers } });
}
```

**CHECK** on the platform's current documentation: how the client address is
exposed to middleware on this Next.js version; the proxy timeout for external
rewrites; and how proxied requests count against the plan's limits (RISKS §3).
Strip any client-supplied `x-adaptcode-*` headers before setting them.

Backend:

```python
# core/security.py — reference shape
def edge_ok(request) -> bool:
    return hmac.compare_digest(request.headers.get("x-adaptcode-edge", ""), settings.EDGE_SHARED_SECRET)

def client_ip(request) -> str:
    if settings.ENV == "production":
        return request.headers.get("x-adaptcode-client-ip") or "unknown"   # only set by the edge
    return request.client.host if request.client else "unknown"
```

A middleware returns 403 in production when `edge_ok` is false, except for the
liveness path used by the platform. Remove `--forwarded-allow-ips="*"` from
`entrypoint.sh`; the app no longer derives the address from proxy headers.
Rotate the shared secret like any other (two accepted values during rotation).

### 6.2 Cookie and CSRF (R2.6)

- Session cookie: `HttpOnly; Secure; SameSite=Lax; Path=/`, no `Domain`.
- CSRF: on login and on refresh, also set a non-HttpOnly cookie `adaptcode_csrf`
  with a random value. The API client copies it into `X-CSRF-Token` on every
  non-GET request. The backend rejects state-changing requests where header
  and cookie are missing or differ. (`X-CSRF-Token` is already in the CORS
  allow-list in `main.py`, so this was planned.)
- Logout clears both.

### 6.3 Refresh (R2.7)

- On login, set the provider's refresh token in a second cookie:
  `HttpOnly; Secure; SameSite=Strict; Path=/api/auth/refresh`.
- `POST /api/auth/refresh` exchanges it for a new access token and rotates
  both cookies.
- `lib/api.ts`: on a 401, call refresh once, then retry the original request
  once; if that fails, route to login. Guard against concurrent refreshes with
  a single in-flight promise.

---

## 7. Backend structure and data access

### 7.1 Extraction order (R1.1, then as phases touch files)

1. Characterisation tests for `/api/submit`, `/api/next-problem`,
   `/api/abandon` with `repo` and `services` mocked.
2. Move pure functions: `bkt.py` → `domain/knowledge.py` + `domain/evidence.py`;
   `linucb.py` → `domain/policy.py`; harness and comparison from `piston.py` →
   `domain/judge.py`. Leave thin re-export shims so nothing else changes.
3. Move every `supabase.table(...)` call into `repo/*` functions with typed
   return values.
4. `usecases/submit.py` orchestrates: load → judge → evidence → knowledge →
   policy → `repo.record_submission`.
5. Routers shrink to validation and response shaping.

### 7.2 Non-blocking data access (R4.2)

Two acceptable implementations; pick one and apply it everywhere:

- **(a) Thread offload.** Keep the current synchronous clients; every `repo`
  function is `async` and wraps its body in `anyio.to_thread.run_sync`. Lowest
  risk, smallest change. Set the thread limiter explicitly.
- **(b) Async driver.** A pooled async Postgres connection for the hot path
  (submit, next-problem, mastery), through the provider's pooled endpoint.
  Faster, but it means the backend connects as a database role directly and
  the queries must set the right role or rely on service-level access only.

Recommendation: (a) for R4, with the single RPC from §2.4 so the hot path is
one round trip anyway. Revisit (b) only if the load test says so.

Either way: construct each client once per process; never per call.

### 7.3 Configuration (R1, R2)

`core/config.py` fails at startup in production if any of these are missing or
malformed: database URLs, service key, sandbox URL, edge secret, frontend
origin. A missing optional integration (LLM key, error reporting, CAPTCHA)
logs one warning and disables that feature via its flag.

---

## 8. Frontend changes

| Area | Change | Task |
|---|---|---|
| `lib/api.ts` | relative base in production; CSRF header; refresh-and-retry; `client_attempt_id` on submit; `run()` | R1.4, R1.10, R2 |
| generated types | `lib/api-types.gen.ts` produced from the OpenAPI document; hand-written request types deleted | R9.4 |
| problem page | real Run; per-case result view; busy/retry state; "why this problem" | R1.4, R3.6, R8.2 |
| `HintsPanel` | fetch list and reveal; label from the API | R1.7 |
| offline mode | banner + error-reporting event; simulator only reachable there | R1.15 |
| auth callback | bridge, then local sign-out of the browser client | R2.8 |
| settings | leaderboard opt-in | R1.14 |
| Monaco | served from own origin, loaded on demand | R8.10, R10.3 |

Generating types: in CI, import the FastAPI app with `ENV=development` (docs
enabled), write `app.openapi()` to a file, run a TypeScript type generator on
it, and fail if the result differs from the committed file. Production keeps
its docs endpoints disabled.

---

## 9. Testing strategy

| Layer | What | Where | Needs |
|---|---|---|---|
| Unit | `domain/*`: evidence table, BKT numeric fixtures, monotonicity, decay, policy maths, guards, reward cases, item scoring, verdict mapping, harness generation | `backend/tests/unit/` | nothing |
| Property | random inputs: mastery stays in [0,1]; `A` stays symmetric positive-definite; propensities sum to 1 over allowed actions; no guard is ever violated | same | property-testing library |
| Simulator | v2 beats random and fixed order on small N, fixed seeds | `backend/tests/sim/` | nothing |
| Repository | each `repo` function against a real local database; `record_submission` atomicity and idempotency; concurrency (100 parallel updates) | `backend/tests/integration/` | local database stack |
| Judge | corpus × 4 languages | `backend/tests/judge/` | sandbox container |
| API | every route: happy path, validation, authorisation matrix | `backend/tests/api/` | local stack |
| Contract | generated types up to date | CI step | — |
| Frontend unit | API client (retry, CSRF, offline), hint panel, result rendering | `frontend/src/**/__tests__/` | — |
| End to end | the learner journey, desktop and mobile viewport | `frontend/e2e/` | preview + dev backend |
| Load | list / problem / run / submit at 5, 25, 50 users | `backend/loadtest/` | dev environment |
| Security | header/cookie/RLS assertions, CSRF, rate limit, edge secret | `backend/tests/security/` | local stack |

Numeric fixtures to pin now (from the current formulas, so a refactor cannot
silently change behaviour): `update_mastery(0.30, 1.0)` ≈ 0.6995;
`update_mastery(0.6995, 1.0)` ≈ 0.9233; `update_mastery(0.30, 0.0)` ≈ 0.1647.
Recompute them in the test with the formula rather than trusting these
decimals.

Authorisation matrix (R9.5): a table-driven test — rows are routes, columns
are anonymous / student A / student B acting on A's resource / admin — with the
expected status in each cell. New routes cannot be merged without a row.

---

## 10. CI/CD workflows

```
.github/workflows/
  ci.yml            push/PR: frontend lint+types+unit · backend lint+types+unit ·
                    contract check · secret scan · dependency audit
  integration.yml   push to main: start local database stack + sandbox container →
                    migrations from empty → repo/API/judge/security tests
  e2e.yml           after a preview deployment is ready: Playwright against it
  migrate.yml       manual: backup → apply migrations to the chosen environment → smoke test
  backup.yml        nightly: dump → encrypt → store → verify size and age
  keepalive.yml     every few days: one cheap read per database project
  nightly-eval.yml  nightly: export → knowledge-model accuracy report → policy report → commit
  probe.yml         every 15 min (or an external monitor): deep health + synthetic submit
  usage.yml         weekly: free-tier usage summary → email if above 70 %
```

Backup workflow, reference shape:

```yaml
name: backup
on:
  schedule: [{ cron: "30 19 * * *" }]
  workflow_dispatch: {}
jobs:
  dump:
    runs-on: ubuntu-latest
    steps:
      - name: Dump
        run: |
          docker run --rm -e PGPASSWORD="$PGPASSWORD" postgres:<same major as the project> \
            pg_dump "$DB_URL" --no-owner --no-privileges --format=custom > db.dump
        env: { DB_URL: "${{ secrets.BACKUP_DB_URL }}", PGPASSWORD: "${{ secrets.BACKUP_DB_PASSWORD }}" }
      - name: Encrypt
        run: gpg --batch --symmetric --cipher-algo AES256 --passphrase "$BACKUP_PASSPHRASE" db.dump
        env: { BACKUP_PASSPHRASE: "${{ secrets.BACKUP_PASSPHRASE }}" }
      - name: Sanity
        run: test "$(stat -c%s db.dump.gpg)" -gt 100000
      - uses: actions/upload-artifact@v4
        with: { name: "db-${{ github.run_id }}", path: db.dump.gpg, retention-days: 30 }
```

Important properties:
- **Artifacts of a public repository can be downloaded by other signed-in
  users — CHECK the current rules.** The dump must be encrypted with a long
  random passphrase before upload, and it is better still to push it to a
  private repository or private storage. Never upload a plaintext dump.
- Use a dedicated read-only database role for the dump.
- The `pg_dump` major version must match the server's.
- Scheduled workflows in public repositories are disabled after a long period
  without repository activity — **CHECK**; the keep-alive and normal commit
  cadence should prevent it, and the "last backup older than 36 h" alert
  catches it.
- Keep the passphrase somewhere other than GitHub as well; a backup you cannot
  decrypt is not a backup.

Integration job: the database's local stack and the sandbox both run as
containers inside the runner, so no shared service is touched — which removes
the reason the backend job was gated off.

---

## 11. Rollout recipes

### 11.1 Write lock-down (R1.11) — the riskiest change in the plan

1. Deploy backend that writes learning state through the service role when
   `FLAG_SERVICE_WRITES=on`, and through the user token when off. Both paths
   tested.
2. Turn the flag on in dev → run the full suite → turn it on in production.
3. Watch error reporting for one day. Rollback at this point = flag off.
4. Apply the migration that drops owner write policies (dev, then production
   after a backup).
5. Run the authorisation tests against production with a throwaway account.
6. Remove the flag and the old code path in a later commit.

Never do step 4 before step 2.

### 11.2 Server telemetry and real Run (R1.3–R1.7)

1. Migration adds columns (expand).
2. Backend ships `/api/run` and hint endpoints, unused.
3. Frontend switches Run and hints to them behind `NEXT_PUBLIC_FLAG_REAL_RUN`.
4. Backend flips `FLAG_SERVER_TELEMETRY`: submit starts reading counters from
   attempt state.
5. Remove the client fields from the request model; regenerate types.

### 11.3 Policy v2 (R5)

1. Create `bandit_models` rows for `linucb-v2` (identity matrices).
2. Ship decision logging in **shadow mode**: v2 decides and logs, production
   still serves the old choice (`policy_kind='fixed'` for what was served).
3. After a week of sane logs, serve v2 to the admin account, then 10 %, then
   everyone (deterministic by user id).
4. Archive the old sentinel row; delete the old code.

### 11.4 Knowledge model versions (R6)

A new `kt_version` is computed in shadow for every submission (written only to
`mastery_history` with its version) while the old one stays authoritative.
Promote by switching which version writes `mastery_scores`, then recompute.

### 11.5 Rollback, generally

- Code: route traffic to the previous backend revision; redeploy the previous
  frontend deployment.
- Flags: off.
- Schema: the `-- rollback:` block; if data was transformed, restore from the
  pre-migration backup taken by `migrate.yml`.

---

## 12. Definition of done

A task is done when all of these hold:

1. The behaviour in the task's "done when" column is demonstrated by an
   automated test, or by a recorded manual check where automation is not
   practical.
2. CI is green.
3. New behaviour is behind a flag, or the task explains why it is safe not to.
4. Migrations apply from empty and have a rollback block.
5. No new blocking call in a request path; no new unbounded query.
6. No secret, token, credential or unfixed vulnerability detail in the commit.
7. Authorisation matrix updated for any new route.
8. CSP and outbound-proxy exclusions updated for any new external host.
9. User-visible text is accurate — it claims only what the code does.
10. Docs updated: `PHASES.md` status, and `PROJECT_HISTORY.md` when the phase
    closes.
