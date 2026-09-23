# M3: Frontend Data Wiring & TypeScript Correctness

## Objective
Rectify UI state keys and syntax errors that cause the frontend to display blank data despite correct backend responses.

## Context & Architectural Flaw
The frontend expects keys that do not align with backend DTOs.
- `dashboard/page.tsx` reads `stats.streak` (backend provides `current_streak`).
- `problem/[id]/page.tsx` reads `problem.difficulty` (backend provides `difficulty_level`).
- `history/page.tsx` contains broken template literals in TSX `className` attributes, resulting in fatal compilation errors during build time.

## Code-Level Execution Blueprint
1. **Target:** `frontend/src/app/(app)/dashboard/page.tsx`
   - Refactor `useState` init and JSX bindings to use `current_streak` and `total_problems_solved`.
2. **Target:** `frontend/src/app/(app)/problem/[id]/page.tsx`
   - Update interpolation from `{problem.difficulty}` to `{problem.difficulty_level}`.
   - Update `{problem.hints[0]}` to `{problem.hint_text}`.
3. **Target:** `frontend/src/app/(app)/history/page.tsx`
   - Fix line 81: `className={"px-md py-3 text-body-md whitespace-nowrap " + getStatusColor(h.final_verdict)}`.
   - Fix line 93: Enclose template literal variables properly in backticks.

## Verification Protocol
1. Run `npm run build` in the frontend directory. Ensure zero TSX compilation errors.
2. Authenticate and load the dashboard; verify numeric values replace the `0` placeholders.
