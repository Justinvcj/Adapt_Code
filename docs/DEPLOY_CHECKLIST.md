# Deploy Checklist

> Tickable list of **manual steps only you can do** — Claude cannot run gcloud,
> can't touch Vercel settings, can't paste secrets into cloud dashboards.
> Full command-by-command detail: [DEPLOY.md](DEPLOY.md). This file is the
> short version you walk down the day of deploy.

Status key: `[ ]` not done · `[x]` done · `[!]` blocked · `[-]` skipped

---

## Pre-flight

- [ ] **Rotate Supabase DB password** done in dashboard (Database → Reset password). This replaces the one leaked in git history on the old `backend/simulator.py`.
- [ ] `backend/.env` updated locally with the new password (only if anything reads `SUPABASE_DB_URL`, e.g. `apply_migrations.py`).
- [ ] `SUPABASE_URL`, `SUPABASE_KEY` (anon), `SUPABASE_SERVICE_KEY` are current in `backend/.env`.
- [ ] `GEMINI_API_KEY` in `backend/.env`.
- [ ] `backend` tests you care about pass locally: `cd backend && pytest tests/` (CI job stays gated off until the suite is rehabilitated — see [CLAUDE.md](../CLAUDE.md)).
- [ ] `cd frontend && npx tsc --noEmit` is clean.
- [ ] `cd frontend && npm run build` succeeds.

## Supabase one-time setup

- [ ] Run migrations against the **dev** project — never prod — with the rotated password:
      ```bash
      cd backend
      export SUPABASE_DB_URL='postgresql://postgres.<REF>:<NEW_PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres'
      python apply_migrations.py
      ```
- [ ] Problem seeder run once:
      ```bash
      cd backend
      export SUPABASE_URL='https://<REF>.supabase.co'
      export SUPABASE_SERVICE_KEY='<service_role>'
      python scripts/seed_problems_from_db.py       # ~442 rows
      ```
- [ ] **Google OAuth** (needed for the Google button to work):
  - Google Cloud Console → APIs & Services → Credentials → create OAuth client ID (web).
  - Authorized redirect URI: `https://<REF>.supabase.co/auth/v1/callback`.
  - Copy client ID + secret.
  - Supabase dashboard → Authentication → Providers → Google → enable, paste both.
  - Supabase dashboard → Authentication → URL Configuration → add to Redirect URLs:
    - `http://localhost:3000/auth/callback`
    - `https://<your-vercel-domain>.vercel.app/auth/callback`
    - (any preview-branch hosts you expect to test on).

## Google Cloud one-time setup

- [ ] `gcloud auth login` completed on this machine.
- [ ] Project selected + region pinned:
      ```bash
      gcloud config set project <PROJECT_ID>
      gcloud config set run/region asia-southeast1
      ```
- [ ] Services enabled: `run`, `cloudbuild`, `artifactregistry`, `secretmanager` (see [DEPLOY.md §1](DEPLOY.md)).
- [ ] Artifact Registry repo `adaptcode` exists in `asia-southeast1`.
- [ ] Cloud Build service account has roles: `run.admin`, `iam.serviceAccountUser`, `artifactregistry.writer`, `secretmanager.secretAccessor`.

## Tailscale

- [ ] Ephemeral + reusable + pre-approved auth key generated in Tailscale admin (`tskey-auth-...`). Expires every 90 days — put a calendar reminder.
- [ ] AWS EC2 Piston node is running, Tailscale IP `100.114.155.33:2000` responds from another tailnet member: `curl http://100.114.155.33:2000/api/v2/runtimes`.

## GCP Secret Manager

Each `gcloud secrets create <NAME>` once; later rotations use `gcloud secrets versions add <NAME>`.

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_KEY` (anon)
- [ ] `SUPABASE_SERVICE_KEY` (service_role)
- [ ] `GEMINI_API_KEY`
- [ ] `TS_AUTHKEY` (the Tailscale ephemeral key from above)

## Deploy backend to Cloud Run

- [ ] `_FRONTEND_URL` known (Vercel URL; use `https://adaptcode.vercel.app` or your actual one).
- [ ] From repo root:
      ```bash
      gcloud builds submit --config=backend/cloudbuild.yaml \
        --substitutions=_FRONTEND_URL=https://<your-vercel>.vercel.app
      ```
- [ ] Deploy printed a service URL: `https://adaptcode-backend-<hash>-<region>.run.app`.
- [ ] `curl <CLOUD_RUN_URL>/health` returns `{"status":"ok","piston_reachable":true,"gemini_configured":true,"supabase_configured":true}`.
      If `piston_reachable: false` → Tailscale sidecar didn't connect. Check Cloud Run logs for `[boot] joining tailnet`; most likely cause is an expired `TS_AUTHKEY`.

## Deploy frontend to Vercel

- [ ] Vercel project pointing at `frontend/` root.
- [ ] Environment variables set (Production + Preview):
  - [ ] `NEXT_PUBLIC_API_URL` = Cloud Run URL (no trailing slash)
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` = `https://<REF>.supabase.co`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key (safe to ship to the browser)
- [ ] Vercel production deploy green.
- [ ] Note the Vercel URL(s).

## Wire it back together

- [ ] Re-deploy backend with the real Vercel URL in `_FRONTEND_URL`:
      ```bash
      gcloud builds submit --config=backend/cloudbuild.yaml \
        --substitutions=_FRONTEND_URL=https://<real-vercel>.vercel.app
      ```
- [ ] For Vercel preview subdomains, also set `FRONTEND_URL_REGEX` on the Cloud Run service (see [DEPLOY.md §4a](DEPLOY.md)).

## Smoke test (from the deployed URLs)

- [ ] Register → login → submit two-sum flow succeeds. One-liner in [DEPLOY.md §6](DEPLOY.md).
- [ ] Click Google button → sign in → lands back on `/` with the Avatar name set to the Google full name.
- [ ] Submit a wrong answer → ExplanationPanel flips from static copy to the 3-part Gemini explanation within ~15 s.
- [ ] Homepage shows real streak + solved count after one accepted submission.

## Hand-offs for post-deploy

- [ ] Add `/terms` + `/privacy` placeholder pages (Phase F) — Google OAuth app review requires them for production verification.
- [ ] Open issue for C3 RLS gap (users can `UPDATE role='admin'`) — tracked in Phase F.
- [ ] (Optional) Re-enable backend CI (`.github/workflows/ci.yml` flip `if: ${{ false }}` → `true`) once the pytest import debt is paid down.
