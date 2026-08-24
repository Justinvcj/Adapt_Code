# AdaptCode — Product Requirements Document (PRD)

**Status:** Draft v1
**Grounded against:** the actual `Adapt_Code` repository (see `01_ANALYSIS.md`, `02_ARCHITECTURE.md`) — every requirement below is marked with its current implementation status so this PRD is usable as a real build spec, not just a vision doc.

---

## 1. Vision

AdaptCode is a coding-practice platform in the shape of LeetCode — a problem catalog, an in-browser judge, difficulty levels, topic tags — but with the one thing that category of product has never had: **a system that knows what you actually understand, and decides what you should solve next because of it.**

LeetCode (and its category) is a library. You browse it, or a randomizer browses it for you. It tells you pass/fail, runtime, and memory. It never tells you *why* you failed in a way that changes what you do next, and it never notices that you're about to attempt recursion without having demonstrated you understand loops. AdaptCode's entire reason to exist is closing that gap: it observes how a student solves problems — not just whether they did — models what that reveals about their actual understanding across a graph of interdependent concepts, and uses that model to decide, continuously, what the student should attempt next and what they should go learn first.

## 2. Problem Statement

A student practicing algorithms and data structures today has three failure modes that existing platforms don't address:

1. **Wrong-level practice.** They attempt problems above their actual readiness (skipping prerequisite concepts) or below it (wasting time on mastered material), because nothing is tracking readiness — only difficulty tags chosen by the platform's editors, not calibrated to the individual.
2. **Opaque failure.** When code fails, they see a verdict (Wrong Answer, TLE, Runtime Error) and maybe a diff. They don't learn *why* their approach was conceptually wrong, *why* their time complexity was what it was, or what to review before trying again.
3. **No diagnosis, only outcomes.** A pattern of failures on a topic is never traced back to a *root cause* — e.g., failing five recursion problems because of a genuine gap in loop fundamentals from three concepts ago. The platform records the failures; it never diagnoses them.

AdaptCode's product thesis: **treat every submission as evidence about the student, not just about the problem**, and act on that evidence in real time — both to route them to the right next problem, and to explain their own code back to them in terms of what it reveals about their understanding.

## 3. Goals

| Goal | Description |
|---|---|
| G1 | A first-time user reaches their first appropriately-calibrated problem within one interaction (topic pick), with no manual difficulty guessing required to start. |
| G2 | Every submission — correct or not — produces feedback that references *why*, not just *what* (time complexity reasoning, root-cause of failure, not just verdict). |
| G3 | When a student struggles on a chosen difficulty (defined thresholds on attempts/hints/time), the system automatically diagnoses whether the true gap is in the current concept or a prerequisite, and says so explicitly. |
| G4 | The system evaluates *how* a student coded — structure, style, approach — not only whether the final output matched, and surfaces that as targeted, specific feedback. |
| G5 | The product feels and performs like a real, shippable product: no dead ends, no unhandled errors surfaced to the user, consistent behavior under load — built entirely on open-source infrastructure. |

### Non-goals (explicitly out of scope for this PRD)

- Competitive-programming features (contests, leaderboards, rating systems) — not part of the adaptive-learning thesis.
- Multi-language pedagogical parity beyond what Judge0 already supports out of the box.
- Mobile-native apps — responsive web only for v1.
- Paid/proprietary infrastructure of any kind (see NFR-6).

## 4. Target Users

- **Primary persona — the self-directed learner:** a student (CS undergrad, bootcamp grad, interview prep) who already knows *some* DSA but doesn't know what they don't know. They currently use LeetCode by picking topics somewhat arbitrarily or following a generic "150 problems" list not personalized to their gaps.
- **Secondary persona — the instructor/researcher (you):** needs the platform's routing decisions and diagnostic output to be legible and defensible — both as a teaching tool and as the empirical subject of a research paper on adaptive routing.

## 5. Core Differentiator vs. LeetCode-shaped platforms

| Dimension | LeetCode-shaped platforms | AdaptCode |
|---|---|---|
| Problem selection | Manual browse, or a fixed/random list | System selects based on a live mastery model — student never has to guess their own level |
| Difficulty | Static tag set by editors | Calibrated per-student via a contextual bandit *within* the concept the system determines they're ready for |
| Prerequisite awareness | None — a student can attempt recursion having never demonstrated loop competence | Explicit 12-concept prerequisite graph gates access; a struggling student is traced back to the actual weak prerequisite, not just told "try again" |
| Failure feedback | Verdict + diff (Wrong Answer / TLE / stack trace) | Verdict + a 3-part causal explanation (what went wrong, why it fails conceptually, what to review) — see FR-6 |
| Code quality feedback | None | Structural/style analysis of *how* the student coded, independent of pass/fail — see FR-7 (new) |
| Escalating struggle | Nothing happens — student keeps guessing or gives up | Automatic diagnostic mode triggers after defined struggle thresholds, re-routes to the actual gap — see FR-5 (new) |

## 6. User Journey

### 6.1 First-time onboarding (new requirement — not yet built; see §9 gap table)

```
Sign up / log in
   → Landing screen presents the 12-concept map (topics), NOT a blank
     dashboard and NOT an immediate forced diagnostic quiz
   → Student picks a topic (concept) they want to start with
   → Student picks a difficulty: easy / medium / hard
   → System checks prerequisites for that concept:
        - if prerequisites are already inferred-strong (new account has
          no history, so default is: allow the pick, but seed mastery
          priors conservatively) → serve the chosen problem directly
        - if the student picks a concept/difficulty combination that's
          unusually ambitious for a brand-new account (e.g. "hard,
          dynamic_programming" with zero history), do not block them —
          AdaptCode never refuses a choice — but flag internally that
          this attempt is a high-information first data point
   → Student attempts the problem
   → Outcome (pass/struggle/fail) is the FIRST evidence used to
     initialize their mastery model — see FR-1
```

Key product decision embedded here: **AdaptCode never blocks a student from choosing what they want to attempt.** The system's job is to be the thing that's *watching* and *guiding*, not a gatekeeper the student has to fight. This is the difference between "adaptive" and "restrictive." (This matches the existing prerequisite-graph implementation, which already treats the graph as a *soft* signal for routing rather than a hard block on manual topic selection — confirm this stays true as onboarding is built.)

### 6.2 Steady-state loop (mostly already built — see §9)

```
Student either (a) manually picks topic+difficulty, or (b) asks
AdaptCode to pick for them ("Next problem" — the adaptive routing path)
   → Student writes code in-browser, runs against custom input freely
   → Student submits for grading
   → Judge0 executes against the full test suite
   → Result surfaces:
       - Pass/fail per test case
       - Runtime + memory
       - IF correct: a WHY-explanation of the achieved time/space
         complexity (new — see FR-6.2), not just the number
       - IF incorrect: 3-part causal explanation (existing) PLUS
         code-quality/style observations (new — see FR-7)
   → Mastery model updates (BKT) for the relevant concept(s)
   → Routing model updates (bandit) for future selection
   → If struggle thresholds are crossed on this problem specifically,
     diagnostic mode activates (new — see FR-5)
```

### 6.3 Struggle → diagnosis (the "hard question, can't solve it" case from the brief)

This is the scenario the brief describes explicitly: a student picks "hard," fails to solve it within the allotted attempts, hints, and time. AdaptCode's job at that moment:

```
Struggle thresholds crossed (attempts ≥ N, hints used ≥ M, OR
time_on_task ≥ T for this problem)
   → System does NOT just show another failed-attempt message
   → System runs a diagnostic pass:
        1. Look at which prerequisite concepts underlie the current
           concept (existing prerequisite graph)
        2. Compare current mastery estimates across those prerequisites
        3. Identify the lowest-mastery prerequisite below threshold
           (existing: get_weakest_unmastered_prerequisite)
        4. ALSO analyze the actual code the student wrote across their
           attempts on this problem — not just the final one — to see
           if the failure pattern is conceptual (e.g. never wrote a
           base case in a recursive attempt) rather than purely a
           mastery-score number (new — see FR-5.2)
   → System surfaces a diagnostic message: "This is a hard
     dynamic_programming problem, but your last 3 attempts suggest the
     underlying gap is in recursion — specifically, base-case handling.
     Want to solve two recursion problems first?"
   → Student can accept the redirect or continue attempting the
     original problem — AGAIN, never forced, always offered
```

## 7. Functional Requirements

Each requirement is tagged **[BUILT]**, **[PARTIAL]**, or **[NEW]** against the current repo (per `01_ANALYSIS.md`).

### FR-1 — Mastery Modeling **[BUILT, needs Phase-1 hardening]**
Bayesian Knowledge Tracing per concept, updated from a continuous "effective correctness" signal that folds in hint use, attempt count, compile errors, and time-on-task — not just binary pass/fail. Already implemented in `services/bkt.py`. Must remain the source of truth for "how well does this student know X."

### FR-2 — Prerequisite Graph **[BUILT]**
12-concept DAG with tiered difficulty parameters, gating which concepts are considered "accessible." Already implemented in `services/prerequisites.py`. Used both for routing (FR-3) and diagnosis (FR-5).

### FR-3 — Adaptive Routing **[PARTIAL — see `02_ARCHITECTURE.md` §2.1]**
System recommends a next problem using a contextual bandit. Currently the bandit selects *difficulty only*; concept/problem choice within that difficulty is random among prerequisite-valid options. For this PRD's vision ("AdaptCode decides what you should solve next") to be fully true, this needs the two-stage concept+difficulty routing described in the architecture doc's Option A. **This is the single most important open engineering decision for this product vision** — a manual-topic-selection flow (§6.1) can ship without it, but the "system picks for you" flow cannot fully deliver on the vision until it does.

### FR-4 — Code Execution & Grading **[BUILT, has a known bug — see `01_ANALYSIS.md` §2.3]**
Judge0-backed multi-language execution against a full test suite, with custom-input scratch execution available separately. Must be hardened per the implementation plan's Phase 1 before scaling problem count.

### FR-5 — Diagnostic Escalation on Struggle **[NEW]**
Triggered when a student crosses defined thresholds on a *specific problem attempt* (not just a running average — the brief specifically calls out "within given tries, given hints, and given time").

- **FR-5.1 Threshold detection.** Configurable per-difficulty thresholds (e.g. hard: 5 attempts, 2 hints, 20 minutes) tracked per problem-attempt, reusing the existing `active_problem_state` table's hint/time tracking.
- **FR-5.2 Root-cause tracing.** Combines (a) the existing prerequisite-mastery lookup and (b) a structural analysis of the student's attempt history on this problem (are they repeatedly missing the same class of thing — e.g. off-by-one errors, missing base cases, wrong data structure choice) to produce a specific, named diagnosis rather than a generic "you're struggling" message.
- **FR-5.3 Non-blocking redirect.** Offers, never forces, a path to a prerequisite problem.
- **Acceptance criteria:** given a synthetic student who fails a `dynamic_programming/hard` problem 5 times without ever writing a base case, the system's diagnostic message must name `recursion` (the actual DAG prerequisite) as the suspected gap, not a generic message.

### FR-6 — Causal Failure & Success Explanation **[PARTIAL]**
- **FR-6.1 (existing, built):** 3-part explanation on failure — what went wrong, why it fails conceptually, what to review. Implemented via `services/ai_tutor.py` (Zhipu GLM-4-Flash).
- **FR-6.2 (new):** the brief explicitly asks for *why a certain time complexity occurred* — not just reporting the measured runtime/memory from Judge0, but an explanation tying the student's actual code structure (loops, recursion depth, data structure choice) to its asymptotic behavior, on **both success and failure**. This does not currently exist — Judge0 reports wall-clock time and memory only; there is no complexity-reasoning step. Requires either (a) static analysis of the submitted code's structure (loop nesting depth, recursive call pattern) to produce a heuristic complexity estimate + explanation, or (b) an LLM-based explanation prompted with the code and asked to reason about complexity, clearly labeled as an estimate rather than a formally verified bound.
- **Acceptance criteria:** for a correct submission, the response includes a plain-language explanation of *why* the code is O(n) or O(n²) etc., referencing the actual structure of the submitted code, not a generic definition of the complexity class.

### FR-7 — Code Quality / Style Analysis **[NEW]**
The brief is explicit: "not just the question is analyzed, but the code, how the person coded... where he made a mistake, so that that part alone can be improved." This is distinct from FR-6 (which explains *correctness* failures) — FR-7 evaluates *how* the student writes code regardless of pass/fail:

- Naming and readability signals
- Structural patterns (e.g., consistently reinventing a data structure operation the language provides natively, deeply nested conditionals where an early-return would be clearer, repeated logic that could be factored)
- Concept-appropriate idiom usage (e.g., using an explicit index loop where the language's iterator idiom would be standard)
- Explicitly **not** a linter pass/fail gate — this feeds into feedback, never blocks submission or grading.
- **Acceptance criteria:** two students who both pass the same problem, one with idiomatic code and one with a working-but-convoluted approach, receive materially different, specific feedback — not the same generic "great job" message.

### FR-8 — First-Time Onboarding **[NEW]**
Topic-map landing screen, unrestricted topic+difficulty selection for new accounts, conservative prior seeding for mastery scores until real evidence accumulates. See §6.1.

### FR-9 — Mastery Dashboard **[BUILT]**
Per-concept mastery, attempted/solved counts, unlock status. Existing `/api/mastery` + dashboard page. Recommend adding the knowledge-graph visualization from `03_IMPLEMENTATION_PLAN.md` Phase 5.1 so the prerequisite structure this whole product is built on is actually *visible* to the student, not just felt through routing decisions.

### FR-10 — Session & History Tracking **[BUILT]**
Existing `sessions`, `session_events`, `/api/history`. Continues to serve both product (student can review past attempts) and research (raw dataset) purposes.

## 8. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-1 | No unhandled server error should ever reach the client as a raw stack trace (directly addresses the Phase-1 bug in `01_ANALYSIS.md` §2.3 — this NFR is not hypothetical, it's already violated once in the current code). |
| NFR-2 | Every state-changing operation (mastery update, bandit update, event log) either succeeds visibly or fails visibly — no silent data loss (`01_ANALYSIS.md` §2.4). |
| NFR-3 | Execution requests are rate-limited and isolated (already true via Judge0 sandboxing + slowapi — maintain, don't regress). |
| NFR-4 | Every routing/diagnostic decision must be explainable on request — a student (or you, debugging) can ask "why was I given this problem / this diagnosis" and get the actual features/mastery scores that drove it, not a black box. |
| NFR-5 | Response latency for grading should not silently hang — Judge0 unavailability must degrade gracefully with a clear message (already partially true — `execute.py` returns a clear "Execution Service Down" response; preserve this pattern as new features are added). |
| NFR-6 | 100% open-source infrastructure: FastAPI, Next.js, Supabase (self-hostable Postgres), Judge0, and an open-weight or free-tier LLM path — no proprietary/paid-only dependency should be load-bearing for the core loop. (Note: verify current Zhipu GLM-4-Flash usage terms against this constraint as the product scales — flag if it ever requires a paid tier at production volume.) |
| NFR-7 | The system must behave identically whether the student manually picks a topic/difficulty or asks the system to choose — manual selection is a first-class path, not a fallback. |

## 9. Gap Table — Vision vs. Current Repo

Direct cross-reference so this PRD is immediately actionable against `03_IMPLEMENTATION_PLAN.md`:

| Requirement | Status | Action |
|---|---|---|
| FR-1 Mastery modeling | Built | Harden per Implementation Plan Phase 1 |
| FR-2 Prerequisite graph | Built | No action |
| FR-3 Adaptive routing (full concept+difficulty) | Partial | Implementation Plan Phase 2, Option A |
| FR-4 Execution & grading | Built, buggy | Implementation Plan Phase 1.1–1.4 |
| FR-5 Diagnostic escalation | **New** | Not in current implementation plan — add as a new phase (see §10 below) |
| FR-6.1 Causal failure explanation | Built | No action |
| FR-6.2 Complexity reasoning | **New** | Not in current implementation plan — add as a new phase |
| FR-7 Code quality/style analysis | **New** | Not in current implementation plan — add as a new phase |
| FR-8 Onboarding flow | **New** | Frontend-only addition; no backend blocker |
| FR-9 Mastery dashboard + visualization | Built / Planned | Implementation Plan Phase 5.1 covers the visualization |
| FR-10 History/sessions | Built | No action |

**Note:** FR-5, FR-6.2, and FR-7 are genuinely new product surface not covered by the implementation plan produced earlier (that plan was scoped to research-paper readiness and existing-feature hardening). If this PRD is approved, `03_IMPLEMENTATION_PLAN.md` needs a new phase inserted for these three — recommend after Phase 2 (routing) and before Phase 3 (evaluation harness), since the evaluation harness should ideally simulate the full diagnostic loop, not just the difficulty bandit, if FR-5 is in scope for the paper too.

## 10. Success Metrics

| Metric | What it validates |
|---|---|
| % of new users who reach a first submission within their first session without abandoning topic/difficulty selection | FR-8 onboarding isn't a friction point |
| Reduction in repeated failures on the same concept after a diagnostic redirect (FR-5) vs. a control group without it | The diagnostic loop actually helps, not just informs |
| Student-reported clarity of failure explanations (qualitative, or a simple thumbs up/down on each explanation) | FR-6 explanations are actually useful, not just present |
| Mastery growth rate (BKT trajectory slope) for adaptively-routed students vs. a random/fixed baseline | The core adaptive thesis — this is also the paper's central result (see `03_IMPLEMENTATION_PLAN.md` Phase 3) |
| Zero unhandled 500s in production logs over a rolling window | NFR-1/NFR-2 hold in practice, not just in code review |

## 11. Open Questions

1. **FR-5 thresholds** (attempts/hints/time that trigger diagnostic mode) — need concrete default values before this can be built; likely differ by difficulty tier.
2. **FR-6.2 complexity reasoning** — static analysis vs. LLM-reasoned estimate is a real accuracy/cost tradeoff; static analysis is more defensible for a research paper's methodology section but is a nontrivial parser to build correctly across multiple languages.
3. **FR-7 style analysis** — needs a decision on scope (heuristic/rule-based pattern detection vs. LLM-based code review) and on how it's surfaced so it doesn't read as nagging or gatekeeping given the product's explicit "never block the student" principle (§6.1).
4. Does FR-5's diagnostic escalation belong in the research paper's scope, or is it a v1.1 product feature outside the paper's evaluation? This affects whether it needs to be represented in the `research/` simulation environment from `03_IMPLEMENTATION_PLAN.md` Phase 3.

## 12. Suggested Phasing Relative to the Existing Implementation Plan

```
Implementation Plan Phase 0  (safety net)               — unchanged
Implementation Plan Phase 1  (correctness fixes)         — unchanged
Implementation Plan Phase 2  (routing decision)           — unchanged, now clearly required (FR-3)
  ↳ NEW Phase 2.5 — FR-8 Onboarding flow (frontend-only, no dependency on Phase 3+)
  ↳ NEW Phase 2.6 — FR-5 Diagnostic escalation (depends on Phase 2's routing + existing prereq graph)
  ↳ NEW Phase 2.7 — FR-6.2 + FR-7 (complexity reasoning + code-quality feedback; extends ai_tutor.py)
Implementation Plan Phase 3  (evaluation harness)          — extend to also evaluate FR-5's diagnostic
                                                              accuracy against synthetic struggling students,
                                                              not just difficulty-routing regret
Implementation Plan Phase 4–6 — unchanged
```
