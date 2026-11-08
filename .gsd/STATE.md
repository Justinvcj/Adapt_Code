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

## Needs user approval

1. **Delete dead files** (auto-mode blocked bulk delete). Each is verified unreferenced by application code:
   - `backend/simulator.py` — **CONTAINS LEAKED SUPABASE DB PASSWORD at line 57** (already in public GitHub history; see §Credentials below)
   - `backend/pretrain.py`
   - `backend/test_workflow.py`
   - `backend/research/` (directory; already in `.gcloudignore`)
   - `docker-compose.prod.yml` (superseded by Cloud Run deploy)
   - `.gsd/fixes/` (one-shot migration artifacts from the 10-module remediation phase)
   - `.gsd/generate_fixes.py`
   - `.agents/` (old teamwork audit artifacts)
   - `ADAPTCODE_ANALYSIS.md` (the dossier — its facts are captured in `.gsd/PLAN.md`)
   - `.github/workflows/deploy.yml` (redundant with `ci.yml`; both backend jobs gated off)

2. **Credentials rotation (manual, urgent):** `backend/simulator.py:57` contains a plaintext Supabase Postgres password that has been in the public repo. The password must be rotated in the Supabase dashboard regardless of whether the file is deleted — deletion only removes it from `HEAD`, not from git history.

## Known issues flagged for Phase C

- `TEST_MODE` auth bypass (`security/SECURITY_ISSUES.md` C1) — must disable before prod.
- `/api/checkout/mock-upgrade` — `require_admin` gating looks wrong (should be per-user for self-upgrade or removed entirely for prod).

## Open questions (from PLAN.md §5 — answered)

- Delete unreferenced files: **yes** (pending the auto-mode re-approval above).
- Install Playwright in Phase E: **yes**.
- Order: **Phase B first (wire against localhost), then deploy**.
- Problem counts: **use real numbers** → 518 in JSON, 442 seeded.
