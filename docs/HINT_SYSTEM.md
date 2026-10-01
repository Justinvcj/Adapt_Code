# Hint System — rules and contract

Status: v1 — matches `backend/app/routers/problems.py` diagnostic escalation.

The hint system is a core *teaching* feature of AdaptCode: a graduated,
rules-based reveal that supplements the adaptive engine without short-circuiting
it. Learners who use hints pay a mastery cost; the engine still gets a signal
about how much help was needed.

---

## 1. Tiers

Every problem exposes three hints, in order of helpfulness:

| Tier            | What it gives                                     | Mastery multiplier |
|-----------------|---------------------------------------------------|--------------------|
| Nudge           | Rephrases the problem, points at the kind of idea | **× 0.9**          |
| Scaffold        | Names the data structure / technique, no code    | **× 0.7**          |
| Near-solution   | Pseudocode with 1–2 key blanks                    | **× 0.4**          |

A learner can only unlock the next tier after the previous one has already met
its availability rule (tiers do not skip).

The multiplier applies to the BKT effective-weight **only on an Accepted
submission**. Hints never add to mastery; they can only soften what you would
otherwise have earned.

---

## 2. Availability rules

A tier becomes available when **any** of the following signals cross a
threshold, calibrated per problem difficulty:

```
Easy   base_time = 300s
Medium base_time = 600s
Hard   base_time = 1200s
```

| Tier            | Attempts | Compile errors | Time on task         |
|-----------------|----------|----------------|----------------------|
| Nudge           | ≥ 2      | ≥ 3            | ≥ base_time          |
| Scaffold        | ≥ 3      | ≥ 5            | ≥ 1.5 × base_time    |
| Near-solution   | ≥ 4      | ≥ 8            | ≥ 2 × base_time      |

The current frontend evaluates these on the fly from `attempt_count`,
`compile_error_count`, and `time_on_task_seconds`, which it already sends to
`POST /api/submit`.

A learner may also **explicitly request** an unavailable hint. The UI shows a
confirmation step ("This hint is still locked — unlocking early counts as if you
hit the threshold"). On confirmation the hint reveals and the mastery penalty
applies as if the threshold had been crossed naturally.

---

## 3. State machine (per problem, per attempt session)

```
             +-----------+   signal / request    +-----------+
             |   Locked  |---------------------->| Available |
             +-----------+                       +-----------+
                    ^                                 |
                    | new submission (reset)          | user reveal
                    |                                 v
             +-----------+                       +-----------+
             |  Revealed |<----------------------|  Revealed |
             +-----------+                       +-----------+
```

- The session starts when `POST /api/start` fires for a problem.
- Reveals persist until Accepted *or* a new `POST /api/start` for a different
  problem (so re-opening a problem resets reveals for that session).
- A revealed hint stays revealed within the session even if the learner
  resubmits.

---

## 4. API contract (frontend ⇄ backend)

### `POST /api/hint`

Reveal a hint. Idempotent per `(user, problem, tier, attempt_session)`.

```http
POST /api/hint
Content-Type: application/json

{
  "problem_id": "two-sum",
  "tier": "nudge" | "scaffold" | "near_solution",
  "force_early": false
}
```

Response:

```json
{
  "status": "revealed",
  "hint": {
    "tier": "nudge",
    "title": "Think about what you repeat",
    "body": "...",
    "mastery_multiplier": 0.9
  },
  "effective_at_next_submit": true
}
```

If `force_early` is `true` **and** the tier is not naturally available, the
server still returns the hint but marks the submission context as if the
threshold had been met, which the BKT update then uses.

### Submission payload addition

`POST /api/submit` already carries `hint_used` and `hint_used_at_attempt`.
Extend with:

```json
{
  "hints_revealed": ["nudge", "scaffold"]
}
```

The server:
1. Chooses the lowest multiplier among all revealed tiers.
2. Multiplies the computed `effective_weight` by it on an Accepted verdict.
3. Writes the full list to `session_events.hints_revealed` (JSON array column).

---

## 5. UI contract

The workspace has a dedicated **Hints** tab, left of **Testcase**.

Each tier shows as a card. States:

- **Locked** — grey, outline border, status chip explains the threshold
  ("After attempt 2, or 300s on task · you're on attempt 1").
- **Available** — accent border, reveal button.
- **Revealed** — expanded card showing title + body + mastery multiplier chip.

A short note at the top explains the system in one sentence and links to
`docs/HINT_SYSTEM.md`.

---

## 6. Content authoring

Hints are **hand-authored per problem** in v1. They live in
`frontend/src/data/hints.ts` for the mock corpus and in the `problems.hints`
JSONB column server-side once real content lands.

Rules of thumb for authors:

- **Nudge** is 2–3 sentences, no code, no data-structure name.
- **Scaffold** names the technique and the data structure, no code.
- **Near-solution** is pseudocode of ~5 lines with 1–2 blanks that the learner
  must fill. Never give the final return statement verbatim.

Pre-generation via an LLM is explicitly *out of scope* for the first iteration —
we want to see hand-authored quality land first and only automate once the bar
is clear.

---

## 7. Open questions

- Does revealing a hint on Problem A affect mastery updates for a *different*
  concept Problem A tags secondarily? v1: no — the multiplier only applies to
  the primary `concept_tag`.
- Should hints be visible in the submission history? v1: yes, as a small
  "hints used" badge on each event row.
- Should Accepted-with-near-solution still count as "solved" for streaks? v1:
  yes — streaks measure consistency, not mastery.
