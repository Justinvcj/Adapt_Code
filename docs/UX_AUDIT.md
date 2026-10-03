# AdaptCode — UX Audit (brutal, read-only)

Reviewer: pretending to be the senior designer the client already hired.
Scope: every screen captured on `main` (commit `7618f24`), desktop (1440×900) + mobile (390×844). Nothing changed; this is a report.

---

## 0 · The one-paragraph verdict

AdaptCode has a strong *visual* identity — the glass nodes, the warm orange accent, the heatmap — and a strong *conceptual* idea (prerequisite-gated mastery, three-tier hints). What it lacks is a point of view about **what the user is supposed to do on each screen**. Every page shows a lot of data; almost none of them tell you where to look first. The product is one hero-moment away from feeling like a dashboard; it's one hero-moment away from feeling like a game. Right now it's neither. Mobile is actively broken in the workspace. The practice page (`/problems`) still ships with the LeetCode-genre skeleton from before the pivot and no longer belongs. Fixing six specific things flips the whole experience; everything else is polish.

---

## 1 · Information architecture

**IA-1. The sidebar is dead weight.** `Library / Quest / Explore / Study Plan / My Lists / Saved by me` still render on `/settings` (and anywhere `Sidebar` is mounted). None of those routes exist. It confuses what the product is. **Remove it; use a focused left rail only where it earns its place** (candidate: the problems-by-concept browser).

**IA-2. The nav is pre-pivot.** `Home · Mastery · Graph · Practice · Discuss`. Practice duplicates Mastery (which is also a problem browser) and Discuss is vaporware. The learning product has three real destinations: **Learn (dispatch)**, **Mastery (progress)**, **Graph (map)**. Bury Practice as a secondary tab inside Mastery; drop Discuss until it exists.

**IA-3. There is no single source of truth about the user's "next thing".** The home hero suggests `Learning: Backtracking` via a small chip; the `Learn` CTA next to it routes to a dispatcher that *also* chooses the next concept; the mastery grid shows twelve nodes with no visual recommendation. If the system knows which concept to focus on, it should **say it once, boldly**, not whisper it in three places.

**IA-4. "Rank" is noise.** `Rank #909,633` carries no meaning without context, and a learning platform shouldn't be ranking learners. Replace with something that teaches: **"you've unlocked 7 of 12 concepts"** or **"mastered Loops this month"**.

---

## 2 · Home page (`/`)

**H-1. The hero is unbalanced.** The avatar is 92px of empty teal to the left; the right side has only two buttons stacked. The vertical stretch of the avatar sets an expectation of information-density that the right column doesn't deliver. Options: (a) shrink the avatar to 64px and lean on it as metadata, (b) add a "mastery of the week" tile on the right so the hero reads as *information* not *decoration*.

**H-2. The four stats are a stat-bar, not a story.** `335 Solved · 50% Mastery · 10/12 Unlocked · 10 Day Streak` — four numbers side by side, same visual weight, no narrative. If **today** is the thing we care about, make today the hero: **"3 of 5 problems done today — 2 to hit your daily goal"**. The lifetime numbers are a secondary row.

**H-3. The mastery grid has no priority.** All twelve nodes look identical in style. Backtracking is at 21% and is where the system wants you — but it's cell 9 of 12, same visual weight as fully-mastered Basic Syntax (96%). Two cheap fixes: (a) **pulse the recommended node**, (b) **dim mastered nodes** so attention falls where the work is.

**H-4. Lock state reads as "broken".** Trees and Dynamic Programming nodes are grey with a tiny lock icon. They look like disabled form fields. A locked node should feel *promising* ("you're earning this"), not dead. Add a progress-toward-unlock hint: *"74% of the way to unlocking Trees"* with a thin ring showing prereq progress.

**H-5. Calendar + heatmap tell overlapping stories.** The month calendar and the 52-week heatmap both show "did you practice." The calendar is 7×5, the heatmap is 7×52. On mobile the heatmap overflows horizontally; on desktop they visually duplicate each other. Pick one: calendar for *this month's momentum*, heatmap for *the year*. Don't ship both.

**H-6. `View all →` link is tiny.** It's the only way to get from the home grid to the mastery catalogue. Make it a visible button or let the whole mastery panel header be clickable.

**H-7. The "Learning: Backtracking" chip and the "Learn" button don't visually connect.** They're both orange but they're in different sub-regions of the hero. Draw a line, or restructure: the chip should look like a *goal* and the button like the *action to pursue it*. Right now they look like two unrelated badges.

---

## 3 · Mastery catalogue (`/mastery`)

**M-1. Every icon chip is the same orange gradient.** Twelve concepts, twelve identical orange squares with different glyphs. The brand's warm accent becomes visual sludge when it's repeated at that density. Tint the icon chip by *mastery level* (green for mastered, orange for in-progress, grey for cold) — your Phase 1 glass nodes already do this; mirror the system here.

**M-2. The three tiny dots `●24 ●0 ●0`** are the difficulty breakdown but there's zero affordance saying so. Add micro-labels (`E24 · M0 · H0`) or convert into a stacked thin bar underneath the mastery bar.

**M-3. The overall mastery card** at top right shows `50% / UNLOCKED 10/12 / SOLVED 335`. The `50%` isn't labeled; a learner will read it as "50% unlocked" and be confused when the next number is 10/12. Add a line: `50% average mastery`.

**M-4. "Unlock after Recursion"** on Trees and DP uses a dashed-border pill that reads like a form input placeholder. Make it look like a *lock-breaking challenge* — e.g. *"Reach 50% in Recursion to unlock →"* with a progress indicator.

**M-5. No filtering, no sorting, no search.** The 12-item fixed list makes this feel like a map, which is correct. But a mastery page with no "sort by weakest" / "filter by difficulty" is less useful than it should be when the product grows. Low priority; worth a note.

---

## 4 · Concept graph (`/graph`)

**G-1. First-time-user hit a dead screen.** The page literally does nothing until you hover. Add a **default hovered node** (the user's current `Learning:` concept) so the sidecard is populated on load. Teaches the interaction without a tooltip.

**G-2. Arrow directionality is weak.** The arrowheads are faint grey triangles sitting on top of the node border. At rest you can barely tell which end is "prereq" and which is "unlocks". Thicken them or add a one-time directional label (`"prerequisite for →"`) along the top edge.

**G-3. Nodes don't reflect user state.** The icons use the same monochrome white glyph for mastered vs. partial vs. zero. The mastery rings fill correctly, but the inner icon doesn't change. A fully-mastered node should feel *earned* — color-shift it green, remove the ring (it's at 100%), add a tiny checkmark.

**G-4. No legend, no key.** Grey ring = locked. Orange arc = partial. Green arc = mastered. Blue arc = weak. Nobody knows that. Put a 20px legend strip in the top-right of the canvas.

**G-5. Empty horizontal space.** The 5-layer layout uses ~60% of the canvas width. Either narrow the container, or spread the nodes further apart so edges have room to breathe. Right now the Hashing–Two-Pointers–Backtracking–Binary-Search–Trees row is cramped.

**G-6. No zoom/pan, no fullscreen.** I promised these in the brief and didn't ship them. On a 13" laptop the lower nodes get labels truncated by the bottom.

**G-7. The sidecard appears on hover and disappears on hover-off.** On touch screens there is no hover. Mobile users can tap, but the sidecard then vanishes the moment they tap away. Make it a *click-to-pin* / *click-anywhere-else-to-close* interaction.

---

## 5 · Workspace (`/problem/[id]`)

**W-1. The problem description is a near-verbatim lift.** The Two Sum problem text ("You are given an array of integers `nums`…") is close enough to the industry-standard phrasing to invite trouble, and your repo is public. Rewrite in your voice — same spec, different sentences — and add a line of context the LeetCode version doesn't have: **"This problem teaches Hashing. Once you solve it, your Hashing mastery goes up."**

**W-2. The problem has no concept context.** No "learning: Hashing", no "this unlocks: Sliding Window". A learning-platform workspace that never names the concept is just a code editor. Add a pill under the title: `🔑 Hashing · learning` that links to the concept's mastery page.

**W-3. Fake social proof.** `69.7K likes · 2.1K comments · 1005 Online`. These numbers aren't real and the product doesn't have the social features behind them. Remove the whole footer bar until there's a reason to have one. Replace with something useful: *"Avg time on this problem: 14 min · Your attempts: 1"*.

**W-4. "Topics · Companies · Hint" chips at the top are decorative.** They look like filters, they don't do anything. On a learning page, that's a lie. Either make them *reveal* real tags/companies/hints, or remove.

**W-5. Problem-nav bar is a separate design from everything else.** The main nav disappears and a chrome-bar with Problem List / prev / next / shuffle takes over. Breaks consistency, loses the user's sense of place. Either keep the main nav visible, or make the problem-nav *look* like the main nav extended, not replaced.

**W-6. Submit is pre-emptively huge; Run is small.** For a learner you want them running first, submitting last. Invert the hierarchy: `Run` is the primary button, `Submit` is secondary, with a small chip showing *"X runs since your last submit"*.

**W-7. The "Solved" tag is permanent, even for a user who's never submitted.** It's hardcoded on the Two Sum page. Mortifying first impression — the product tells a new user they've solved something they haven't opened yet. Wire it to real state (or just remove until there is state).

**W-8. Testcase vs Test Result tabs are below the editor** at ~15% viewport height. On a 13" MacBook that's one or two lines visible. Collapsible, resizable panels — don't force a fixed split.

**W-9. Icon-only buttons in the top-right have no tooltips** (Format, Bookmark, Reset, Fullscreen in the editor; and the row of icons on the top chrome). Add `title=""` at minimum; ideally a shared Tooltip component.

**W-10. Monaco loads slowly and the fallback is just "Loading..."** centered in the void. Show a skeleton of the first few lines of starter code so the user knows something is coming.

**W-11. "Restored from local" footer text is cryptic.** What's local? What did it restore? Spell it out or remove it.

---

## 6 · Hints tab

**HN-1. The hint-availability card is correct but joyless.** `Attempt 1 · 0 compile errors · 7s` — nothing visual. Add a progress ring filling toward the unlock threshold. The learner wants to *see themselves approaching the hint*.

**HN-2. The "Reveal early" CTA sits on locked cards** but we don't actually track early-reveal state visually once the submission lands. If I reveal Nudge early, submit, and get it wrong, the penalty is applied silently. Show a chip on the submission's result: *"Nudge revealed early · ×0.9 mastery"*. (Also catches up with the planned explanation tab.)

**HN-3. No "ask Claude" / "paraphrase for me" escape hatch.** A tier-2 learner who's genuinely stuck doesn't want another level of hint, they want to talk through their approach. Even a stubbed button here hints at a future and gives a reason to come back.

**HN-4. The three tiers don't have differentiated color — all orange or green cards.** Tier the colors: Nudge = blue (gentle), Scaffold = orange (serious), Near-solution = red (expensive). Reinforces the cost gradient.

---

## 7 · Settings

**S-1. Two sidebars at once.** The generic `Sidebar` (Library / Quest / My Lists / Saved by me) renders *outside* the settings sub-nav. There's zero reason for it to be here. Delete the Sidebar mount from this route.

**S-2. The settings sub-nav uses icons that aren't thematically consistent.** `Account` is a person, `Learning` is a graduation cap, `Appearance` is a palette, `Notifications` is an envelope, `Privacy` is an eye-off. Fine individually, but the envelope for notifications collides with the actual Email row on the Account tab. Pick a bell for notifications.

**S-3. "Hint policy" chips need previews.** `Strict / Standard / Eager` are abstract. Add a line below each: *"Hints after attempt 2 · errors 3 · 300s"* for Standard, etc. Right now the user has to trust the words.

**S-4. "Default difficulty" has no context.** `Let AdaptCode choose / Easy / Medium / Hard`. If I pick Easy, does that mean *every* problem is easy, or that my adaptive baseline starts easy? Explain.

**S-5. Light theme is in the UI but doesn't do anything.** Either ship it, hide it, or label it `coming soon` next to the chip.

---

## 8 · Profile (`/profile/[user]`)

**P-1. Massive dead space to the right of the first row.** The solved-count card is ~900px wide and lives in the top-right of a 2-col layout; the right half of the viewport under it is empty. Fill it (recent badges, "most-improved concept", a weekly brief) or widen the sidebar.

**P-2. The donut is tiny (`186/4033` number inside a 160px ring)** with three skinny bars next to it. Blow it up or stack vertically; it's the first impression of someone's progress.

**P-3. Skills section is content-dense but joyless.** Advanced / Intermediate / Fundamental are good groupings; the chips (`Dynamic Programming ×6`) read like keywords in a resume, not accomplishments. Make them *earned stickers* — the chip itself gets a gold ring when ≥10 problems solved, a progress bar when fewer. Reward the user for breadth.

**P-4. Community Stats are all `0 · Last week 0`.** You can't afford to show empty-state community numbers to a new user. Hide the section until there's data, or replace with a "Share your profile" CTA that unlocks when they solve N problems.

**P-5. The 407-submission heatmap below the fold is beautiful.** Promote it. Stick it above the fold where the badges card currently empties the layout.

---

## 9 · Login (`/login`)

**L-1. The nav shows learning routes to a signed-out user.** `Home · Mastery · Graph · Practice · Discuss` all render even though those pages require state. Also `Search` + `Sign In` + `Get Started` all crammed together. For logged-out users show *only* the logo + a single `Sign up` button.

**L-2. The logo renders twice** — once in the nav, once as a 32px-size lockup above the login card. If the brand mark is in the nav, it doesn't need to be in the card. Pick one.

**L-3. The card is mid-page but there's a huge dead strip above and below it.** Center it properly, or add visual interest around it (an inspirational line about learning, an animated graph preview, something).

**L-4. "Remember me" and "Forgot password"** are both demo-only no-ops. For an unauthenticated page, these inert controls are more suspicious than useful. Wire them to a toast *"Password reset coming soon"* at minimum; ideally hide `Remember me` entirely (session cookies handle it).

**L-5. No way to switch to signup.** The tiny *"Sign up free"* link at the bottom is the only entry point. Add a tab-switch at the top: `Sign in | Create account`.

---

## 10 · Mobile pass (CRITICAL)

**MB-1. Workspace is broken.** On 390px wide, the two-pane split keeps the fixed 50% rule and the right half is `width: 50%; min-width: 320px;`. The viewport is only 390px wide, so the right pane *overflows* the body. The result: content occupies the left 55% of the viewport, the right 45% is black void, and the Monaco editor floats awkwardly. The `@media (max-width: 768px)` override exists in CSS but isn't firing, probably because `.prob-l` has an inline `style={{ width: '${leftW}%' }}` that outranks the media query. Needs an actual mobile breakpoint for the split that stacks top/bottom.

**MB-2. Nav links disappear below 600px with no replacement.** `.nav-links { display: none }`. There's no hamburger. User cannot navigate.

**MB-3. Heatmap overflows the viewport** on home mobile. 52 weeks × ~12px cell = 624px; viewport is 390px. The container has `overflow-x: auto` but on a touch device nobody expects to scroll a widget horizontally.

**MB-4. Hero on mobile wastes vertical space.** Avatar + name + handle + rank + learning + bio + 4 stats + Edit + Learn is ~500px tall before the user sees any mastery. Collapse rank+learning into one row; move stats under the stats row; shrink the avatar.

**MB-5. Edit profile modal:** haven't visually tested but with `max-width: 580px` and `padding: 20px 24px` it may overflow 390px.

**MB-6. Concept Graph is unusable on mobile.** 1100×620 SVG scaled to 390px wide → nodes are ~15px, labels unreadable. Needs a mobile-specific layout (vertical stack of layer-cards, each expandable) or a pan/zoom UX.

---

## 11 · Accessibility

**A-1. Icon-only buttons lack `aria-label`** throughout the workspace top chrome, settings sub-nav icons, calendar arrows, heatmap cells.

**A-2. Color-only state signaling** in the heatmap (five shades of green). Color-blind users can't distinguish lvl-3 and lvl-4 easily; combine with text on hover (already in — good — but keyboard users don't trigger hover).

**A-3. The glass nodes are buttons with `aria-label="…"`** (I did add that) but the mastery grid never announces *why* a node is locked. Add aria-live region on lock error.

**A-4. Focus rings** are visible on most elements but not on the mastery nodes. Add explicit `:focus-visible` outlines.

**A-5. `prefers-reduced-motion` is respected globally** (good) but the logo pulse animation and the hint reveal animation don't opt out. Guard them.

**A-6. No skip-to-content link.** Add one for keyboard users.

**A-7. Semantic headings jump around.** Home has `<h2>Your 12 concepts</h2>` with no `<h1>`. Mastery page uses `<h1>Mastery</h1>` correctly. Fix home: hero should contain an `<h1>` naming the page (e.g. "Welcome back, Justin").

---

## 12 · Interaction, feedback, copy

**I-1. Toasts are the only feedback mechanism.** Every click shouts `"Toast — demo"`. This isn't inherently bad but it reads as a prototype, not a product. Replace with inline state changes wherever possible.

**I-2. The `Learn` button fires a toast describing where you're going, then routes.** 400ms later you're on `/problem/two-sum` regardless of which concept the toast named. If the destination doesn't match the toast, the toast is a lie. Either: (a) remove the toast and show the dispatch destination in a sub-line on the button, or (b) actually route to a concept-aware URL and keep the toast honest.

**I-3. Nothing confirms a save.** The profile modal `Save` button toasts "Profile saved" (good) but Settings claims "Changes save automatically" with no micro-confirmation per interaction. A tiny checkmark that pulses next to the changed field would close the loop.

**I-4. Empty states barely exist.** A user with zero submissions sees the heatmap filled with mock data because the mock seed is deterministic. On first run the whole UI should feel *fresh* and inviting, not pre-populated by someone else's history.

**I-5. Copy audit.**
- "Built for learning, not grinding." (footer) — strong, keep.
- "Your 12 concepts" — fine but could be sharper: *"Where you are in the twelve"*.
- "Hover a square for details" (heatmap) — on touch devices, hover doesn't exist. Say "Tap/hover…".
- "Learning: Backtracking" — change to *"Up next: Backtracking"*. "Learning:" is a stat label, "Up next:" is a call to action.
- "Changes save automatically" — italic small grey is passive. Just show a `✓` after a change.

---

## 13 · Potential legal / IP

**X-1. Two Sum problem text.** The description, examples, and constraints block are a near-verbatim lift from a well-known public coding platform's phrasing. Even for a public-domain problem, publishing word-for-word has risk. Rewrite in original language.

**X-2. "AdaptCode" logo (`</>` glyph).** Original and fine. Keep.

**X-3. "Problems · Topics · Companies"** chips use language and layout very close to the reference platform. Fine for inspiration; concerning for lifting at scale. Design the information architecture *your way* in the next iteration.

---

## 14 · Priority list (what I would actually fix, in order)

1. **Mobile workspace split** — the single most broken thing. Users on phones can't code.
2. **Mobile nav replacement** — a hamburger drawer so phones aren't dead-ends.
3. **Delete the generic Sidebar from `/settings` and anywhere else it doesn't belong.**
4. **Hero: tell the user *what to do next* in one bold line.** Current: four stats + two buttons. Target: *"Up next · Backtracking · 2 of 5 today"* + one CTA.
5. **Make the mastery grid prioritize visually** — pulse the recommended node, dim mastered ones.
6. **Rewrite the Two Sum problem text in your own words** (IP + brand voice).
7. **Add the Explanation tab in the workspace** (post-submit teaching moment — the thing you already asked for).
8. **Add the first-run onboarding overlay** (3 steps, dismissible) so none of this is a mystery.
9. **Fix the logged-out nav on `/login`** — don't show learning routes to a stranger.
10. **Lock state copy + visual** — "earning this" not "broken".
11. **Hint tier colors + progress rings** on availability cards.
12. **Login page tabs (Sign in | Sign up).**
13. **Settings: delete the fake "connected GitHub" row until there's a real OAuth flow.**
14. **Accessibility pass** — aria-labels on icon buttons, skip-link, focus rings on glass nodes.
15. **Replace the fake 69.7K / 2.1K / 1005 Online** workspace social proof with real local metrics.

If I had one week with the client, items 1–8 would be it. Everything else is after that.

---

## 15 · What's genuinely great (so you don't blow it away)

- **The glass mastery nodes** are a signature. Keep the double-ring. Keep the gradient fills by mastery level. Protect this.
- **The concept graph** is the right primitive for a learning platform. The *idea* is correct even though the execution needs the fixes above.
- **The prerequisite-gated model** is the whole brand. Don't dilute it with "unlock everything for Pro users" temptation later.
- **The three-tier hint system with mastery multipliers.** Rare, defensible, and exactly the right teaching tool.
- **The warm orange + near-black palette.** Specific, memorable, not another indigo React app.
- **Space Grotesk + JetBrains Mono.** Right pair.

---

## 16 · One line

**You've designed a learning platform; now design the *first ten minutes* of using it.** That's the gap.
