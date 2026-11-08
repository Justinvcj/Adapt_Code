# AdaptCode — Completion Plan (Resumable)

> Living document. If a credit window closes mid-execution, the next session
> starts by reading this file + `.gsd/STATE.md` and resumes at the first
> unchecked item. Update checkboxes + "Last touched" as work lands.

**Last touched:** 2026-11-08 — plan drafted, awaiting user approval.
**Current phase:** PLAN APPROVAL (no execution yet).

---

## 0. Ground truth (verified this session, not from dossier)

Verified by reading files, not trusting the pasted dossier:

| Claim | Status |
|---|---|
| Repo on branch `main`, last commit `2a0579c` Cloud Run scaffolding | ✅ verified |
| Backend routers exist: auth, problems, mastery, session, stats, history, admin, leaderboard, potd, checkout | ✅ verified (`backend/app/routers/`) |
| Backend endpoints `/api/mastery`, `/api/stats`, `/api/stats/heatmap`, `/api/next-problem`, `/api/start`, `/api/abandon`, `/api/onboarding/complete` **all exist** | ✅ verified |
| Frontend `api.ts` has typed clients for authAPI, problemsAPI, masteryAPI, statsAPI | ✅ verified |
| `frontend/src/app/learn/page.tsx` hardcodes `/problem/two-sum` | ✅ verified (line 34) |
| `frontend/src/app/page.tsx` reads `MOCK_MASTERY` static data, not API | ✅ verified |
| Dockerfile + entrypoint.sh + cloudbuild.yaml present for Cloud Run + Tailscale sidecar | ✅ verified |
| Health endpoint probes Piston reachability | ✅ verified (`main.py:92-107`) |
| Backend CI gated off (`if: ${{ false }}` in `.github/workflows/ci.yml`) | ✅ verified |
| Gemini version: `.gsd/ARCHITECTURE.md` says **2.5 Flash**, dossier says "3.5 Flash" | ⚠️ dossier wrong — code is source of truth, needs verification against `gemini.py` |
| Problem count: dossier claims 518 curated / 473 seeded / 2,240 test cases | ⚠️ **not verified** — need to count rows in `problems_db/final_problems_db.json` and confirm against seed script |
| "Mastery, stats, next-problem, start/abandon NOT yet wired" (CLAUDE.md) | ⚠️ endpoints exist on backend; **frontend wiring is the gap**, not backend |

**Hallucination risks flagged (do NOT propagate):**
- Gemini "3.5 Flash" — Google has no such model; fix all docs to actual version used.
- Problem counts (518/473/2240) — recount before quoting.
- CLAUDE.md phrasing "NOT yet wired" is ambiguous; the backend has these endpoints — only the frontend reads from mocks.

---

## 1. Scope (what "done" means)

A deployed, working AdaptCode where a real user can:
1. Register + login (Google OAuth or email/password) on the production Vercel URL.
2. Land on a homepage showing **their own** mastery, streak, solved count — not `MOCK_MASTERY`.
3. Click "Start learning" / "Resume" and get routed to a problem chosen by `/api/next-problem`, not hardcoded two-sum.
4. Solve problems in Monaco; submission runs on Piston via Tailscale; BKT updates; mastery delta renders.
5. On failure, see Gemini explanation polled from `/api/explanation/{event_id}`.
6. See submission history + heatmap populated from real `session_events`.

Plus: README/docs reflect reality; dead code purged; zero commits that break deploy.

---

## 2. Execution phases

Each item is a checklist. Mark `[x]` when the file has shipped, tests pass, and (if deployable) it's pushed to `origin/main` per the auto-push memory rule.

### PHASE A — Audit, cleanup, zero-hallucination pass
- [ ] A1. Read every router end-to-end; list actual endpoints in a new `docs/API.md` (ground truth for frontend wiring).
- [ ] A2. Count problems in `problems_db/final_problems_db.json`; count test cases; verify seed script actually wrote N rows (or document that we can't verify without Supabase access).
- [ ] A3. Grep for Gemini model string in `backend/app/services/gemini.py`; correct all docs that disagree.
- [ ] A4. Dead code pass:
  - `docker-compose.prod.yml` vs `docker-compose.yml` — are both used? If prod is dead, delete.
  - `backend/research/`, `backend/simulator.py`, `backend/pretrain.py`, `backend/test_workflow.py` — used anywhere? If not, delete.
  - `.gsd/fixes/`, `.gsd/generate_fixes.py` — are these artifacts of a one-shot migration? Delete if yes.
  - `frontend/src/data/problems.ts` — static 10-problem stub; once `/api/problems` is live everywhere, delete.
  - Stale `ADAPTCODE_ANALYSIS.md` at repo root (dossier) — move to `.gsd/` or delete after extracting facts.
- [ ] A5. Re-sync `README.md` with reality: correct install steps, correct Piston note (it's remote over Tailscale, not local Docker), correct env matrix, correct test state.
- [ ] A6. Update `.gsd/STATE.md` with current phase and this plan's checkpoint.

### PHASE B — Frontend wiring (the real work)
Replace mocks with real API calls, keep offline fallback (CLAUDE.md requires `API 5xx → mocks, never crash`).
- [ ] B1. `/learn` dispatcher: call `masteryAPI.list()` → pick weakest unlocked concept → call `problemsAPI.next()` → `router.replace('/problem/' + id)`. Fallback to current mock behavior if `ApiOffline`.
- [ ] B2. Homepage `frontend/src/app/page.tsx`: fetch `masteryAPI.list()` + `statsAPI.summary()`; swap `MOCK_MASTERY`, hardcoded streak, hardcoded solved count. Skeleton states while loading.
- [ ] B3. Problem page `(app)/problem/[id]/page.tsx`: confirm submit path, wire `problemsAPI.start()` on mount, `abandon()` on unmount if not submitted.
- [ ] B4. ExplanationPanel: poll `GET /api/explanation/{event_id}` on wrong-answer verdicts; render markdown.
- [ ] B5. Profile heatmap: call `statsAPI.heatmap()` instead of synthetic data.
- [ ] B6. Login page: add Google OAuth button (Supabase client, redirects back to our domain); keep email/password path.
- [ ] B7. PostSolveModal: show mastery_delta from submit response; CTA → `/learn` for next problem.
- [ ] B8. Onboarding: `/onboarding` page calling `POST /api/onboarding/complete`.

### PHASE C — Backend parity & bug sweep
- [ ] C1. `/api/next-problem` — read the handler; confirm it returns a slug compatible with frontend routing (`/problem/{slug}` must resolve).
- [ ] C2. Submission Gemini background task — verify it writes to `explanations` table and `/api/explanation/{event_id}` can retrieve it.
- [ ] C3. Streak computation in `stats.py` — sanity check timezone handling.
- [ ] C4. CORS: confirm `FRONTEND_URL` + `FRONTEND_URL_REGEX` cover preview deploys.
- [ ] C5. Rate limits: audit `setup_rate_limiting` — are auth endpoints protected?

### PHASE D — Deploy
Manual steps for the user listed in `docs/DEPLOY.md`. Claude cannot execute these (needs gcloud auth + Tailscale key + Vercel access).
- [ ] D1. **User step:** gcloud project selected, APIs enabled, Artifact Registry created.
- [ ] D2. **User step:** Load secrets into GCP Secret Manager (SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, TS_AUTHKEY).
- [ ] D3. **User step:** `gcloud builds submit --config=backend/cloudbuild.yaml`.
- [ ] D4. **User step:** Verify `/health` returns `piston_reachable: true`.
- [ ] D5. **User step:** Vercel: set `NEXT_PUBLIC_API_URL` → Cloud Run URL; deploy.
- [ ] D6. **User step:** Re-deploy backend with `_FRONTEND_URL=<vercel-url>` for CORS.
- [ ] D7. **User step:** Supabase auth redirect allowlist updated for Vercel domain.
- [ ] D8. Claude will produce a tight step-by-step "run these commands" checklist on the day of deploy.

### PHASE E — Verification
- [ ] E1. Smoke test from `docs/DEPLOY.md` section 6 (register → login → submit two-sum) succeeds.
- [ ] E2. Playwright e2e against production (new): register, submit, see mastery delta. (Install Playwright MCP if needed.)
- [ ] E3. Frontend build in CI stays green.
- [ ] E4. Re-enable backend CI (`if: ${{ true }}`) once test suite imports are fixed.

### PHASE F — Polish
- [ ] F1. Static `/terms` + `/privacy` pages (Supabase Google OAuth app review needs them).
- [ ] F2. Mobile responsiveness pass on hero, mastery, problem page.
- [ ] F3. 404 page.
- [ ] F4. Final README pass + architecture diagram.

---

## 3. Resumability protocol

Every working session:
1. Read `.gsd/PLAN.md` (this file) + `.gsd/STATE.md`.
2. Find first unchecked `[ ]` in Phase order (A → B → C → D → E → F).
3. Do it. Check it off. Update "Last touched".
4. Commit + push every change (per auto-push memory rule).

If a change is blocking on a user-only action (e.g., D1-D7), mark it with **"⏸ waiting on user"** and move to the next independent item.

---

## 4. Guardrails (from CLAUDE.md + memory)

- Branch policy: work on `main`. No feature branches unless user explicitly asks.
- Commit prefix: `feat(scope):`, `fix(scope):`, `docs:`, `chore:`.
- Attribution footer: `Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>`.
- Push to `origin/main` after every change without asking.
- Never commit secrets. Never re-enable backend CI without user say-so (deferred to E4 with user consent).
- Never run migrations against prod Supabase.
- Stack is locked: Vercel + Cloud Run + AWS EC2 Piston over Tailscale + Supabase + Gemini + BKT/LinUCB. No alternatives proposed.
- Offline fallback must keep working: unset `NEXT_PUBLIC_API_URL` or 5xx → UI renders with mocks.

---

## 5. Open questions for user (ask before executing)

1. **Dead code deletion** — am I authorized to delete `simulator.py`, `pretrain.py`, `research/`, `.gsd/fixes/`, `docker-compose.prod.yml` if I can prove they're unreferenced? (Default assumption: yes.)
2. **Playwright e2e** — install Playwright as a dev dep in frontend for E2E tests? It's heavy but worth it for the verification you asked about.
3. **Backend deploy timing** — do Phase B (frontend wiring) first against local backend, then deploy? Or deploy backend first so frontend can wire against the real URL? (Default: B first, then D.)
4. **Problem count claims** — if the actual seeded count differs from dossier's 473, update docs to the real number without asking again?
