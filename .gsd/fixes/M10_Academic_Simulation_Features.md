# M10: Academic Simulation & Missing Capabilities

## Objective
Fulfill the project's academic thesis by scaffolding the required simulation environment and missing UX routes (Onboarding/Mastery).

## Context & Architectural Flaw
The product is intended as an empirical proof that LinUCB outperforms random curricula. However, `research/env.py`, the Monte Carlo simulator, and the `/onboarding` baseline assessment are completely absent, rendering the thesis unprovable.

## Code-Level Execution Blueprint
1. **Target:** `backend/research/simulator.py` (Create new)
   - Draft a script to simulate 100 students passing through the BKT model against random vs LinUCB agents.
2. **Target:** `frontend/src/app/(app)/onboarding/page.tsx` (Create new)
   - Implement the FR-8 explicit topic selection flow to initialize the BKT prior.
3. **Target:** `frontend/src/app/(app)/mastery/page.tsx` (Create new)
   - Implement the Recharts DAG visualization consuming the `/api/mastery` endpoint.

## Verification Protocol
1. Execute `python backend/research/simulator.py`; assert it outputs a comparative performance CSV.
2. Navigate to `/onboarding`; assert new users can configure their starting knowledge state.
