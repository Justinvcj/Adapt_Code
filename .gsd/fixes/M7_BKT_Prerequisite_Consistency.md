# M7: BKT & Prerequisite Logic Consolidation

## Objective
Enforce a single source of truth for the curriculum's Directed Acyclic Graph (DAG) and mastery thresholds.

## Context & Architectural Flaw
`PREREQUISITE_GRAPH` is defined independently in both `linucb.py` and `prerequisites.py` with divergent node definitions (e.g., `binary_search` requires `['arrays']` in one and `['arrays', 'loops']` in the other). `MASTERY_THRESHOLD` is also arbitrarily hardcoded.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/services/linucb.py`
   - Delete the local `PREREQUISITE_GRAPH` and `MASTERY_THRESHOLD`.
   - Refactor to: `from app.services.prerequisites import PREREQUISITE_GRAPH, MASTERY_THRESHOLD`.
2. **Target:** `backend/app/services/prerequisites.py`
   - Standardize `MASTERY_THRESHOLD = 0.85`.
   - Update `can_access_concept` to use the standardized constant instead of a default kwarg.

## Verification Protocol
1. Run `grep -r "PREREQUISITE_GRAPH =" backend/`. Ensure only one definition exists.
2. Verify unlock calculations via `/api/mastery` yield identical results to the LinUCB context builder.
