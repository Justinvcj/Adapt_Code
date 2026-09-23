# AdaptCode System Architecture

**Last Updated:** 2026-09-23

AdaptCode is an intelligent tutoring system that evaluates student code submissions, tracks their knowledge probabilistically, and adaptively recommends their next practice problem.

This document describes the implemented architecture.

## 1. High-Level Components

1. **Frontend (Next.js 14 App Router)**
   - Renders the Monaco editor.
   - Manages user authentication via Supabase Auth.
   - Manages routing for dashboards, problem solving, and onboarding.

2. **Backend (FastAPI)**
   - Acts as the orchestrator.
   - Modulates AI explanations, telemetry storage, code execution, and adaptive algorithms.
   - Interacts with the Supabase database via the official Python SDK.

3. **Code Execution (Piston)**
   - A standalone Docker container (`ghcr.io/engineer-man/piston`) running on port 2000.
   - Provides a REST API to securely execute Python, Java, C++, and JS code in ephemeral sandboxes.

4. **Database (Supabase / PostgreSQL)**
   - Central state store for problems, session telemetry, mastery scores, and ML agent parameters.

---

## 2. The Adaptive Loop (Data Flow)

The core value of AdaptCode lies in its adaptive loop, triggered whenever a student submits code via `/api/submit` in `backend/app/routers/problems.py`.

### Phase 1: Evaluation
1. The backend receives the student's code.
2. It fetches the problem's hidden test cases from `supabase.table("problems")`.
3. It POSTs the code and test cases to the **Piston API** (`localhost:2000`).
4. Piston evaluates the code and returns stdout/stderr and exit codes.
5. The backend compares actual output against expected output and generates a `verdict` (`Accepted`, `Wrong Answer`, `Runtime Error`, `Compilation Error`).

### Phase 2: Bayesian Knowledge Tracing (BKT) Update
1. The backend computes an `effective_weight` for the problem based on its difficulty.
2. It calls `update_mastery()` in `app.services.bkt` with the student's current mastery probability (fetched from `mastery_scores`) and the verdict (1 for Accepted, 0 for failure).
3. The new mastery probability is saved back to `mastery_scores`.

### Phase 3: Telemetry & State Logging
1. The backend inserts a record into `session_events`, recording the exact time, compile errors, hint usage, and final verdict.

### Phase 4: LinUCB Contextual Bandit (Next Problem Selection)
1. The backend instantiates a `LinUCBAgent` and loads the student's personalized matrices (`A` and `b`) from the `agent_state` table.
2. It builds a contextual feature vector `x` summarizing the student's recent performance (streak, error rates, time on task) and current mastery.
3. The agent selects an `action` index (0-4), mapping to pedagogical strategies:
   - `0: easier_problem`
   - `1: same_difficulty`
   - `2: harder_problem`
   - `3: redirect_prerequisite`
   - `4: hint_augmented` *(Currently unsupported in router)*
4. Based on the selected action, the backend queries the database for an unsolved problem matching the target concept and difficulty.
5. The backend computes the `reward` for the *previous* problem, updates the LinUCB agent's state, and saves the matrices back to `agent_state`.

### Phase 5: LLM Diagnostics (Background Task)
1. If the verdict is not `Accepted`, the backend fires a FastAPI background task calling `gemini.py`.
2. The Gemini API analyzes the code and the failed test case, returning structured JSON via Pydantic (`what_went_wrong`, `why_approach_fails`, `concept_to_review`).
3. This explanation is stored in the `explanations` table, which the frontend polls via `/api/explanation/{event_id}`.

---

## 3. Database Schema Layout

| Table | Purpose | Critical Fields |
|-------|---------|----------------|
| `users` | Auth and profiles | `user_id`, `email`, `is_pro` |
| `problems` | The curriculum | `problem_id`, `concept_tag`, `difficulty_level`, `test_cases` |
| `sessions` | Grouped learning sessions | `session_id`, `student_id`, `session_number` |
| `session_events` | Granular telemetry | `event_id`, `student_id`, `problem_id`, `final_verdict` |
| `mastery_scores` | BKT current state | `student_id`, `concept_tag`, `mastery_probability` |
| `agent_state` | LinUCB personalized models | `student_id`, `a_matrices`, `b_vectors` |
| `explanations` | LLM tutoring outputs | `session_event_id`, `what_went_wrong`, `status` |

---

## 4. Known Architectural Deficiencies
*(See `REPOSITORY_AUDIT.md` for a complete list)*

- **Transactions:** The 5-phase adaptive loop described above performs 5+ sequential database writes via HTTP. There is no SQL transaction block. If the server crashes mid-request, the BKT mastery might update while the `session_events` log fails, leaving the system in an inconsistent state.
- **Serialization:** LinUCB serialization requires refactoring to correctly support Dictionary mapping to JSON arrays.
- **Table Missing:** The `explanations` table referenced in Phase 5 is missing from `schema.sql`.

