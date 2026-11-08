# Session State

**Updated:** 2026-11-08
**Current phase:** Phase A — audit, cleanup, docs sync (in progress).
**Resumable plan:** [.gsd/PLAN.md](PLAN.md) — if a credit window closes, read that first.

## This session's work

- ✅ Full repo audit vs pasted dossier — findings in `.gsd/PLAN.md` §0.
- ✅ Verified ground-truth numbers: 518 problems in JSON, 442 seeded by `seed_problems_from_db.py`, 3,339 test cases across usable problems.
- ✅ Verified Gemini model is `gemini-2.5-flash` (dossier's "3.5" was wrong).
- ✅ Wrote [docs/API.md](../docs/API.md) — complete backend route reference.
- ✅ Rewrote [README.md](../README.md) to match reality.
- ✅ Fixed `/api/leaderboard` NameError (undefined `user.jwt`) in `backend/app/routers/leaderboard.py`.
- ⏸ Dead-file cleanup (see "Needs user approval" below).
- ⏸ Phase B (frontend wiring) — not started.

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
