# AdaptCode: Deep Forensic Technical Audit Report

## 1. Executive Truth

The `Adapt_Code` repository is an ambitious prototype masquerading as a scientifically validated adaptive learning platform. As an engineering artifact, it successfully wires together a functional React frontend, a legitimate backend sandbox for code execution (via Piston), and an LLM-based diagnostic pipeline (via Gemini 2.5 Flash). 

However, the core claims of "adaptive learning" via Bayesian Knowledge Tracing (BKT) and LinUCB Contextual Bandits are fundamentally compromised by architectural flaws, hard-coded constants, and broken end-to-end routing. It is not currently a mathematically sound adaptive system; it is a deterministic heuristic wrapper that bypasses its own intelligence layer. The platform currently operates as a standard manual-selection problem library with a broken suggestion mechanic tacked onto the end of successful submissions.

## 2. What Actually Works (The Good)

- **Code Execution Engine:** The Piston integration securely sandboxes code, evaluates it against test cases, and catches compile/runtime errors via a legitimate API call to port 2000.
- **AI Diagnostics:** The Gemini API legitimately fires as a background task on test failure. It successfully parses error output and generates a 3-part diagnostic JSON.
- **Frontend IDE:** The Monaco-based editor is fully functional, supporting syntax highlighting and direct backend communication.
- **Telemetry Collection:** Time-on-task, hint usage, attempt counts, and abandonment are successfully collected by the frontend and logged to the `session_events` table.

## 3. What Does NOT Actually Work (The Broken)

- **LinUCB Adaptive Routing:** The agent state (`A` matrices and `b` vectors) is instantiated per-student from scratch with zero pre-training. A LinUCB algorithm requires hundreds of interactions to converge; initializing it independently per student means it effectively performs random exploration for the entire student's lifecycle. It never learns.
- **Next Problem Delivery:** The "adaptive loop" is physically broken. The dashboard's "Resume Practice" button dumps the user into the full problem library to manually guess their next problem. The adaptive `next_problem` recommendation is only delivered inside a success modal *after* solving a problem.
- **Diagnostic Escalation (FR-5):** The PRD claims the system escalates to diagnostics upon crossing struggle thresholds (e.g., 5 attempts). This logic is completely missing from the `problems.py` orchestrator.
- **Complexity Reasoning & Code Style (FR-6.2 & FR-7):** The PRD claims the LLM reasons about time/space complexity and code style. The actual prompt in `gemini.py` only asks for "what went wrong," "why approach fails", and "concept to review."
- **Onboarding Flow (FR-8):** Not implemented; the user is dumped straight into a generic dashboard.

## 4. Fake / Hard-Coded / Simulated Findings

- **Component**: Bayesian Knowledge Tracing (`bkt.py`)
  - **Evidence**: `L0 = 0.30`, `P_T = 0.12`, `P_G = 0.20`, `P_S = 0.10` are hard-coded constants applied universally across all 12 concepts.
  - **What it appears to do**: Learn and update concept-specific mastery priors based on historical data.
  - **What it actually does**: Applies a generic, fixed deterministic formula to all students. It is a heuristic rule wearing a BKT math formula.
  - **Severity**: Fundamental (Level 5).
- **Component**: LinUCB Pre-training (`simulator.py`)
  - **Evidence**: `simulator.py` generates fake data to train an agent, but the production system ignores this entirely.
  - **What it appears to do**: Provide a baseline intelligent policy for new users.
  - **What it actually does**: The production system starts with blank `np.eye` and `np.zeros` matrices for every single user.
  - **Severity**: Fundamental (Level 5).
- **Component**: Client-Side Telemetry (`page.tsx`)
  - **Evidence**: `req.time_on_task_seconds` is calculated on the client side using `(Date.now() - startTime) / 1000`.
  - **What it appears to do**: Track genuine time spent on a problem.
  - **What it actually does**: Blindly trusts an unsanitized, easily spoofable client-side clock.
  - **Severity**: Engineering (Level 2).

## 5. Claim vs Implementation Audit

| Claim | Implementation Status | Verdict |
|-------|----------------------|---------|
| "Models each learner's mastery... applying BKT" | `bkt.py` updates mastery, but uses hard-coded global parameters for all concepts. | Partially Implemented (Heuristically) |
| "LinUCB contextual multi-armed bandits to serve challenges" | LinUCB code exists, but initializes per-student with no global prior. It acts as random routing. | Broken / Unsound |
| "Evaluates how a student coded... not only correctness" (FR-7) | Gemini prompt only looks at failure reasons. | Not Implemented |
| "Diagnostic mode activates on struggle thresholds" (FR-5) | Missing from `problems.py`. Requests just update BKT. | Not Implemented |
| "100% open-source infrastructure (NFR-6)" | Relies entirely on free-tier APIs (Gemini) that could change pricing models. | At Risk |

## 6. End-to-End Data Flow

1. **User Input:** (`page.tsx`) captures code, time-on-task, and compile errors.
2. **Execution:** (`problems.py`) routes code to `piston.py`.
3. **Mastery Update:** (`bkt.py`) calculates effective weight using hard-coded parameters.
4. **Adaptive Selection:** (`linucb.py`) builds context and selects action from untrained per-user matrices.
5. **AI Diagnostics:** (`gemini.py`) fires asynchronously if the answer is wrong.
6. **Break Point:** The LinUCB selected action recommends a `next_problem`. The frontend ONLY uses it in the success modal. If the user fails or visits the dashboard, the recommendation is lost.

## 7. Algorithm Audit

- **Bayesian Knowledge Tracing (BKT):** The Bayesian posterior math is correct, but a true BKT model requires learning parameters (L0, T, G, S) per skill. Using fixed globals turns it into a heuristic formula.
- **LinUCB:** The ridge regression inverse (`A_inv`) math is correct, but a contextual bandit is designed to learn from a pool of users. By isolating `A` and `b` inside a `student_id` dictionary and starting from 0, the bandit has no prior data. The exploration parameter (`alpha = 1.0`) dominates, leading to random recommendations.

## 8. Experiment Audit

The `backend/research/simulator.py` generates fake student data using `np.random.beta` to compare "linucb" vs "random". However, the synthetic environment explicitly programs the `LinUCB` strategy to succeed:
```python
if action == 0:
    p_correct = min(1.0, p_correct * 1.5)
```
The simulation is circular: it explicitly forces the environment to reward LinUCB's expected behavior, and then proves LinUCB performs better. This is a rigged simulation.

## 9. Statistical Audit

No statistical results (means, p-values, F-statistics) are reported in the README or PRD based on real data. The only results are from the rigged simulator (`Final Average Mastery: LinUCB: 0.xxxx`). These are entirely synthetic and **unverified**.

## 10. Reproducibility Audit

The project is mostly reproducible as an engineering artifact. The `seed_db.py` script correctly populates the database, and the required Docker commands for Piston are documented. However, reproducing the "adaptive behavior" is impossible because the algorithms are structurally prevented from learning.

## 11. Critical Findings

1. **LinUCB operates as a random router (Level 5):** Initializing disjoint bandits per user means the algorithm never converges.
2. **BKT uses hard-coded global parameters (Level 4):** Concept-specific learning curves don't exist.
3. **Adaptive loop is disconnected from the main flow (Level 4):** The platform operates as a manual-selection library.
4. **Rigged Simulator (Level 3):** `simulator.py` hard-codes the environment to reward specific actions.
5. **Client-side telemetry trust (Level 2):** Time-on-task is easily spoofed.

## 12. Severity Classification

- **LinUCB per-user isolation:** Fundamental (Level 5)
- **BKT hard-coded parameters:** Architectural (Level 4)
- **Disconnected adaptive flow:** Architectural (Level 4)
- **Rigged Simulator:** Experimental (Level 3)
- **Client-side time tracking:** Engineering (Level 2)

## 13. Required Rebuilds

- **LinUCB (MUST FIX):** Rewrite `LinUCBAgent` to maintain a global `A` and `b` matrix, using student traits (like mastery) as features in the context vector, rather than instantiating blank matrices per student.
- **Frontend Routing (MUST FIX):** The dashboard's "Resume Practice" button MUST call `/api/next-problem` to drop the user directly into the recommended problem.
- **BKT (MUST FIX):** Replace the 4 constants in `bkt.py` with a database fetch for per-concept parameters trained from historical data.
- **Simulator (SHOULD FIX):** Remove the hard-coded `if action == 0` reward rules and model underlying student knowledge states authentically.

## 14. Minimal Path to a Genuine Working System

1. **Fix the Bandit:** Change `linucb.py` to use a single global `A` matrix and `b` vector.
2. **Close the Loop:** Modify `dashboard/page.tsx` so "Resume Practice" fetches from `/api/next-problem` and redirects the user.
3. **Train BKT:** Run a one-time EM algorithm to set realistic priors and store them in the database.
4. **Implement Diagnostics:** Add logic in `problems.py` to detect struggle thresholds (e.g., `attempt_count > 3`) and return a redirect action.

## 15. Final Reality Check

- **Percentage genuinely complete:** ~60% (Execution sandbox, frontend, IDE, and LLM diagnostics work well).
- **Percentage simulated/hard-coded:** ~40% (The entire "adaptive" BKT/LinUCB engine is structurally unsound or hard-coded).
- **Percentage unverified:** All experimental claims regarding adaptive superiority are unverified.
- **Is the current experimental evidence actually supported by the code?** No. The simulator is hard-coded to reward the algorithm.
- **Can the reported results be reproduced from the repository?** The codebase runs, but the AI routing success cannot be reproduced.
- **5 biggest technical weaknesses:** (1) Per-user disjoint bandits. (2) Hard-coded BKT params. (3) Manual routing bypasses adaptive loop. (4) Tautological simulator. (5) Client-side telemetry trust.
- **5 most important fixes:** (1) Globalize LinUCB matrices. (2) Wire dashboard to `/api/next-problem`. (3) Database-backed BKT parameters. (4) Server-side timestamp tracking. (5) Implement FR-5 diagnostic thresholds.
