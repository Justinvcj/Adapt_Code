<div align="center">

# AdaptCode

**Adaptive DS&A practice: BKT models your concept mastery, LinUCB picks the next problem, Piston grades the code, Gemini explains why it failed.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js_14-App_Router-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)

</div>

---

## Architecture (locked)

```
                 Client Browser
                       │
                       ▼ HTTPS (credentials: 'include')
              Vercel · Next.js 14
                       │
                       ▼ httpOnly adaptcode_session cookie
            Cloud Run · FastAPI + Tailscale sidecar
           ┌───────────┼───────────┐
           ▼           ▼           ▼
       Supabase    Gemini    AWS EC2 · Piston
       (REST+Auth) (REST)    (reached only over Tailscale
                              at 100.114.155.33:2000)
```

Stack is final. Do not propose alternatives (see [CLAUDE.md](CLAUDE.md), `.gsd/STACK.md`).

## What's in the box

- **518** LeetCode-sourced problems in `problems_db/final_problems_db.json`; **442** picked by the seeder and upserted into Supabase across 12 concepts (see `backend/scripts/seed_problems_from_db.py` for the exact mapping).
- **Bayesian Knowledge Tracing** over 12 concepts with graded behavioural penalties ρ for hints, attempts, compile errors, and server-tracked time-on-task.
- **LinUCB** contextual bandit (d=16, α=1.0) picking among 5 pedagogical actions: easier / same / harder / redirect_prerequisite / hint_augmented.
- **Piston** code execution over a private Tailscale tunnel; the backend wraps function-style submissions in a stdin/stdout harness.
- **Gemini Flash** (stable alias `gemini-flash-latest`, overridable via `GEMINI_MODEL`) for 3-part diagnostic explanations on wrong submissions (background task, polled via `/api/explanation/{event_id}`).

Full backend route reference: [docs/API.md](docs/API.md). Topology detail: [.gsd/ARCHITECTURE.md](.gsd/ARCHITECTURE.md). Deploy runbook: [docs/DEPLOY.md](docs/DEPLOY.md).

---

## Local development

### Prerequisites

| Tool | Version | Why |
|---|---|---|
| Node.js | 18+ | Frontend runtime |
| Python | 3.11+ | Backend runtime |
| Supabase project | — | DB + auth |
| Tailscale | — | Only needed if you want to hit the real Piston EC2 node |

You do **not** need a local Piston Docker container — `PISTON_URL` defaults to the Tailscale IP of the deployed EC2 node. Running Piston locally is optional (`docker run -d -p 2000:2000 --privileged --tmpfs /tmp:exec --name piston ghcr.io/engineer-man/piston`), in which case set `PISTON_URL=http://localhost:2000`.

### Setup

```bash
# Backend
cd backend
python -m venv venv
# PowerShell
venv\Scripts\Activate.ps1
# or bash
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # fill in SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY, GEMINI_API_KEY
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open http://localhost:3000.

### Seeding problems

Needs `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` in env:

```bash
cd backend
python scripts/seed_problems_from_db.py           # writes ~442 rows
DRY_RUN=1 python scripts/seed_problems_from_db.py # inspect without writing
```

---

## Configuration

### `backend/.env`

| Variable | Required | Default | Notes |
|---|---|---|---|
| `SUPABASE_URL` | yes | — | `https://<ref>.supabase.co` |
| `SUPABASE_KEY` | yes | — | **anon** key |
| `SUPABASE_SERVICE_KEY` | yes | — | **service_role** key (admin writes, RPC, seeding) |
| `GEMINI_API_KEY` | yes | — | Google Generative Language API key |
| `FRONTEND_URL` | no | `http://localhost:3000` | Comma-separated CORS allowlist |
| `FRONTEND_URL_REGEX` | no | — | Regex for Vercel preview subdomains |
| `PISTON_URL` | no | `http://100.114.155.33:2000` | Tailscale IP of the EC2 Piston node |
| `ENV` | no | `development` | Set to `production`/`staging` to enable secure cookies + HSTS |
| `DEBUG` | no | `false` | Verbose logging |
| `TEST_MODE` | no | `false` | **Dev only** — `DEV_TOKEN_<email>` bypass. Known security issue when true in prod (see `security/SECURITY_ISSUES.md` C1). |

### `frontend/.env.local`

| Variable | Required | Default | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | no | — | FastAPI URL. **Unset** → UI renders with local mocks (`src/data/`); this is the intentional offline fallback per [CLAUDE.md](CLAUDE.md). |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14.2, React 18, TypeScript, Tailwind 3.4, Monaco, Framer Motion, GSAP, Lucide |
| Backend | FastAPI 0.115, Uvicorn, Pydantic, Supabase-py, NumPy, SlowAPI |
| Execution | Piston on AWS EC2 (Tailscale-only) |
| DB + auth | Supabase (Postgres 15, Auth JWT, RLS) |
| AI | Google Gemini Flash (`gemini-flash-latest` alias) |
| Adaptive engine | BKT + LinUCB (in-process, state in Postgres) |
| Testing | Pytest (backend — needs maintenance), Jest (frontend) |

---

## Testing

Backend tests currently have import debt — they live in `backend/tests/` but CI (`.github/workflows/ci.yml`) is intentionally gated off (`if: ${{ false }}`); flip it to `true` when the suite is rehabilitated. Per [CLAUDE.md](CLAUDE.md), do not re-enable without explicit sign-off.

```bash
# Backend
cd backend && pytest tests/
# Frontend
cd frontend && npm test
```

---

## Deployment

Full runbook: [docs/DEPLOY.md](docs/DEPLOY.md). Short version:

1. Load secrets (`SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`, `TS_AUTHKEY`) into GCP Secret Manager.
2. `gcloud builds submit --config=backend/cloudbuild.yaml --substitutions=_FRONTEND_URL=<vercel-url>` — builds the container, pushes to Artifact Registry, deploys to Cloud Run with Tailscale userspace sidecar.
3. Verify `curl <cloud-run-url>/health` → `piston_reachable: true`.
4. Vercel: set `NEXT_PUBLIC_API_URL` to the Cloud Run URL, redeploy.

---

## Roadmap

See [.gsd/PLAN.md](.gsd/PLAN.md) — resumable phase checklist (audit → frontend wiring → backend parity → deploy → verify → polish).

Historical phases: [.gsd/ROADMAP.md](.gsd/ROADMAP.md).

---

## License

MIT — see [LICENSE](LICENSE).
