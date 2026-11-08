# Explorer Survey 2 Handoff Report: Git Comparison (R2) & Cloud Backend Deployment Investigation (R3)

**Author:** Git and Cloud Deployment Explorer (Explorer Survey 2)  
**Date:** 2026-11-08  
**Working Directory:** `c:\Users\Justin\The Global Projects Folder\Adapt_Code\.agents\teamwork\teamwork_explorer_survey_2\`  
**Target Recipient:** Project Orchestrator (`03c7139e-8671-4704-8cf9-a7247efd28d4`)

---

## 1. Observation

### 1.1 Git Status, Remotes, Tracking, and Working Tree (Requirement R2)

1. **Remote Repository Configuration:**
   - Command: `git remote -v`
     ```text
     origin  https://github.com/Justinvcj/Adapt_Code.git (fetch)
     origin  https://github.com/Justinvcj/Adapt_Code.git (push)
     ```
   - Command: `git config -l`
     - `remote.origin.url=https://github.com/Justinvcj/Adapt_Code.git`
     - `branch.main.remote=origin`
     - `branch.main.merge=refs/heads/main`
     - `user.name=Justinvcj`
     - `user.email=23cs037@drngpit.ac.in`

2. **Branch Tracking and Commit Head Alignment:**
   - Command: `git branch -a -vv`
     - Local branch: `* main 2a0579c [origin/main] feat(deploy): Cloud Run + Tailscale sidecar deploy scaffolding`
     - Tracking status: Local branch `main` tracks `origin/main`.
     - Remote branches discovered on `origin` via `git fetch origin`:
       * `remotes/origin/HEAD -> origin/main`
       * `remotes/origin/main` (`2a0579c`)
       * `remotes/origin/claude/gracious-mendel-6kkd52` (`38a40a2`)
       * Dependabot branches (20 branches):
         - `origin/dependabot/npm_and_yarn/frontend/eslint-config-next-16.3.1` (`051f4d3`)
         - `origin/dependabot/npm_and_yarn/frontend/lucide-react-1.55.0`
         - `origin/dependabot/npm_and_yarn/frontend/next-16.3.1` (`876b7e5`)
         - `origin/dependabot/npm_and_yarn/frontend/postcss-8.5.26` (`8b50f69`)
         - `origin/dependabot/npm_and_yarn/frontend/postcss-8.5.29`
         - `origin/dependabot/npm_and_yarn/frontend/tailwindcss-4.3.3` (`0550f4e`)
         - `origin/dependabot/npm_and_yarn/frontend/testing-library/react-16.3.3`
         - `origin/dependabot/npm_and_yarn/frontend/testing-library/user-event-14.6.5` (`9f2fa9f`)
         - `origin/dependabot/npm_and_yarn/frontend/types/node-26.6.5`
         - `origin/dependabot/npm_and_yarn/frontend/typescript-7.0.2`
         - `origin/dependabot/pip/backend/email-validator-2.3.0` (`701339b`)
         - `origin/dependabot/pip/backend/fastapi-0.141.1` (`b93c7ce`)
         - `origin/dependabot/pip/backend/fastapi-0.143.0`
         - `origin/dependabot/pip/backend/numpy-2.5.2` (`f378be8`)
         - `origin/dependabot/pip/backend/proto-plus-1.29.0`
         - `origin/dependabot/pip/backend/pydantic-2.13.4` (`da63981`)
         - `origin/dependabot/pip/backend/pyparsing-3.3.3`
         - `origin/dependabot/pip/backend/slowapi-0.1.10` (`36aaf08`)
         - `origin/dependabot/pip/backend/starlette-1.7.0`
         - `origin/dependabot/pip/backend/uvicorn-0.54.0`
   - Command: `git rev-parse HEAD` -> `2a0579c37c6461fa4e324197666312411b913e4e`
   - Command: `git rev-parse origin/main` -> `2a0579c37c6461fa4e324197666312411b913e4e`
   - Divergence: Commits ahead = 0, Commits behind = 0. Local `main` is completely in sync commit-wise with `origin/main`.
   - Branch `claude/gracious-mendel-6kkd52` divergence: `git rev-list --left-right --count origin/main...origin/claude/gracious-mendel-6kkd52` returns `61 0` (local `main` is 61 commits ahead, 0 behind; it is an ancestor branch).

3. **Local Working Tree Uncommitted Changes:**
   - Command: `git status`
     - Modified files (not staged):
       * `.gsd/STATE.md`
     - Untracked files/directories:
       * `.agents/teamwork/` (Agent metadata directory)
       * `.gsd/ARCHITECTURE.md`
       * `.gsd/STACK.md`
       * `docs/UI_UX_SPECIFICATION.md`
     - Added/Staged files: None (`no changes added to commit`)
     - Deleted files: None
     - Stash entries: `git stash list` returned 0 entries.
   - Command: `git diff .gsd/STATE.md`
     ```diff
     --- a/.gsd/STATE.md
     +++ b/.gsd/STATE.md
     @@ -1,13 +1,18 @@
     -# Session State: Sept 30, 2026
     +# Session State: Architectural Audit & UI/UX Master Specification
      
     -## Accomplished Today
     -1. Dropped in the complete `adapt-code-design-ui` Next.js frontend.
     -2. Created a pristine local backup in `ui_duplicate/` (gitignored).
     -3. Re-wired the `login` page to handle Supabase Google Auth gracefully. Added a "UI Test Mode" bypass so the frontend can be tested without crashing when backend env vars aren't loaded.
     -4. Refined the navigation bar to reflect AdaptCode core features (`Problems`, `Playground`, `Learning Path`, `Analytics`).
     -5. Committed and pushed all working changes to `main` on GitHub.
     +## Current Phase: Complete Architectural Breakdown & UI/UX Master Blueprint
     +- **Date:** 2026-11-03
     +- **Status:** Comprehensive repository audit completed. Master UI/UX Specification created and saved to `docs/UI_UX_SPECIFICATION.md`.
     +- **Key Artifacts Generated:**
     +  - `docs/UI_UX_SPECIFICATION.md` (Master UI/UX Design & Architecture Specification)
     +  - `.gsd/STACK.md` (Ground truth technology inventory)
     +  - `.gsd/ARCHITECTURE.md` (System topological map)
      
     -## Next Steps for Tomorrow
     -- Review the rest of the UI pages in `adapt-code-design-ui`.
     -- Begin wiring the UI to the FastAPI backend and Supabase database.
     -- Move away from "UI Test Mode" and enforce actual authentication routes.
     +## Core UI/UX Remediation Tasks Outlined for Frontend Team:
     +1. Wire editor "Run" button to actual Piston testcase runner instead of mock setTimeout.
     +2. Connect `ExplanationPanel.tsx` to poll `GET /api/explanation/{event_id}` for real Gemini diagnostics.
     +3. Replace hardcoded `/problem/two-sum` in `/learn` with dynamic `GET /api/next-problem` routing.
     +4. Implement `PostSolveModal.tsx` to display mastery delta and next problem handoff after Accepted verdicts.
     +5. Implement `/onboarding` survey calling `POST /api/onboarding/complete`.
     +6. Connect profile heatmap to `GET /api/stats/heatmap`.
     +7. Wire OAuth providers on `/login`.
     ```
   - Command: `git status --ignored`
     Ignored files in local environment:
     * `.claude/settings.local.json`
     * `backend/.env`
     * `backend/.pytest_cache/`
     * `backend/.venv/`
     * `backend/app/__pycache__/` (and subpackages: `core`, `models`, `routers`, `services`)
     * `backend/tests/__pycache__/`
     * `backend/venv/`
     * `frontend/.env.local`
     * `frontend/.next/`
     * `frontend/next-env.d.ts`
     * `frontend/node_modules/`
     * `frontend/tsconfig.tsbuildinfo`

---

### 1.2 Cloud Backend Deployment Investigation (Requirement R3)

#### A. Amazon Web Services (AWS)

1. **Observed References in Codebase and Configuration:**
   - File `CLAUDE.md`, Line 6:
     ```markdown
     - Code sandbox: Piston on AWS EC2, reached only via Tailscale VPN (private).
     ```
   - File `docs/DEPLOY.md`, Lines 12-14:
     ```markdown
     ▼     │
     AWS EC2 (Piston), reachable only over Tailscale (100.114.155.33:2000)
     ```
   - File `backend/Dockerfile`, Line 2-3:
     ```dockerfile
     # Tailscale runs alongside uvicorn so the Cloud Run service can reach the
     # private AWS Piston sandbox at 100.114.155.33:2000 over the tailnet.
     ```
   - File `backend/app/services/piston.py`, Lines 33-37:
     ```python
     # Our EC2 Piston instance caps run_timeout at 3000ms and compile_timeout at 10000ms.
     # Memory limit also capped — omit to use the instance default rather than guess.
     "run_timeout": 3000,
     "compile_timeout": 10000,
     ```
   - File `backend/.env`, Line 10:
     ```bash
     SUPABASE_DB_URL=postgresql://postgres.mnsuaqcrvnocvgbfreei:lU8SWjPnMNortRNQ@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
     ```
   - File `docs/DEPLOY.md`, Line 135:
     ```bash
     export SUPABASE_DB_URL='postgresql://postgres.<REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres'
     ```
   - File `problems_db/final_problems_db.json`: Contains LeetCode image assets hosted on `s3-lc-upload.s3.amazonaws.com` (external third-party URLs embedded in imported problem descriptions).

2. **AWS Service Inventory & Architecture:**
   - **Service Type:** Amazon Elastic Compute Cloud (AWS EC2).
   - **Role:** Hosts the Piston isolated code execution sandbox (`ghcr.io/engineer-man/piston` on port 2000).
   - **Networking:** The EC2 instance is connected to a private Tailscale network (tailnet) at IP `100.114.155.33:2000`. It is NOT exposed directly to the public internet for execution requests; incoming execution traffic is tunneled through Tailscale from Google Cloud Run.
   - **Database Infrastructure (Indirect AWS):** Supabase PostgreSQL database connection uses AWS Singapore (`aws-0-ap-southeast-1.pooler.supabase.com`), managed by Supabase.
   - **SDKs / IaC:** Search across `backend/requirements.txt`, `package.json`, and all source files confirms **NO AWS SDKs** (`boto3`, `botocore`, `@aws-sdk/*`), **NO AWS CloudFormation templates**, **NO AWS SAM**, **NO AWS CDK**, and **NO Terraform** configurations exist in the repository.
   - **Unknowns (AWS):**
     * AWS Account ID: **UNKNOWN** (no repository evidence)
     * EC2 Instance ID / AMI ID / Instance Type: **UNKNOWN** (no repository evidence)
     * AWS VPC ID, Subnet ID, and Security Group rules: **UNKNOWN** (no repository evidence)
     * EC2 provisioning scripts / user-data scripts: **UNKNOWN** (no repository evidence)
     * AWS IAM Roles / Policies / Credentials: **UNKNOWN** (no repository evidence)

#### B. Google Cloud Platform (GCP)

1. **Observed References and Deployment Manifests:**
   - File `backend/cloudbuild.yaml` (Lines 1-71):
     * Service: Google Cloud Build + Google Artifact Registry + Google Cloud Run + Google Secret Manager.
     * Configuration parameters:
       - `_REGION`: `asia-southeast1`
       - `_REPO`: `adaptcode` (Artifact Registry docker repository)
       - `_SERVICE`: `adaptcode-backend` (Cloud Run service name)
       - `_FRONTEND_URL`: `https://adaptcode.vercel.app`
       - `logging`: `CLOUD_LOGGING_ONLY`
     * Build steps:
       1. Step `build` (`gcr.io/cloud-builders/docker`): Builds `backend/Dockerfile` tagged as:
          - `${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:${SHORT_SHA}`
          - `${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:latest`
       2. Step `push` (`gcr.io/cloud-builders/docker`): Pushes image and tags to Artifact Registry.
       3. Step `deploy` (`gcr.io/google.com/cloudsdktool/cloud-sdk` invoking `gcloud run deploy`):
          - `--image=${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:${SHORT_SHA}`
          - `--region=asia-southeast1`
          - `--allow-unauthenticated`
          - `--cpu=1`
          - `--memory=1Gi`
          - `--min-instances=0`
          - `--max-instances=5`
          - `--concurrency=40`
          - `--port=8080`
          - `--timeout=60`
          - `--set-env-vars`:
            * `ENV=production`
            * `PISTON_URL=http://100.114.155.33:2000`
            * `TS_HOSTNAME=adaptcode-backend`
            * `FRONTEND_URL=https://adaptcode.vercel.app`
            * `TRUSTED_PROXY_CIDRS=35.191.0.0/16;130.211.0.0/22`
          - `--set-secrets` (Google Secret Manager bindings):
            * `SUPABASE_URL=SUPABASE_URL:latest`
            * `SUPABASE_KEY=SUPABASE_KEY:latest`
            * `SUPABASE_SERVICE_KEY=SUPABASE_SERVICE_KEY:latest`
            * `GEMINI_API_KEY=GEMINI_API_KEY:latest`
            * `TS_AUTHKEY=TS_AUTHKEY:latest`
   - File `backend/Dockerfile` (Lines 1-51):
     * Base image: `python:3.11-slim`
     * Tailscale installation: Directly installed inside container via Debian Bookworm APT repository keyring.
     * Container entrypoint: `CMD ["/srv/entrypoint.sh"]`
     * Exposed port: `8080`
     * Environment variables defined: `PYTHONDONTWRITEBYTECODE=1`, `PYTHONUNBUFFERED=1`, `TS_STATE_DIR=/var/lib/tailscale`, `TS_SOCKET=/var/run/tailscale/tailscaled.sock`, `PORT=8080`.
   - File `backend/entrypoint.sh` (Lines 1-55):
     * Boots `tailscaled` daemon in userspace networking mode:
       `tailscaled --state="$TS_STATE_DIR/tailscaled.state" --socket="$TS_SOCKET" --tun=userspace-networking --socks5-server=localhost:1055 --outbound-http-proxy-listen=localhost:1055 &`
     * Joins tailnet:
       `tailscale --socket="$TS_SOCKET" up --authkey="$TS_AUTHKEY" --hostname="$TS_HOSTNAME" --accept-dns=false --accept-routes`
     * Sets proxy environment variables for Python runtime:
       `export ALL_PROXY="socks5h://localhost:1055"`
       `export HTTPS_PROXY="http://localhost:1055"`
       `export HTTP_PROXY="http://localhost:1055"`
       `export NO_PROXY="localhost,127.0.0.1,$(hostname),.supabase.co,.googleapis.com,.google.com"`
     * Executes web server:
       `exec uvicorn app.main:app --host 0.0.0.0 --port "$PORT" --proxy-headers --forwarded-allow-ips="*"`
   - File `backend/.gcloudignore` (Lines 1-24):
     * Excludes `.git`, `.venv`, `tests/`, `migrations/`, `research/`, `scripts/`, `schema.sql`, etc. from build upload context.
   - File `docs/DEPLOY.md` (Lines 34-54):
     * Required GCP APIs: `run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`, `secretmanager.googleapis.com`.
     * Cloud Build Service Account IAM roles:
       - `roles/run.admin`
       - `roles/iam.serviceAccountUser`
       - `roles/artifactregistry.writer`
       - `roles/secretmanager.secretAccessor`
     * Secret Manager secrets required: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`, `TS_AUTHKEY`.
   - File `backend/app/services/gemini.py` (Lines 7-9, 70-84):
     * Service: Google Gemini API (Google AI / Generative Language).
     * Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`.
     * Model: `gemini-2.5-flash`.
     * Authentication: `x-goog-api-key: settings.GEMINI_API_KEY`.
     * Configuration: `temperature: 0.3`, `maxOutputTokens: 500`, `responseMimeType: "application/json"`.

2. **Unknowns (GCP):**
   - Live Google Cloud Project ID: **UNKNOWN** (referenced dynamically as `${PROJECT_ID}` in `cloudbuild.yaml` and `<YOUR_PROJECT_ID>` in `docs/DEPLOY.md`).
   - Active Cloud Run deployed service URL hash: **UNKNOWN** (documented in `docs/DEPLOY.md` as `https://adaptcode-backend-<hash>-<region>.run.app`).
   - GCP Billing Account ID: **UNKNOWN** (no repository evidence).
   - Tailscale auth key value: **UNKNOWN** / Redacted (provided at runtime via Secret Manager `TS_AUTHKEY`).

#### C. Supporting Cloud Services & Deployment History

1. **Frontend Hosting (Vercel):**
   - Documented in `docs/DEPLOY.md` (Step 4), `CLAUDE.md`, and `.github/workflows/deploy.yml`.
   - Production target: `https://adaptcode.vercel.app`.
   - Root directory: `frontend`. Preset: Next.js.
   - Environment variables: `NEXT_PUBLIC_API_URL` pointing to the Cloud Run backend URL.
   - Commit `47f02af`: `fix(build): downgrade next.js and tailwind to stable v14 and v3 to fix Vercel deploy`.
   - Commit `c8e7196`: `Fix TS errors and relax ESLint to pass Vercel build`.

2. **Previous Deployment Platforms (Evolutionary History):**
   - **Render (`onrender.com`):**
     * Commit `8e87d8e`: `Fix Render deployment: remove invalid uvicorn flag`.
     * Commit `8147ed9`: `Fix frontend Content Security Policy to allow Render API connections` (added `https://*.onrender.com` to `connect-src`).
     * File `.github/workflows/deploy.yml` (Lines 68-71): Commented-out job triggering Render via `curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}`.
     * Status: Deprecated and superseded by Google Cloud Run.
   - **Oracle Cloud Infrastructure (OCI) VM:**
     * Commit `8523b42`: `chore: save oracle vm and laptop deployment state`.
     * Status: Historical / obsolete dev experiment.
   - **Cloudflare Tunnel:**
     * Commit `7a12346`: `chore: setup next.js proxy to backend for local cloudflare tunnel`. Added `/api/:path* -> http://127.0.0.1:8000/api/:path*` rewrite in `frontend/next.config.mjs`.
     * Status: Local development tunnel tooling.

3. **CI/CD Pipelines:**
   - `.github/workflows/ci.yml`:
     * `backend-test` job is disabled with `if: ${{ false }}` (explicitly documented in `CLAUDE.md:22` as intentionally gated off).
     * `frontend-test` job runs `npm test -- --passWithNoTests`.
   - `.github/workflows/deploy.yml`:
     * `test-backend` job is disabled with `if: ${{ false }}`.
     * `build-frontend` job runs `npm ci` and `npm run build`.
     * `deploy` job (Render trigger) is commented out.
   - `backend/cloudbuild.yaml`:
     * Active backend build/deploy automation designed for Cloud Build triggers on git push or manual execution via `gcloud builds submit`.

---

## 2. Logic Chain

1. **Logic Step 1 — Local vs. Remote State:**
   - Observation: `git remote -v` outputs `origin https://github.com/Justinvcj/Adapt_Code.git`.
   - Observation: `git rev-parse HEAD` and `git rev-parse origin/main` both return `2a0579c37c6461fa4e324197666312411b913e4e`.
   - Observation: `git status` reveals 1 modified file (`.gsd/STATE.md`) and 4 untracked paths (`.agents/teamwork/`, `.gsd/ARCHITECTURE.md`, `.gsd/STACK.md`, `docs/UI_UX_SPECIFICATION.md`).
   - Inference: The local git commit history is fully synchronized with `origin/main` on GitHub (0 commits ahead, 0 commits behind). All differences between the local workspace and GitHub originate strictly from the uncommitted working tree (the modified `.gsd/STATE.md` and the four untracked files/directories).

2. **Logic Step 2 — Architecture Verification from Source Files:**
   - Observation: `backend/cloudbuild.yaml` provisions `adaptcode-backend` on Google Cloud Run with Artifact Registry and Secret Manager.
   - Observation: `backend/Dockerfile` and `backend/entrypoint.sh` install and initialize `tailscaled` with a SOCKS5 proxy (`localhost:1055`) and set `ALL_PROXY="socks5h://localhost:1055"` to reach `PISTON_URL=http://100.114.155.33:2000`.
   - Observation: `CLAUDE.md` and `docs/DEPLOY.md` explicitly verify that `100.114.155.33:2000` is a Piston sandbox container hosted on an AWS EC2 instance.
   - Inference: AdaptCode operates a multi-cloud hybrid topology where Google Cloud Run hosts the stateless FastAPI container, while AWS EC2 hosts the resource-intensive, isolated code execution sandbox (Piston), connected securely via a private Tailscale tailnet without exposing Piston to the public internet.

3. **Logic Step 3 — Absence of Speculative AWS Artifacts:**
   - Observation: Grep searches for `boto3`, `botocore`, AWS Lambda, ECS, CloudFormation, SAM, and Terraform across the repository return zero hits.
   - Observation: The only AWS connections are the Tailscale IP of the EC2 Piston instance (`100.114.155.33:2000`) and the managed Supabase connection string (`aws-0-ap-southeast-1.pooler.supabase.com`).
   - Inference: AWS infrastructure is not managed via Infrastructure-as-Code (IaC) inside this repository. Any EC2 instance settings, IAM roles, or AWS account details outside the documented Tailscale endpoint are external and unknown from the codebase context.

4. **Logic Step 4 — Identifying Security & Configuration Discrepancies:**
   - Observation: In `backend/cloudbuild.yaml` line 65, `TRUSTED_PROXY_CIDRS` is set with a semicolon: `35.191.0.0/16;130.211.0.0/22`.
   - Observation: In `backend/app/core/rate_limit.py` line 8, parsing uses `.split(",")`: `_TRUSTED_PROXIES = [ipaddress.ip_network(c.strip()) for c in settings.TRUSTED_PROXY_CIDRS.split(",") if c.strip()]`.
   - Observation: In `backend/Dockerfile` line 13, documentation specifies comma separation: `TRUSTED_PROXY_CIDRS=35.191.0.0/16,130.211.0.0/22`.
   - Inference: In a Cloud Run deployment via `cloudbuild.yaml`, `ipaddress.ip_network` will attempt to parse `'35.191.0.0/16;130.211.0.0/22'` as a single network CIDR and raise a `ValueError` on startup when `rate_limit.py` is initialized, unless fixed.
   - Observation: In `frontend/next.config.mjs` line 34, `Content-Security-Policy` `connect-src` is `'self' https://*.supabase.co`. It does NOT include `https://*.run.app` or `https://adaptcode-api.*`.
   - Observation: Line 43 of `frontend/next.config.mjs` hardcodes a rewrite to `http://127.0.0.1:8000/api/:path*`.
   - Inference: In production on Vercel, if the browser makes client-side API requests directly to the Cloud Run backend URL (`NEXT_PUBLIC_API_URL`), the browser's CSP will block the request unless `connect-src` is updated to include the Cloud Run domain.

---

## 3. Caveats

1. **No External Infrastructure Inspection:** This investigation was strictly read-only and restricted to local repository files and git commit history. Live cloud consoles (AWS Management Console, Google Cloud Console, Tailscale Admin Console, Vercel Dashboard, Supabase Dashboard) were not accessed.
2. **Ignored Runtime Files:** Files ignored by git (`backend/.env`, `frontend/.env.local`) were inspected for configuration keys, but live production secrets in Google Secret Manager or Vercel were not verifiable beyond what is documented in runbooks.
3. **External Piston Instance Configuration:** The internal configuration of the AWS EC2 instance (OS, Docker configuration, Tailscale key provisioning, EC2 security group rules) is not housed in git and is therefore unknown.

---

## 4. Conclusion

1. **Local vs GitHub Comparison (R2 Summary):**
   - **GitHub Remote URL:** `https://github.com/Justinvcj/Adapt_Code.git`
   - **Target Branch:** `main`
   - **Tracking Status:** Up to date with `origin/main` (commit `2a0579c37c6461fa4e324197666312411b913e4e`).
   - **Divergent Commits:** 0 ahead, 0 behind.
   - **Local Uncommitted Changes:**
     * Modified: `.gsd/STATE.md` (updates session state to phase audit and master UI/UX specification).
     * Untracked: `.agents/teamwork/` (orchestrator & explorer survey metadata), `.gsd/ARCHITECTURE.md`, `.gsd/STACK.md`, `docs/UI_UX_SPECIFICATION.md`.
     * Added/Staged: 0 files.
     * Deleted: 0 files.

2. **Cloud Backend Deployment (R3 Summary):**
   - **Primary Backend Hosting (GCP):** Google Cloud Run service `adaptcode-backend` in region `asia-southeast1`, built via `backend/cloudbuild.yaml` into Google Artifact Registry. Secrets are bound via Google Secret Manager.
   - **Sandbox Hosting (AWS):** Piston code execution engine hosted on a private AWS EC2 instance at Tailscale IP `100.114.155.33:2000`. No direct AWS IaC, Lambda, or boto3 SDKs exist in the repository.
   - **Networking:** Intra-cloud tunnel provided by Tailscale sidecar running in userspace networking mode inside the Cloud Run container (`backend/entrypoint.sh`), routing requests to AWS EC2 via SOCKS5 proxy on `localhost:1055`.
   - **AI Diagnostic Service:** Google Gemini API (`gemini-2.5-flash`) called via direct REST requests using `GEMINI_API_KEY`.
   - **Database:** Supabase PostgreSQL (hosted on AWS `ap-southeast-1` pooler).
   - **Frontend:** Vercel App Router (`https://adaptcode.vercel.app`).
   - **Explicit Unknowns:** AWS Account ID, AWS EC2 Instance ID, AWS VPC/Subnet ID, AWS IAM roles, live Google Cloud Project ID, live Cloud Run URL hash, and Tailscale auth key value are UNKNOWN due to lack of repository evidence.

---

## 5. Verification Method

To independently verify all findings:

1. **Verify Git Tracking & Remote Status:**
   ```bash
   git remote -v
   git status
   git branch -a -vv
   git rev-parse HEAD
   git rev-parse origin/main
   git log -1 --stat
   ```

2. **Verify Uncommitted Differences:**
   ```bash
   git diff .gsd/STATE.md
   git status --ignored
   ```

3. **Verify Cloud Deployment & Networking Manifests:**
   - Inspect Cloud Build pipeline: `cat backend/cloudbuild.yaml`
   - Inspect Tailscale container entrypoint: `cat backend/entrypoint.sh`
   - Inspect Dockerfile: `cat backend/Dockerfile`
   - Inspect Deployment Runbook: `cat docs/DEPLOY.md`
   - Inspect Piston service code: `cat backend/app/services/piston.py`
   - Inspect Gemini service code: `cat backend/app/services/gemini.py`
   - Check dependency manifests for absence of AWS SDKs: `grep -i "boto" backend/requirements.txt` (returns exit code 1 / no matches).

4. **Invalidation Conditions:**
   - Any git push to `origin/main` from another client changing remote HEAD invalidates the 0-ahead/0-behind status.
   - Modifying `.gsd/STATE.md` or deleting the untracked `.gsd/*.md` files changes the uncommitted change set.
