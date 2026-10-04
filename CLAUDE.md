# AdaptCode — session rules for Claude Code

## Architecture (summary)
- Frontend: Next.js 14 App Router in `frontend/`. Deployed on Vercel.
- Backend "Brain": FastAPI in `backend/`. Hosted on Google Cloud.
- Code sandbox: Piston on AWS EC2, reached only via Tailscale VPN (private).
- DB + Auth: Supabase (Postgres + hybrid email/password + Google OAuth).
- Full architecture: see `docs/ARCHITECTURE.md`.

## Branch policy
- Work on `main`. No PRs, no feature branches unless I explicitly ask.
- Commit messages: scope prefix + one-line summary (`feat(frontend):`, `fix(api):`, `docs:`).
- Include the Claude Code attribution footer the harness provides.

## Backend wiring rules
- Secrets live ONLY in `backend/.env` and `frontend/.env.local`. Never commit them.
- Frontend never reads `SUPABASE_SERVICE_KEY` — only the anon key, and only if truly needed; prefer going through FastAPI.
- Frontend ↔ FastAPI auth is a session cookie (`adaptcode_session`, httpOnly, strict). Every fetch MUST use `credentials: 'include'`.
- Keep offline fallback working: if `NEXT_PUBLIC_API_URL` is unset or the API 5xxs, UI must still render with mocks (never crash the page).

## Guardrails
- Do NOT re-enable the backend CI job in `.github/workflows/ci.yml` without my say-so. It is intentionally gated off.
- Do NOT run migrations against the production Supabase project. Use the dev project only.
- Before any destructive command (`rm -rf`, `git reset --hard`, `supabase db reset`), stop and confirm.
- Node 18+, Python 3.11+. Ports: Next.js 3000, FastAPI 8000, Piston 2000 (over Tailscale).

## Current state (as of Phase 8)
- Auth + Submit are wired to the real FastAPI (commit 1ce7370).
- Mastery, stats, next-problem, start/abandon are NOT yet wired — Phase 8B.
- Problem bank in `frontend/src/data/problems.ts` is static — 10 problems. Real problems come from `GET /api/problems` once wired.
