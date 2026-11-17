# AdaptCode — Risks, Free-Tier Budget and Contingencies

**Written:** 2026-11-16 · **Baseline commit:** `7bb0a96`

1. Risk register
2. What can go wrong with the idea itself
3. Free-tier budget: what each service gives, what uses it, what breaks first
4. The sandbox host: the nearest cost cliff
5. Legal and ethical exposure
6. Key-person and AI-assisted-development risk
7. Early-warning signals

> **About the numbers in §3.** Free-tier allowances change, differ by region
> and by account age, and I could not look them up from inside this session.
> Every figure is given as "as generally published; **confirm on the vendor's
> pricing page**". R0.10–R0.11 and R11.5 exist to replace these with measured
> values for this project.

---

## 1. Risk register

Likelihood and impact: **H**igh / **M**edium / **L**ow. "Phase" is where the
mitigation lands.

### Product and model

| # | Risk | L | I | Mitigation | Phase |
|---|---|---|---|---|---|
| P1 | The adaptive engine, once fixed, does not measurably beat a sensible fixed order | M | H | Build the evaluation first; report honestly; the knowledge-model accuracy report and the open decision log are valuable results even if the policy effect is small | R5, R6, R12 |
| P2 | Not enough users to fit or evaluate anything | H | M | Structural fixes that need no data come first; simulator for regression; recruit a class for the beta; state confidence intervals | R5, R6, R12 |
| P3 | Mastery numbers feel wrong to students ("I solved two and it says mastered") | H (today) | H | Evidence requirement, difficulty-aware evidence, transparency about the rule | R1, R6 |
| P4 | A reward design that the policy exploits (e.g. serving only easy problems) | M | M | Gain-based reward, hard guards, simulator checks, per-action monitoring | R5 |
| P5 | LLM assistants make practising problems feel pointless | M | H | Position on diagnosis, sequencing and proof of learning; do not compete on having problems | R12 |
| P6 | Explanations occasionally give away answers or are wrong | M | M | On-demand, output checks, clear labelling as AI-generated, report button | R8 |
| P7 | Scope: fourteen phases never finish | H | M | Milestones M1–M5; each phase leaves the product better; M3 is the "claim is true" point | all |

### Engineering and operations

| # | Risk | L | I | Mitigation | Phase |
|---|---|---|---|---|---|
| E1 | Data loss with no backup | M | H | Nightly encrypted dump, restore drill | R0 |
| E2 | A migration breaks production (there may be only one database) | M | H | Second project, migration pipeline with pre-backup, expand/contract | R0, R9 |
| E3 | Network key expiry takes down all submissions | H (dated) | H | Calendar, runbook, alert 14 days before | R0, R11 |
| E4 | Sandbox host overloaded or down — single point of failure | M | H | Gate and 503, health probe, rebuild procedure; accept the single host on the free tier | R3, R11 |
| E5 | Sandbox escape | L | H | No public port (in place), no instance role, metadata blocked, egress restricted, pinned runtimes, rebuildable host | R3, R10 |
| E6 | Database paused for inactivity, or full | M | M | Keep-alive, size monitoring, retention policy | R0, R10, R11 |
| E7 | Silent breakage hidden by the offline fallback (already happened once) | M | H | Banner, error event, synthetic submit probe | R1, R11 |
| E8 | Frontend and backend drift on request shapes (how F-01 happened) | H | M | Generated types, contract check in CI | R9 |
| E9 | The write lock-down breaks submits if done in the wrong order | M | H | Flagged two-step rollout (IMPLEMENTATION §11.1) | R1 |
| E10 | Proxy timeout shorter than a slow submission | M | M | R3 batching before/with R2; environment switch to revert | R2, R3 |
| E11 | Cold starts make the first request slow | H | L | Measure, trim, accept; a probe keeps an instance warm some of the time | R4, R11 |
| E12 | Dependency update breaks the build (happened twice) | M | M | Grouped minor updates, majors by hand, CI gates | R9 |

### Security and privacy

| # | Risk | L | I | Mitigation | Phase |
|---|---|---|---|---|---|
| S1 | Scores and leaderboard forged | M | M | Service-role-only writes, opt-in leaderboard | R1 |
| S2 | Hidden tests or solutions leak | M | M | Verify F-20; strip fields; catalogue reachable only through the API | R0, R1 |
| S3 | Rate limits bypassed; credential stuffing | M | M | Trusted client address, per-user limits, CAPTCHA on, lockout (in place) | R2, R10 |
| S4 | Session theft through script injection | L | H | First-party HttpOnly cookie, no token in browser storage, CSP with nonces | R2, R10 |
| S5 | A secret leaks again (twice already) | M | H | Secret scanning in CI and pre-commit, rotation calendar | R0, R10 |
| S6 | Student data handled contrary to the privacy policy | M | H | Data inventory, accurate policy, retention job | R10 |
| S7 | Abuse of free compute (crypto-mining attempts, spam accounts) | M | M | Sandbox limits, quotas, CAPTCHA, kill switches | R3, R10, R11 |
| S8 | Public repo reveals unfixed weaknesses | M | M | Audit detail kept out of git; fix before describing | now |

### Legal, cost, people

| # | Risk | L | I | Mitigation | Phase |
|---|---|---|---|---|---|
| L1 | Content takedown or complaint over derived problems | M | H | Original launch set; unpublish the rest before launch | R7 |
| L2 | Hosting plan terms forbid the eventual use (e.g. commercial use on a hobby plan) | M | M | Stay non-commercial on free plans; revisit terms before any monetisation | R12 |
| L3 | Younger users sign up | M | M | Age statement, minimal data, no advertising | R10 |
| C1 | A free tier ends or shrinks | H (sandbox host) | H | §4 contingency; budget alarms; usage report | R0, R11 |
| C2 | An unexpected bill | L | M | Alerts at the first cent; no card-required features; kill switches | R0, R11 |
| K1 | Single maintainer unavailable | M | H | Runbooks, history doc, reproducible environments | R0, R11 |
| K2 | AI-generated changes drift from intent (already visible) | H | M | Tests as the contract, generated types, small commits, this audit repeated per milestone | R9 |

---

## 2. What can go wrong with the idea itself

Worth saying plainly, because an interviewer or investor will.

**"Adaptive" is easy to claim and hard to prove.** Many products say it. Very
few publish whether their model predicts anything. The audit shows this
project's own claim was ahead of its code. The fix is not better wording — it
is the accuracy report (R6) and the comparison (R12).

**Personalisation needs data that a small product does not have.** A bandit
with five actions and twenty features needs thousands of decisions to say
anything; a per-student bandit needs them per student. That is why the plan
uses one shared policy, strong hand-written guards, and a simulator — and why
it is honest about uncertainty.

**The knowledge model is a simplification.** BKT assumes one skill per item,
no forgetting, and identical items. Real DSA problems mix skills, and people
forget. R6 addresses each, but it stays a model. Present mastery as an
estimate with a confidence, never as a grade.

**Motivation matters more than sequencing.** Most learners who stop, stop
because of time and motivation, not because problem 14 should have been
problem 12. Good sequencing helps at the margin; it is not a substitute for a
product people want to come back to (R8).

**The upside if it works:** a free, open, evidence-backed tutor for the skill
that gates entry to software jobs, usable by any student with a browser, with
an engine that could be pointed at other subjects. That is a meaningful thing
to build — and "we measured it" is what would make it stand out.

---

## 3. Free-tier budget

For each service: what it is used for here, the allowance as generally
published (**confirm**), what consumes it in this design, and what happens at
the limit.

### 3.1 Frontend hosting (hobby plan)

- **Allowance:** monthly bandwidth, function/middleware invocations and build
  minutes; **non-commercial use only**.
- **Consumers:** page loads; after R2, *every API call* passes through the
  proxy and counts as edge/middleware usage and transfer.
- **At the limit:** the project can be paused until the next cycle.
- **Design responses:** cache the public catalogue at the edge; avoid polling
  (explanations are on demand; no status polling loops); keep responses small;
  the usage report tracks this (R11.5). If proxy usage becomes the binding
  limit, a custom domain with an `api.` subdomain removes the proxy (D9).

### 3.2 Backend compute (serverless containers)

- **Allowance:** a monthly quantity of requests, vCPU-seconds and
  memory-seconds; billed only while handling requests when scaled to zero.
  Regions are priced in tiers — **check which tier `asia-southeast1` is in and
  how the free quantity applies there.**
- **Rough capacity:** at 1 vCPU / 1 GiB, the commonly published free CPU
  quantity corresponds to roughly fifty instance-hours of *active request
  time* per month. Because one instance serves many concurrent requests,
  that is far more than fifty hours of wall-clock usage at low traffic — but
  blocking I/O (F-12) wastes it by holding instances busy.
- **Consumers:** submits dominate (seconds each); a scheduled probe that keeps
  an instance warm consumes it continuously — keep probes infrequent.
- **Also metered:** container image storage (small free allowance — set a
  cleanup policy, R0.10), build minutes, secret versions (the free allowance
  is counted in active versions and six secrets are already bound; destroy old
  versions on rotation, and put low-sensitivity configuration in plain
  environment variables rather than new secrets), log volume.
- **At the limit:** charges begin (a billing account is attached). This is the
  one place a bill can appear silently — hence a budget alert at the smallest
  possible amount and `--max-instances` kept low.

### 3.3 Sandbox host (virtual machine)

See §4 — time-limited for most accounts.

### 3.4 Database and auth (free plan)

- **Allowance:** two projects; a database size cap (commonly 500 MB); a
  monthly active-user cap far above this project's needs; egress cap; pauses
  after about a week without activity; **no downloadable backups**.
- **Consumers of space:** `attempts` grows per submission; `bandit_decisions`
  stores a 20-float context per decision (~250 bytes) — a million decisions
  is a few hundred MB, so retention matters eventually; `mastery_history`;
  `audit_log`. Student code is *not* stored today (only a hash is planned);
  storing full code per attempt (R8.7) is the fastest way to fill the cap —
  store only the latest draft and accepted solutions, or cap history per
  problem.
- **At the limit:** writes fail / project restricted.
- **Design responses:** keep-alive (R0.9); size monitoring (R11.5); retention
  job that aggregates and prunes old raw rows (R10.7); the second project is
  the dev environment, which uses both free slots.

### 3.5 LLM (free API tier)

- **Allowance:** per-minute and **per-day** request caps per model, small for
  free keys, and changed by the provider without notice.
- **Consumers:** today, one call per failed submission, automatically.
- **At the limit:** explanations fail for everyone until the next day.
- **Design responses:** on-demand only; cache by (problem, failure signature);
  per-user daily budget; a visible "explanations are resting until tomorrow"
  state; model name already configurable.
- **Data note:** free API tiers often permit the provider to use prompts to
  improve its products — **confirm**, and say so in the privacy policy (R10.8).

### 3.6 Private network

- **Allowance:** the personal plan covers a small number of users and many
  devices. Ephemeral nodes (each backend instance) come and go.
- **Risk:** auth-key expiry (E3), not quota.

### 3.7 Error monitoring (free plan)

- **Allowance:** a monthly event quota, one user, short retention.
- **Design responses:** sample traces low (already 0.1), filter noise, and do
  not turn the offline-fallback event into a flood (rate-limit it per session).

### 3.8 CI (public repository)

- **Allowance:** generous for public repositories.
- **Consumers:** integration and end-to-end jobs with containers; nightly
  jobs; probes every 15 minutes add up to ~3 000 runs a month — fine for a
  public repo, but prefer an external free uptime monitor for the simple
  health check and keep the workflow for the synthetic submit at a lower
  frequency.
- **Caveats:** scheduled workflows can be disabled after long inactivity;
  artifacts of public repos are not private (encrypt backups).

### 3.9 What gives out first

Best current guess, to be replaced by measurement in R11.10:

1. **LLM daily quota** — first, at a few dozen active students, if
   explanations stay automatic.
2. **Sandbox host throughput** — a burst (a class starting at once) saturates
   one small machine before anything else; the gate turns that into waiting
   rather than failure.
3. **Sandbox host free period ending** — a date, not a load (see §4).
4. **Backend CPU allowance** — only at sustained hundreds of daily active
   students, sooner if blocking I/O is not fixed.
5. **Database size** — months away unless full code history is stored.

---

## 4. The sandbox host: the nearest cost cliff

The code sandbox needs a real virtual machine (privileged containers), and
that is the one component whose free allowance is normally **time-limited**:
cloud providers' introductory VM offers typically last a fixed period from
account creation or are funded by expiring credits, and public IPv4 addresses
may be charged separately.

**Fill in during R0.11:**

| Fact | Value |
|---|---|
| Instance type | _to record_ |
| Region | _to record_ |
| Account created / free period ends | _to record_ |
| Public IPv4 attached? charged? | _to record_ |
| Disk size and type | _to record_ |
| Billing alarm configured | _to record_ |

**Policy:** the stack is locked, and this plan does not propose moving the
sandbox. But "nothing is spent" is also a hard constraint, and these two
collide on a known date. So the contingency is written down now, to be chosen
*only* when the free period is within 60 days of ending:

| Option | Keeps the architecture? | Notes |
|---|---|---|
| A. Student-programme or education credits applied to the current provider | Yes, unchanged | Simplest; apply early (D9) |
| B. Same Piston-plus-private-network setup on a provider with a permanent free VM tier | Yes — only the host changes; ADR-10 preserved | The project tried a free VM before and dropped it because of the *tunnel*, not the VM; the private network now solves that. Check CPU architecture support for the runtimes before committing |
| C. Same setup on the always-free small VM offered by the backend's own cloud | Yes | One fewer vendor; very small machine — measure first |
| D. Pay for the smallest instance | Yes | Violates the zero-spend rule; listed for completeness |

Whatever is chosen, the host must be **rebuildable from a script** (R3.9), so
moving it is an afternoon, not a project. That rebuild script is the real
mitigation.

---

## 5. Legal and ethical exposure

Not legal advice — a list of things to get checked.

1. **Problem content (L1).** Ideas and algorithms are free to use; specific
   problem text, examples and test data from a commercial site are not, and
   that site's terms restrict copying. Plan: original launch set (R7), and
   remove "LeetCode-derived" from all public descriptions once it is no longer
   true. Until then, do not promote the product publicly.
2. **Privacy law.** Collecting accounts, emails and behavioural data from
   students brings obligations that depend on where users are (data-protection
   law in the EU/UK, India, and elsewhere). Minimum: accurate policy, purpose
   limitation, export and deletion (already built), retention limits,
   breach-notification plan (R10).
3. **Children.** If under-age users are plausible, rules tighten considerably
   in most jurisdictions. State a minimum age in the terms and avoid
   collecting anything beyond email and display name.
4. **Sending student code to an LLM provider.** Disclose it; let users decline
   (explanations are on demand after R8.4, which is effectively opt-in).
5. **Research with human participants (R12).** If the study is connected to a
   university or will be published, ask whether ethics review is required
   *before* collecting data. Always get informed consent.
6. **Hosting terms.** Free hobby plans commonly prohibit commercial use.
   Fine while the product is free and non-commercial; a decision point before
   any revenue, sponsorship or paid tier.
7. **Open-source licences.** Check the licences of the sandbox engine, editor
   and other dependencies before choosing a licence for this project (D8).
8. **Accessibility.** Not only good practice; in some contexts (education
   providers adopting the tool) it is a requirement (R8.9).

---

## 6. Key-person and AI-assisted-development risk

The project is built by one person directing AI agents. That is its speed and
its main fragility.

Observed failure pattern (from the audit): an agent implements a feature on
one side, documents it thoroughly, and the other side is never wired — and the
documentation, written by the same agent, describes the intended behaviour as
if it were live. `PROJECT_HISTORY.md` describing per-student bandit state and
working behavioural weights is exactly this.

Controls that address it:
- **Tests are the specification.** A behaviour without a test is a hope.
- **Generated contracts** between frontend and backend (R9.4).
- **End-to-end tests assert on data**, not on the page rendering (e.g. "after
  three failed submits, the stored attempt row says three").
- **An audit pass per milestone**: a fresh session, instructed to read code
  and not docs, lists every claim in `PROJECT_HISTORY.md` Parts 4–6 it cannot
  find in the code.
- **History entries distinguish "shipped and verified in production" from
  "implemented"** — with the verification command or query recorded.
- **Runbooks and reproducible environments** so that someone else — or you in
  six months — can operate it.

---

## 7. Early-warning signals

Check weekly (R11.5 automates most of this):

| Signal | Meaning | Action |
|---|---|---|
| Offline-fallback events in production | The API is unreachable for real users | Treat as an outage |
| Synthetic submit failing | Pipeline broken somewhere | Runbook |
| Share of submits ending 503 | Sandbox saturated | Raise gate carefully or reduce test time |
| Open decisions older than the limit | Sweeper not running | Check the workflow |
| Decision share by action collapsing onto one action | Policy degenerate or reward exploited | Inspect; freeze to guards-only if needed |
| Knowledge-model log-loss worse than the base-rate baseline | Model is not predicting | Do not promote; investigate inputs |
| Mastery reached with < 3 distinct problems | Evidence rule regressed | Bug |
| Any free allowance above 70 % | Approaching a limit | §3 responses |
| Any billed amount above zero | Something left the free tier | Find and stop it the same day |
| Backup older than 36 hours | Backups stopped | Fix before any other work |
| Days to network-key expiry < 14 | Scheduled outage approaching | Renew |
| Days to sandbox free-period end < 60 | Cost cliff approaching | Execute §4 |
