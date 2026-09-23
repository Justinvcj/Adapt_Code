# M9: UI Workflow & Next Problem Handoff

## Objective
Complete the core loop UX by guiding the user to the dynamically selected "next problem."

## Context & Architectural Flaw
Upon achieving an 'Accepted' verdict, the BKT/LinUCB backend accurately computes and returns the optimal `next_problem`. However, the frontend simply displays a success toast. The user remains stranded on the completed problem's workspace.

## Code-Level Execution Blueprint
1. **Target:** `frontend/src/app/(app)/problem/[id]/page.tsx`
   - Introduce local state: `const [nextProblemInfo, setNextProblemInfo] = useState(null);`.
   - Inside `handleSubmit` success block: `setNextProblemInfo(res.next_problem);`.
   - Render a Post-Solve Modal overlaying the editor:
     - Congratulate user.
     - Display Mastery Delta.
     - Button: `router.push("/problem/" + nextProblemInfo.id)` -> "Proceed to [Next Concept/Difficulty]".

## Verification Protocol
1. Submit a valid solution.
2. Assert the Post-Solve Modal appears within 500ms.
3. Click "Proceed"; verify seamless client-side routing to the new problem ID.
