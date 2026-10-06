# AdaptCode — Deployment Runbook

Target architecture (locked, see [CLAUDE.md](../CLAUDE.md)):

```
Vercel (Next.js frontend)
        │  HTTPS + httpOnly cookie
        ▼
Cloud Run (FastAPI backend + Tailscale sidecar, same image)
        │     ▲
        │     │  Supabase REST + Gemini (public internet)
        ▼     │
      AWS EC2 (Piston), reachable only over Tailscale (100.114.155.33:2000)
```

Everything in `backend/Dockerfile` + `backend/entrypoint.sh` is tuned for this layout.

---

## 0. Prerequisites

- Google Cloud project with billing enabled.
- `gcloud` CLI installed and authenticated: `gcloud auth login`.
- Set defaults:
  ```bash
  gcloud config set project <YOUR_PROJECT_ID>
  gcloud config set run/region asia-southeast1
  ```
- A Tailscale account with an **ephemeral, reusable auth key** for the backend node (dashboard → **Keys** → Generate auth key → check Ephemeral + Reusable + Pre-approved; copy as `tskey-auth-...`).
- Vercel account linked to the GitHub repo.

---

## 1. One-time Google Cloud setup

```bash
# Enable services
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com \
                       secretmanager.googleapis.com

# Create the Artifact Registry repo
gcloud artifacts repositories create adaptcode \
  --repository-format=docker --location=asia-southeast1

# Grant Cloud Build the roles it needs
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
CB_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
for role in run.admin iam.serviceAccountUser artifactregistry.writer secretmanager.secretAccessor; do
  gcloud projects add-iam-policy-binding $(gcloud config get-value project) \
    --member="serviceAccount:$CB_SA" --role="roles/$role"
done
```

## 2. Load secrets into Secret Manager (one time per secret)

```bash
echo -n "<value>" | gcloud secrets create SUPABASE_URL          --data-file=-
echo -n "<value>" | gcloud secrets create SUPABASE_KEY          --data-file=-
echo -n "<value>" | gcloud secrets create SUPABASE_SERVICE_KEY  --data-file=-
echo -n "<value>" | gcloud secrets create GEMINI_API_KEY        --data-file=-
echo -n "<value>" | gcloud secrets create TS_AUTHKEY            --data-file=-
```

Rotate later with: `echo -n "<new>" | gcloud secrets versions add <NAME> --data-file=-`

---

## 3. Deploy the backend

From the repo root:

```bash
gcloud builds submit --config=backend/cloudbuild.yaml \
  --substitutions=_FRONTEND_URL=https://<your-frontend>.vercel.app
```

What this does:
- Builds `backend/Dockerfile` (FastAPI + tailscaled userspace).
- Pushes to Artifact Registry.
- Deploys to Cloud Run with env vars + secret bindings from `cloudbuild.yaml`.
- Prints the service URL on success: `https://adaptcode-backend-<hash>-<region>.run.app`.

Note the service URL — the frontend needs it.

Verify:
```bash
curl https://adaptcode-backend-<hash>-<region>.run.app/health
```
Expected: `{"status":"ok","piston_reachable":true,"gemini_configured":true,"supabase_configured":true}`.

If `piston_reachable: false` → the Tailscale sidecar didn't connect. Check Cloud Run logs for `[boot] joining tailnet` and the status that follows. Most likely cause: `TS_AUTHKEY` is expired or non-ephemeral.

---

## 4. Deploy the frontend

In Vercel:
1. **Import** the GitHub repo.
2. **Framework preset:** Next.js. **Root directory:** `frontend`.
3. **Environment variables** (Production + Preview):
   - `NEXT_PUBLIC_API_URL` = the Cloud Run service URL from step 3 (no trailing slash).
4. Deploy.

Grab the Vercel URL (e.g. `https://adaptcode.vercel.app` and the per-deploy `https://adaptcode-git-main-<team>.vercel.app`).

### 4a. Wire the frontend URL back into the backend

Re-deploy the backend with `_FRONTEND_URL` set to the Vercel URL(s), comma-separated for multi-origin:

```bash
gcloud builds submit --config=backend/cloudbuild.yaml \
  --substitutions=_FRONTEND_URL=https://adaptcode.vercel.app
```

For Vercel preview deploys (ephemeral subdomains per PR), set an additional env var on the Cloud Run service:

```bash
gcloud run services update adaptcode-backend \
  --region=asia-southeast1 \
  --update-env-vars=FRONTEND_URL_REGEX='^https://adaptcode-[a-z0-9-]+-<team>\.vercel\.app$'
```

---

## 5. Supabase migrations

Already applied against the dev project this session. Verified with `backend/apply_migrations.py` which reads `SUPABASE_DB_URL` from env — the plaintext password that used to be in that file was removed and rotated.

To re-run against a fresh (prod) Supabase project:

```bash
cd backend
export SUPABASE_DB_URL='postgresql://postgres.<REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres'
python apply_migrations.py          # applies the default set
```

Also run the problem seeder:

```bash
cd backend
export SUPABASE_URL='https://<REF>.supabase.co'
export SUPABASE_SERVICE_KEY='eyJ...'
python scripts/seed_problems_from_db.py
```

---

## 6. Post-deploy smoke test

Register + login + submit from the deployed URL:

```bash
EMAIL="smoke.$(date +%s)@gmail.com"
API=https://adaptcode-backend-<hash>-<region>.run.app

curl -s -X POST $API/api/auth/register -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"SmokePass!2026\",\"display_name\":\"Smoke\"}"
curl -s -c /tmp/c.txt -X POST $API/api/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"SmokePass!2026\"}"
curl -s -b /tmp/c.txt -X POST $API/api/submit -H 'Content-Type: application/json' \
  -d '{"problem_id":"two-sum","code":"class Solution:\n    def twoSum(self, nums, target):\n        s={}\n        for i,n in enumerate(nums):\n            if target-n in s: return [s[target-n],i]\n            s[n]=i","language":"python","attempt_count":1}'
```

Expected submit response: `{"verdict":"accepted","test_cases_passed":3,"test_cases_total":3,...}` (hidden cases are stripped from the response but still run server-side).

---

## 7. Rotation + ops

- **Tailscale auth key** — ephemeral keys expire after 90 days by default. Rotate with `gcloud secrets versions add TS_AUTHKEY --data-file=-` and the next Cloud Run cold start picks it up. (Warm instances need a redeploy.)
- **Supabase DB password** — rotate via dashboard → **Database → Reset password**, then update `SUPABASE_DB_URL` locally and `SUPABASE_SERVICE_KEY` in Secret Manager if the JWT secret was also rotated.
- **Cloud Run logs** — `gcloud run services logs read adaptcode-backend --region=asia-southeast1 --limit=100`.
- **Rolling back** — Cloud Run keeps every revision: `gcloud run services update-traffic adaptcode-backend --to-revisions=<REV_NAME>=100 --region=asia-southeast1`.
