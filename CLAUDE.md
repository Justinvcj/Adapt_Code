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

## Current state (as of 2026-11-12, commit 87aae62)
- Auth (email/password + Google OAuth), Submit, Mastery, stats, next-problem, start/abandon, ConceptGraph, mastery/[concept] are all wired to the real FastAPI (Phase 8 → Phase B → Nov 12).
- Every "demo"/placeholder UI element has been removed (commit c251934) — nothing in the app fakes data anymore.
- Problem bank is live in Supabase: 473 real LeetCode-derived problems across 12 concepts, now carrying real Python/Java/C++/JavaScript starter code (PR #27). `frontend/src/data/problems.ts` is only an offline fallback (see Backend wiring rules).
- Security hardening sprint (Nov 11-12): per-user login lockout + daily submit cap, SECURITY DEFINER migration, RLS enabled on `audit_log`/`system_failures`/`problems`, Cloudflare Turnstile CAPTCHA (feature-flagged), Piston runtime-pinning scaffold (feature-flagged). Full threat model in `SECURITY.md`.
- Sentry observability wired on both frontend and backend (safe no-op without a DSN) — took 3 separate fixes (build cache, CSP, Tailscale NO_PROXY) to actually get events flowing end to end.
- A long-standing CORS misconfiguration (missing Vercel alias dash + a gcloud comma-escaping bug) was silently sending the frontend to its offline-mock fallback in production for weeks; fixed 2026-11-12.
- Update this section whenever the "what's wired vs. not" picture changes — and see "Living history doc" below.

## Living history doc
- `docs/PROJECT_HISTORY.md` is the complete, from-scratch narrative of this entire project — every phase, pivot, algorithm, formula, technology choice, security decision, and lesson, in order, written at interview/due-diligence depth (the project owner needs to be able to explain this project completely to an interviewer or a buyer from this document alone). Read it once to get fully oriented.
- It must be kept up to date, at the same depth. Whenever you complete a phase of work, make a major pivot (new deploy target, dropped/added dependency that mattered, a security incident, a reverted decision, a changed algorithm/formula), or change the "Current state" section above — append a dated entry to that file's timeline (Part 3) with the same level of technical detail as the existing entries (why, not just what — reference exact file paths, exact formulas/constants, exact commit hashes), and update its Part 4 (algorithms), Part 5 (schema), Part 6 (security), Part 7 (interview Q&A), or Part 8 (lessons) if any of those changed. Small bug fixes that don't change how or why the system works don't need an entry (git log is already the changelog for those).
- Update the "Last narrated commit" line at the bottom of that file to the current HEAD hash whenever you add an entry.
- This file has been lost once already when a branch was rebased/split without it being noticed — see Part 3 ("A note on the git history itself") in that document. Treat it as something to actively verify survived onto `main` after any rebase, force-push, or branch cleanup, not something to assume is safe.
