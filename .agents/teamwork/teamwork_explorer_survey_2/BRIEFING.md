# BRIEFING — 2026-11-08T05:55:00Z

## Mission
Investigate git status, GitHub comparison (R2), and AWS/GCP cloud backend deployment evidence (R3) for AdaptCode in read-only mode.

## 🔒 My Identity
- Archetype: explorer
- Roles: Git and Cloud Deployment Explorer (Explorer Survey 2)
- Working directory: c:\Users\Justin\The Global Projects Folder\Adapt_Code\.agents\teamwork\teamwork_explorer_survey_2
- Original parent: 03c7139e-8671-4704-8cf9-a7247efd28d4
- Milestone: Initial Survey (R2 & R3)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify existing codebase files
- DO NOT run unneeded external scripts
- DO NOT assume, guess, or speculate on missing details; explicitly state "UNKNOWN" for details lacking concrete repository evidence
- Only write metadata inside c:\Users\Justin\The Global Projects Folder\Adapt_Code\.agents\teamwork\teamwork_explorer_survey_2\

## Current Parent
- Conversation ID: 03c7139e-8671-4704-8cf9-a7247efd28d4
- Updated: not yet

## Investigation State
- **Explored paths**:
  - Git remotes, branches, tracking status, commit logs, git diff, git status --ignored
  - Deployment configs: `backend/cloudbuild.yaml`, `backend/Dockerfile`, `backend/entrypoint.sh`, `docs/DEPLOY.md`, `docker-compose.yml`, `docker-compose.prod.yml`, `.github/workflows/deploy.yml`, `.github/workflows/ci.yml`
  - Environment templates: `backend/.env`, `backend/.env.example`, `frontend/.env.example`, `frontend/.env.local`, `frontend/.env.local.example`
  - Core codebase: `backend/app/core/config.py`, `backend/app/core/rate_limit.py`, `backend/app/main.py`, `backend/app/services/piston.py`, `backend/app/services/gemini.py`, `backend/requirements.txt`, `frontend/package.json`, `frontend/next.config.mjs`, `backend/apply_migrations.py`
  - Architectural docs: `.gsd/STACK.md`, `.gsd/ARCHITECTURE.md`, `docs/ARCHITECTURE.md`, `CLAUDE.md`, `README.md`
- **Key findings**:
  - R2: Working tree is on branch `main` at commit `2a0579c37c6461fa4e324197666312411b913e4e`, which matches `origin/main` (0 ahead, 0 behind).
  - R2: 1 modified uncommitted file (`.gsd/STATE.md`), 4 untracked paths (`.agents/teamwork/`, `.gsd/ARCHITECTURE.md`, `.gsd/STACK.md`, `docs/UI_UX_SPECIFICATION.md`), 0 staged, 0 deleted.
  - R3: Multi-cloud hybrid deployment architecture:
    * Google Cloud: Cloud Run service `adaptcode-backend` in region `asia-southeast1`, deployed via Cloud Build (`backend/cloudbuild.yaml`) pulling image from Artifact Registry (`asia-southeast1-docker.pkg.dev/${PROJECT_ID}/adaptcode/adaptcode-backend`). Secret Manager supplies `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`, `TS_AUTHKEY`.
    * AWS: Standalone Piston code execution sandbox running on private AWS EC2 instance at Tailscale IP `100.114.155.33:2000`. No direct AWS IaC, Lambda, or boto3 SDKs in repo. Supabase pooler host in `.env` is `aws-0-ap-southeast-1.pooler.supabase.com:5432`.
    * Networking: Backend container embeds Tailscale userspace sidecar daemon (`tailscaled` with SOCKS5 proxy on `localhost:1055`) to tunnel outbound traffic from Google Cloud Run to AWS EC2 over the private Tailscale tailnet.
    * Frontend: Vercel hosting Next.js 14 (`https://adaptcode.vercel.app`).
    * Historical evolution: Initial Render deploy attempt (commit `8e87d8e`, `8147ed9`, `.github/workflows/deploy.yml`), Oracle VM note (commit `8523b42`), and Cloudflare tunnel note (commit `7a12346`) superseded by Cloud Run + Tailscale + AWS EC2 Piston setup (commit `2a0579c`).
  - R3: Specific unknowns marked explicitly (AWS EC2 instance ID, VPC/subnet ID, AWS account ID, AWS IAM roles, Cloud Run live domain URL hash, Google Cloud project ID).
- **Unexplored areas**: None for R2/R3 scope; findings synthesized.

## Key Decisions Made
- Categorize R2 by git state, diffs, untracked, ignored, branches, and commit alignment.
- Categorize R3 by cloud provider (AWS, GCP, Other/Supporting: Tailscale, Supabase, Vercel, Render history), explicitly itemizing endpoints, IAM/credentials, configuration flags, scripts, and unknowns.

## Artifact Index
- DISPATCH.md — Received dispatch message
- BRIEFING.md — Situational awareness and identity
- progress.md — Liveness heartbeat and investigation progress
- handoff.md — Final comprehensive deliverable report
