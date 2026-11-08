# AdaptCode — Complete UI/UX Master Specification & Design System
**Version:** 2.0 (Production Blueprint)  
**Target Audience:** Product Designers, UI/UX Engineers, Frontend Architects  
**Scope:** Complete platform overhaul, design tokens, component architecture, screen specs, interaction physics, and accessibility.

---

## 1. Executive Vision & Design Philosophy

### 1.1 Product Identity: The Adaptive Mastery Gymnasium
AdaptCode is not another LeetCode clone designed for rote memorization or interview cramming. It is an **Intelligent Tutoring System (ITS)** that treats algorithm practice as a cognitive skill tree. 
* Traditional competitive programming treats failure as punitive (red X, score penalty, ranking drop).
* **AdaptCode treats failure as a diagnostic signal.** Every wrong answer, compilation error, repeated attempt, and idle minute feeds a dual-engine brain:
  1. **Extended Bayesian Knowledge Tracing (BKT)** calculates real-time probabilistic mastery across 12 foundational concepts.
  2. **LinUCB Contextual Bandit** selects the exact optimal next task to keep the student in their Zone of Proximal Development (ZPD).
  3. **Google Gemini 2.5 Flash** intervenes asynchronously with Socratic failure analyses that teach rather than spoil.

### 1.2 Aesthetic Direction: "Technical High-Craft"
* **Vibe:** Linear-grade minimalism + Apple physical restraint + Research-laboratory precision.
* **Palette:** Deep void dark-mode by default (`#010102`), elevated graphite surfaces (`#141516`, `#1c1d1f`), high-voltage semantic accents:
  - **Mastery Gold / Energy:** `#ffa116` / `#ffb867` (concept unlock, progress ring, active nodes)
  - **Solved Emerald:** `#27a644` / `#34d399` (accepted verdicts, unlocked badges)
  - **Diagnostic Violet / AI:** `#8b7cff` / `#a78bfa` (Gemini explanations, AI insights)
  - **Error Crimson:** `#ef4444` / `#f87171` (compiler rejection, testcase failure)
* **Design Read Dials (GSD Framework):**
  - `DESIGN_VARIANCE: 6` (Structured, authoritative, predictable grid with purposeful asymmetrical focal points)
  - `MOTION_INTENSITY: 5` (Snappy, spring-based Apple physics for layout and feedback; zero frivolous hovering loops)
  - `VISUAL_DENSITY: 4` (Information-rich code editor and telemetry dashboards balanced with breathable gutters and readable typography)

---

## 2. Global Design System & Token Architecture

### 2.1 Typography Hierarchy
The platform uses a three-tier type system:
1. **Headings & Display:** `Space Grotesk` (Geometric, technical, distinctive).
2. **Body & Interface:** `Geist Sans` or `Inter` (Neutral, highly legible at small sizes).
3. **Code & Metrics:** `JetBrains Mono` / `Fira Code` (Fixed-pitch, tabular numerals `font-variant-numeric: tabular-nums` for timers, percentages, and editor text).

```css
:root {
  /* Font Families */
  --font-display: 'Space Grotesk', -apple-system, sans-serif;
  --font-ui: 'Geist Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Type Scale */
  --text-2xs: 10px;  /* Micro tags, status indicators */
  --text-xs:  11px;  /* Pill badges, metadata labels */
  --text-sm:  12px;  /* Secondary text, console logs, tabs */
  --text-base:13px;  /* Default UI copy, table rows */
  --text-md:  14px;  /* Problem description body, inputs */
  --text-lg:  16px;  /* Sub-headings, card titles */
  --text-xl:  20px;  /* Panel headers, modal titles */
  --text-2xl: 24px;  /* Screen titles, hero metrics */
  --text-3xl: 32px;  /* Big numbers (Total solved, rank) */
}
```

### 2.2 Semantic Color Token Matrix
```css
:root {
  /* Surfaces (Void to Elevated) */
  --bg-canvas:   #010102; /* Deepest screen background */
  --bg-surface:  #0e0f10; /* Sidebar, navbar, container cards */
  --bg-elevated: #161719; /* Modals, popovers, active tabs */
  --bg-subtle:   #1f2023; /* Hover fills, nested code blocks */

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-card:   rgba(255, 255, 255, 0.10);
  --border-hover:  rgba(255, 255, 255, 0.18);
  --border-focus:  #ffa116;

  /* Typography Colors */
  --text-primary:   #ededed;
  --text-secondary: #9ca3af;
  --text-tertiary:  #6b7280;
  --text-disabled:  #4b5563;

  /* Semantic State Tokens */
  --accent-gold:       #ffa116;
  --accent-gold-glow:  rgba(255, 161, 22, 0.15);
  --solved-green:      #22c55e;
  --solved-green-glow: rgba(34, 197, 94, 0.15);
  --error-red:         #ef4444;
  --error-red-glow:    rgba(239, 68, 68, 0.15);
  --ai-violet:         #8b5cf6;
  --ai-violet-glow:    rgba(139, 92, 246, 0.15);
  --locked-slate:      #374151;
}
```

### 2.3 Layering, Radii & Depth
* **Radii:** Concentric hierarchy (`--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`, `--radius-full: 9999px`). Child elements must never have a larger radius than their parent container.
* **Shadows:** Multi-layered optical shadows (ambient + direct drop):
  - Card: `0 1px 3px rgba(0,0,0,0.4), 0 0 0 1px var(--border-card)`
  - Modal: `0 20px 40px -15px rgba(0,0,0,0.8), 0 0 0 1px var(--border-hover)`
  - Glowing Node: `0 0 24px var(--accent-gold-glow), 0 0 0 1px var(--accent-gold)`

---

## 3. The Dual Layout Shell Model

The interface is architecturally split into two distinct viewport paradigms:

### Shell A: The Platform App Shell (Responsive Scroll Canvas)
Used for `/`, `/problems`, `/mastery`, `/graph`, `/profile`, `/settings`.
* **Top Navigation Bar (Height: 52px, Sticky):**
  - Left: Logo icon + "AdaptCode" wordmark (Space Grotesk 600) + Concept indicator pill.
  - Center: Nav link pills with subtle active indicator underline (`Home`, `Problems`, `Mastery`, `Concept Map`).
  - Right: Streak counter with Flame icon, "Daily Goal" ring (e.g., 2/3 Solved), Global Search trigger (`⌘K`), User Avatar with status badge.
* **Content Canvas:** Center-aligned maximum width `1280px`, horizontal padding `24px`, vertical scrolling enabled with safe gutters.

### Shell B: The IDE Workspace Shell (Zero-Scroll Edge-to-Edge)
Used exclusively for `/(app)/problem/[id]`.
* **Zero Outer Scroll:** The entire viewport is locked (`height: 100vh; overflow: hidden;`).
* **Sub-Navigation Strip (Height: 44px):**
  - Left: Logo, Back to Catalogue (`← All Problems`), Concept Tag pill (`Trees · Node 11`).
  - Center: Problem Title + Difficulty Badge (`Easy` / `Medium` / `Hard`).
  - Right: Quick Run Button (`Ctrl+Enter`), Submit Button with loading spinner, Timer (`12m 45s`), Layout reset, Fullscreen toggle.
* **Splitter Architecture:**
  - 2-Pane horizontal split: Left Pane (Problem Specs & Teaching) | Draggable Splitter Handle (`6px`) | Right Pane (Monaco Editor & Execution Console).
  - Minimum constraint: 30% width left, 30% width right. Split ratio saved to `localStorage`.
  - Accessible keyboard resize: `:focus-visible` on the splitter allows Left/Right arrow keys to shift pane ratio by 2% increments.

---

## 4. Screen-by-Screen Detailed UX Specifications

### 4.1 Screen 1: Dashboard & Learning Home (`/`)
* **Objective:** Give the student an immediate, honest view of their knowledge state and prompt the single next best action.
* **Component Wireframe:**
  ```
  +-------------------------------------------------------------------------+
  | [Hero Banner]                                                           |
  | [Avatar] Justin Varghese (@Justinvcj)          [ Edit ]  [ > Resume ZPD ]|
  | Rank: #1,420 | Streak: 7 Days | Solved: 48/120 | Mastery: 64%           |
  | Up Next: Two Pointers (Lowest unmastered unlocked concept)              |
  +-------------------------------------------------------------------------+
  | [Left 70%: The 12-Concept Skill Matrix]  | [Right 30%: Activity Rail]   |
  | - 12 Interactive Rows                    | - Daily Goal Ring (3/3 done) |
  | - Concept Title + Tier Icon              | - 30-Day Contribution Heatmap|
  | - Mini Progress Bar (BKT score %)        | - Recent Session Events      |
  | - "Unlocked" vs "Locked (Need Loops 50%)"| - Earned Badges Showcase     |
  +-------------------------------------------------------------------------+
  ```
* **Key Interactions:**
  - **"Resume ZPD" Primary Button:** Fires `GET /api/next-problem` and smoothly navigates directly to the LinUCB-selected practice problem.
  - **Concept Row Click:** Expands quick summary inline or routes to `/mastery/[concept]`.

---

### 4.2 Screen 2: Interactive Concept DAG (`/graph`)
* **Objective:** Allow learners to explore the entire 12-concept prerequisite map as an intuitive, spatial knowledge tree.
* **Visual Representation:**
  - 3 Vertical Tiers (Tier 1: Fundamentals, Tier 2: Core Structures, Tier 3: Advanced Optimization).
  - Nodes: Glassmorphic interactive circles displaying concept icon, title, and a circular SVG border representing current mastery percentage ($0.0 - 1.0$).
  - Directed Edges: Smooth Cubic Bézier curves (`path`).
    - *Unlocked edge:* Glowing gold gradient (`#ffa116` with active dash array).
    - *Locked edge:* Muted semi-transparent dark grey (`rgba(255,255,255,0.1)`).
* **Hover & Selection Physics:**
  - Hovering a node casts a directional light on all prerequisite parents and dependent children; dims unrelated nodes to 20% opacity.
  - Clicking a node opens a slide-over **"Concept Inspector Drawer"** showing:
    1. Concept theory overview and real-world idiom.
    2. Prerequisites list with status checkmarks.
    3. Problems solved vs total available.
    4. "Practice Weakest Node" action button.

---

### 4.3 Screen 3: Curriculum Mastery Hub (`/mastery` & `/mastery/[concept]`)
* **Mastery Overview (`/mastery`):**
  - Massive SVG radial mastery ring at the top: displays aggregate mastery calculated from `GET /api/mastery`.
  - 12 Grid Cards with dynamic color tiering:
    - `Locked`: Dimmed card, lock icon, tooltip showing prerequisite requirement (`e.g., Reach 85% in Recursion`).
    - `Weak (<40%)`: Amber border accent, warning badge ("Needs Reps").
    - `In Progress (40-84%)`: Gold accent, active progress bar.
    - `Mastered (≥85%)`: Emerald border, checkmark icon, "Mastered" badge.
* **Concept Deep Dive (`/mastery/[concept]`):**
  - Hero header with concept icon, philosophy, and BKT probability score.
  - Filterable problem list exclusively scoped to this concept, showing difficulty, acceptance rate, and user submission state (`Solved` / `Attempted` / `Unseen`).

---

### 4.4 Screen 4: Problem Catalogue (`/problems`)
* **Toolbar:**
  - Search bar with instant client-side debounced filtering.
  - Tag filter pills: `All Topics`, `Arrays`, `Dynamic Programming`, etc.
  - Difficulty filter toggles: `Easy` (Green), `Medium` (Gold), `Hard` (Crimson).
* **Problem Table:**
  - Columns: Status Icon (`✓` Solved / `○` Attempted / `-` New), Number, Title (hover underline), Acceptance Rate %, Difficulty badge, Frequency heatmap bar, Bookmark star.
  - Strict pagination controls with active page pills.

---

### 4.5 Screen 5: The Adaptive IDE Workspace (`/problem/[id]`)
This is the core interactive surface where learners spend 80% of their time.

```
+----------------------------------------------------------------------------------+
| [<- All] [Arrays > Two Pointers] Two Sum (Medium)    [Run (Ctrl+Enter)] [Submit] |
+----------------------------------------+-----------------------------------------+
| [Desc] [Hints (1)] [Explanation] [Sol] | [Language: Python 3 v] [Reset] [Copy]   |
|----------------------------------------|-----------------------------------------|
| # Description                          | class Solution:                         |
| Given an array of integers nums and... |     def twoSum(self, nums, target):     |
|                                        |         # Write your solution here      |
| ## Examples                            |         seen = {}                       |
| Input: nums = [2,7,11,15], target = 9  |         for i, n in enumerate(nums):    |
| Output: [0,1]                          |             diff = target - n           |
|                                        |             if diff in seen:            |
| ## Constraints                         |                 return [seen[diff], i]  |
| - 2 <= nums.length <= 10^4             |             seen[n] = i                 |
| - -10^9 <= nums[i] <= 10^9             |                                         |
|----------------------------------------+-----------------------------------------|
| [Status Bar] Time: 04:12 | Attempts: 2 | [Console: Testcase (3) | Test Result]   |
| Compile Errors: 0        | Hints: Nudge| Input: [2,7,11,15], 9 | Expected: [0,1] |
+----------------------------------------+-----------------------------------------+
```

#### Left Pane Tab Specifications:
1. **Description (`desc`):**
   - Clean GitHub-flavored Markdown. Syntax-highlighted sample code blocks.
   - Interactive example test cases that can be copied directly into the scratchpad.
   - **"Why this problem is here" Card:** Explains what algorithmic invariant this specific challenge reinforces.
2. **Hints (`hints`):** *See Section 4.6 for detailed specifications.*
3. **AI Post-Submission Explanation (`explanation`):** *See Section 4.7 for detailed specifications.*
4. **Solutions (`solutions`):**
   - Locked until the user achieves an `Accepted` verdict or voluntarily surrenders.
   - Clean editorial solutions with time/space complexity Big-O callouts.
5. **Submissions History (`submissions`):**
   - Reverse chronological timeline of every attempt.
   - Columns: Verdict chip, Runtime (ms), Language, Timestamp, Mastery Delta.

#### Right Pane Monaco Editor & Console Specifications:
* **Monaco Editor Configuration:**
  - Dark theme matching `--bg-canvas` (`#010102`).
  - Font: JetBrains Mono at `13px`, line height `1.5`, ligatures enabled.
  - Minimap disabled for maximum horizontal reading area.
  - Auto-closing brackets and quotes enabled.
  - Local auto-save to `localStorage` per problem slug every 2 seconds.
* **Execution Console Drawer:**
  - Collapsible drawer at the bottom of the editor.
  - **Tabs:** `Testcase` (Visible inputs) vs `Test Result` (Stdout/Stderr output).
  - When **Run** is triggered: Runs code against visible example cases. Displays execution time, stdout, and actual vs expected output diff.
  - When **Submit** is triggered: Evaluates against hidden test cases in remote Piston sandbox. Displays final verdict and automatically switches Left Pane to the **Explanation** tab.

---

### 4.6 Screen 6: The 3-Tier Graduated Hint Engine (`HintsPanel`)
* **Philosophy:** Hints are pedagogical scaffolds, not free passes. Unlocking a hint applies a clear, upfront **mastery multiplier penalty** to BKT on a subsequent correct solve.
* **The Three Tiers:**
  1. **Tier 1: Nudge (Multiplier: $\times 0.9$)**
     - Rephrases the invariant in plain language. Points toward the pattern (e.g., *"Notice that as one pointer moves right, the search space only contracts"*).
     - *Availability:* Automatically unlocks after $\ge 2$ attempts, $\ge 3$ compile errors, or $> 5$ minutes on task.
  2. **Tier 2: Scaffold (Multiplier: $\times 0.7$)**
     - Names the optimal data structure and algorithm without writing code (e.g., *"Use an in-memory Hash Map to store complement values for $O(1)$ lookups"*).
     - *Availability:* Automatically unlocks after $\ge 3$ attempts, $\ge 5$ compile errors, or $> 10$ minutes on task.
  3. **Tier 3: Near-Solution (Multiplier: $\times 0.4$)**
     - Provides structured pseudocode with 1-2 blank lines left for the learner to complete.
     - *Availability:* Unlocks after $\ge 4$ attempts, $\ge 8$ compile errors, or $> 15$ minutes on task.
* **Early Unlock Modal:**
  - If a learner wants a locked hint immediately, clicking "Reveal Early" triggers a high-contrast confirmation modal:
    > *"This hint is still locked. Revealing it early will apply the $\times 0.7$ mastery penalty to your eventual solve. Are you sure you want to proceed?"*
    > `[ Cancel ]  [ Acknowledge & Reveal ]`

---

### 4.7 Screen 7: The Socratic AI Diagnosis (`ExplanationPanel`)
* **Trigger:** Activated whenever a submission results in `Wrong Answer`, `Runtime Error`, `Compilation Error`, or `Time Limit Exceeded`.
* **State Machine:**
  1. **Pending State:** Pulsing violet shimmer skeleton with animated message: *"Gemini is analyzing your execution failure and identifying the conceptual flaw…"*
  2. **Error / Timeout State:** If the background worker fails or exceeds 15 seconds, falls back to a graceful error card offering standard concept review notes.
  3. **Completed State:** Renders three crisp, structured diagnostic cards:
     - **Card 1: What Went Wrong (The Specific Bug)**  
       Identifies the exact lines, variables, and failure scenario (e.g., *"Your pointer check on Line 14 exits before evaluating index 0 when the array contains negative integers"*).
     - **Card 2: Why the Approach Fails (The Conceptual Invariant)**  
       Explains why the mathematical intuition breaks down for this problem family, without giving away the answer.
     - **Card 3: Concept to Review & Actionable Micro-Exercise**  
       Names the specific sub-concept and provides a 1-sentence mental exercise (e.g., *"Trace this loop manually on paper with the input `[-1, 0, 1]`"*). Includes a direct button: `[ Review Concept Guide → ]`.

---

### 4.8 Screen 8: The Post-Solve Modal & Adaptive Next Handoff
* **Objective:** Complete the core adaptive learning loop. When a student solves a problem, they should never be left stranded on an empty editor.
* **Component Wireframe:**
  ```
  +-----------------------------------------------------------+
  |                   [ Confetti Flare ]                      |
  |                    🎉 PROBLEM SOLVED!                     |
  |                      Two Sum Accepted                     |
  |                                                           |
  |  Runtime: 4 ms (Beats 91%)  |  Memory: 16.4 MB            |
  |  Mastery Delta: +0.08 pts   |  Arrays Mastery: 72% -> 80% |
  |                                                           |
  |  +-----------------------------------------------------+  |
  |  | Up Next (Recommended by LinUCB Adaptive Engine):    |  |
  |  | 3Sum (Medium) · Focus: Two Pointers                 |  |
  |  | "Your performance on Two Sum shows readiness for    |  |
  |  | multi-pointer reduction techniques."               |  |
  |  +-----------------------------------------------------+  |
  |                                                           |
  |  [ Review Solution Code ]   [ > Continue to Next Problem ] |
  +-----------------------------------------------------------+
  ```
* **Interaction:** Clicking `Continue to Next Problem` smoothly transitions the Monaco editor and problem workspace to the new problem ID returned by the backend.

---

### 4.9 Screen 9: Authentication & Onboarding
* **Authentication (`/login`):**
  - Minimal split screen: Left side features the looping animated logo and 3 value propositions; right side houses the tabbed Card (`Sign In` vs `Create Account`).
  - Direct form submission issuing `POST /api/auth/login` and handling credentials via httpOnly session cookies.
  - Seamless OAuth integrations with Google and GitHub.
* **First-Time User Baseline Onboarding (`/onboarding`):**
  - Displays a clean visual grid of the 12 concepts.
  - Allows experienced learners to declare prior knowledge (e.g., *"I already know Basic Syntax, Loops, and Arrays"*).
  - Submits choices to `POST /api/onboarding/complete`, initializing BKT prior masteries to `0.85` so advanced developers aren't forced to solve trivial beginner problems.

---

### 4.10 Screen 10: Profile & Analytics (`/profile/[user]`)
* **Hero Summary:** Avatar, display name, handle, bio, and global rank.
* **Activity Heatmap:** 52-week GitHub-style contribution calendar displaying submission density per day, powered by `GET /api/stats/heatmap`.
* **Concept Radar / Skill Breakdown:** Visual comparison of mastery across all 12 concepts, highlighting strongest and weakest areas.
* **Badges Showcase:** Shelf of unlocked achievements (e.g., *First Blood*, *Streak 7*, *DP Master*).

---

## 5. Interaction Ergonomics & Accessibility (APG Compliance)

### 5.1 Keyboard Shortcuts Map
| Shortcut | Action | Scope |
|---|---|---|
| `Ctrl / ⌘ + Enter` | Run code against visible test cases | Editor |
| `Ctrl / ⌘ + Shift + Enter` | Submit code for official grading | Workspace |
| `Ctrl / ⌘ + K` | Open global search palette | Everywhere |
| `Ctrl / ⌘ + B` | Toggle left problem description pane | Workspace |
| `Escape` | Close active modal, drawer, or search palette | Global |
| `Alt + 1` to `Alt + 5` | Switch left pane tabs (Desc, Hints, Expl, Sol, Subs) | Workspace |

### 5.2 Accessibility & Usability Directives
* **Focus Rings:** Visible, high-contrast focus rings (`2px solid var(--accent-gold)`) with `2px` offset on all interactive buttons, tabs, links, and inputs.
* **Target Sizes:** Touch hit targets $\ge 44\text{px}$ on mobile/tablet and $\ge 28\text{px}$ on desktop.
* **Screen Reader Live Regions:** Test case results, compiler errors, and submission verdicts announce status politely via `aria-live="polite"`.
* **Motion Preferences:** All CSS animations and framer-motion transitions must honor `@media (prefers-reduced-motion: reduce)` by disabling transforms and utilizing instant opacity crossfades.
* **Color Blindness Guardrails:** Verdicts and badges must never rely on color alone. Red/Green verdicts must be paired with distinct glyphs (`✓ Accepted`, `✕ Wrong Answer`, `⚠ Compilation Error`).

---

## 6. Frontend Engineering & API Hand-Off Matrix

| UI Component | File Path | Current State | Target Backend API Integration |
|---|---|---|---|
| Problem Workspace | `frontend/src/app/(app)/problem/[id]/page.tsx` | Run button is mocked | Wire Run button to execute visible testcases; send complete telemetry payload (`time_on_task_seconds`, `attempt_count`, `hint_used`) on `problemsAPI.submit`. |
| AI Explanation Panel | `frontend/src/components/adapt/ExplanationPanel.tsx` | Renders static copy | Wire to poll `GET /api/explanation/{event_id}` with 1.5s interval until `status === 'completed'`. |
| Adaptive Learn Dispatcher | `frontend/src/app/learn/page.tsx` | Hardcodes `/problem/two-sum` | Wire to `GET /api/next-problem` and route dynamically to the returned problem slug. |
| Hints Panel | `frontend/src/components/adapt/HintsPanel.tsx` | Local state only | Keep local evaluation, but ensure revealed hint telemetry is dispatched in `POST /api/submit`. |
| Post-Solve Modal | `frontend/src/components/adapt/PostSolveModal.tsx` | **Missing** | Implement modal consuming `res.next_problem` and `res.mastery` from submission response. |
| Onboarding Survey | `frontend/src/app/onboarding/page.tsx` | **Missing** | Create baseline onboarding survey calling `POST /api/onboarding/complete`. |
| Activity Heatmap | `frontend/src/app/profile/[user]/page.tsx` | Random math simulation | Wire calendar blocks to real array from `GET /api/stats/heatmap`. |
| Leaderboard Page | `frontend/src/app/leaderboard/page.tsx` | **Missing** | Create leaderboard page consuming fixed `GET /api/leaderboard`. |
| Auth Page | `frontend/src/app/login/page.tsx` | Social buttons are mocked | Wire Google / GitHub OAuth to Supabase Auth provider flow. |

---

*Authored by Antigravity Senior Principal Software Architect for AdaptCode Engineering and Design Teams.*
