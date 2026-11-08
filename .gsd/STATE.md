# Session State

**Updated:** 2026-11-08
**Current phase:** Phase B — frontend wiring (7 of 8 steps complete; B6 OAuth deferred to Phase C).
**Resumable plan:** [.gsd/PLAN.md](PLAN.md) — if a credit window closes, read that first.

## This session's work

### Phase A — audit, cleanup, docs sync (done)
- ✅ Full repo audit vs pasted dossier — findings in `.gsd/PLAN.md` §0.
- ✅ Verified ground-truth numbers: 518 problems in JSON, 442 seeded by `seed_problems_from_db.py`, 3,339 test cases across usable problems.
- ✅ Verified Gemini model is `gemini-2.5-flash` (dossier's "3.5" was wrong).
- ✅ Wrote [docs/API.md](../docs/API.md) — complete backend route reference.
- ✅ Rewrote [README.md](../README.md) to match reality.
- ✅ Fixed `/api/leaderboard` NameError (undefined `user.jwt`).
- ✅ Deleted 9 dead paths (see "Cleanup completed" below).

### Phase C — backend parity + bug sweep (in progress)
- ✅ Added `POST /api/auth/supabase-callback` — verifies Supabase JWT, upserts users row, mints `adaptcode_session` cookie.
- ✅ Frontend `/auth/callback` page completes the OAuth round-trip.
- ✅ Google button on `/login` now calls real `signInWithOAuth`.
- ✅ `/api/checkout/mock-upgrade` — gate switched from `require_admin` to signed-in user, refused in prod/staging.
- ✅ Streak compute uses `datetime.now(timezone.utc)` (removes deprecation warning + makes UTC explicit).
- ✅ Dropped stale `TEST_MODE=false` from `.env.example`; added missing `SUPABASE_SERVICE_KEY`, `PISTON_URL`, `ENV`.
- ✅ Verified C1 (TEST_MODE auth bypass) is already fixed in `dependencies.py` — only the stale env-example line remained.
- ⏸ C3 (RLS gap: users can self-promote to admin) — needs a migration; queued for later in Phase C.

### Phase B — frontend wiring (7 / 8)
- ✅ B1 /learn — live mastery + `/api/next-problem`, offline fallback.
- ✅ B2 Homepage — `useLiveMastery` + `useLiveStats` replace `MOCK_MASTERY`.
- ✅ B3 Problem page — `/api/start` on mount, `/api/abandon` on unmount.
- ✅ B4 ExplanationPanel — polls `/api/explanation/{event_id}` every 1.2s, renders Gemini output when ready.
- ✅ B7 Accept toast carries real `mastery_delta` points.
- ✅ B8 /onboarding page — new, calls `/api/onboarding/complete`.
- ✅ New `src/lib/live-data.ts` hooks; `src/lib/supabase.ts` browser client (for Phase C OAuth).
- ⏸ B5 Profile heatmap wiring — profile page has inline heatmap generation; defer to Phase F polish.
- ⏸ B6 Google OAuth — frontend half ready (`src/lib/supabase.ts`), but needs backend endpoint to exchange Supabase JWT → `adaptcode_session` cookie. Moved to Phase C.

## 🚨 Open action items for the user

1. **Rotate Supabase Postgres password NOW.** The old password was committed to `backend/simulator.py` and is in the public GitHub history (`beb0d01` and earlier). Deleting the file in `HEAD` does not remove it from history. Rotate via Supabase dashboard → Database → Reset password; then update `SUPABASE_DB_URL` locally wherever it's used (not committed anywhere now). This must happen regardless of anything else.
2. If you also want the password scrubbed from history (not just rotated), that requires `git filter-repo` + force-push — ask before doing that.

## Cleanup completed this session

Deleted:
- `backend/simulator.py` (leaked creds + dead), `backend/pretrain.py`, `backend/test_workflow.py`
- `backend/research/` (perf CSV + second simulator; was already in `.gcloudignore`)
- `docker-compose.prod.yml` (superseded by Cloud Run)
- `.gsd/fixes/` + `.gsd/generate_fixes.py` (10-module remediation artifacts)
- `.github/workflows/deploy.yml` (redundant with `ci.yml`)
- `ADAPTCODE_ANALYSIS.md` (dossier captured in `.gsd/PLAN.md`)

Kept:
- `.agents/teamwork/` (old audit notes; user wanted to preserve as reference)
- `frontend/src/data/problems.ts` (actively imported as offline fallback)
- `security/SECURITY_ISSUES.md` (describes real unpatched issues; tracked for Phase C)

## Known issues flagged for Phase C

- `TEST_MODE` auth bypass (`security/SECURITY_ISSUES.md` C1) — must disable before prod.
- `/api/checkout/mock-upgrade` — `require_admin` gating looks wrong (should be per-user for self-upgrade or removed entirely for prod).

## Open questions (from PLAN.md §5 — answered)

- Delete unreferenced files: **yes** (pending the auto-mode re-approval above).
- Install Playwright in Phase E: **yes**.
- Order: **Phase B first (wire against localhost), then deploy**.
- Problem counts: **use real numbers** → 518 in JSON, 442 seeded.
