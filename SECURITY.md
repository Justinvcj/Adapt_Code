# AdaptCode — Security

This document is the single source of truth for AdaptCode's security posture:
the attack surface, what is already hardened, and the backlog of known-sharp
edges we have not closed yet. It is written so a new engineer (or auditor) can
reconstruct the threat model in ten minutes.

> **Reporting a vulnerability:** if you find something exploitable, email the
> maintainer privately rather than opening a public issue. The project is small
> and the response time is faster.

---

## 1. System at a glance

```
Browser ── HTTPS ──▶ Vercel (Next.js, Edge/Node)
                         │  httpOnly cookie "adaptcode_session"
                         ▼
                    Cloud Run (FastAPI + Tailscale userspace sidecar)
                         │           ▲
                         │           │  Supabase REST + Gemini (public)
                         ▼           │
                      AWS EC2 (Piston code sandbox)
                      reachable only over Tailscale
                      (100.114.155.33:2000, no public port)
```

Everything that touches user input flows through the Cloud Run backend. The
frontend never holds the Supabase service key; it holds only the anon key
(public by Supabase's design) and routes writes through FastAPI.

---

## 2. Attack surface

| Surface | Exposure | Hardening |
|---|---|---|
| **Public Vercel app** | Anyone on the internet | CSP with strict `connect-src`; httpOnly `adaptcode_session`; Sentry only if DSN present |
| **FastAPI public routes** | Anyone | Session cookie auth, CORS pinned to Vercel origin + preview regex, rate-limited via SlowAPI, no OpenAPI/Swagger in prod |
| **Piston sandbox** | **Not public** | Tailnet-only, no public ingress, per-run cpu/mem/timeout caps, forked runtimes |
| **Supabase Postgres** | Public TLS endpoint | RLS on user-owned tables, anon key cannot write across users, service key stays server-side only |
| **Cloud Build → Cloud Run** | Google-authenticated | Push-protected main branch, Secret Manager for runtime secrets |
| **Dev loopback** | localhost only | `/docs`, `/redoc`, `/openapi.json` enabled only when `ENV != production/staging` |

---

## 3. Already closed

- ✅ **Docs/schema catalog hidden in prod.** `/docs`, `/redoc`, `/openapi.json`
  all return 404 in `ENV=production`. See [backend/app/main.py](backend/app/main.py).
- ✅ **CORS pinned.** `allow_origins` is a comma-separated allowlist plus a
  strict regex for Vercel preview subdomains; non-HTTPS origins fail the assert
  in prod/staging. **Gotcha:** the Vercel alias is `adapt-code.vercel.app`
  (with the dash) — `adaptcode.vercel.app` 404s. Cloud Run's `FRONTEND_URL`
  must include both. A `gcloud --update-env-vars` call with commas inside
  the value needs the `^@^` separator prefix, e.g.
  `--update-env-vars='^@^FRONTEND_URL=https://adapt-code.vercel.app,https://adaptcode.vercel.app'`.
- ✅ **Session cookie hardened.** `httpOnly`, `secure`, `SameSite=strict`;
  CSRF token issued separately. See [backend/app/routers/auth.py](backend/app/routers/auth.py).
- ✅ **Security headers everywhere.** `X-Content-Type-Options`, `X-Frame-Options:
  DENY`, HSTS with `includeSubDomains`, legacy `X-XSS-Protection`.
- ✅ **CSP on the frontend** blocks inline scripts except where Next.js nonces
  them; connect-src only Sentry ingest, Cloud Run API, Supabase.
- ✅ **Piston over Tailscale.** The sandbox has no public port. Even if an
  attacker fully owns the Cloud Run process they still cannot pivot to the
  sandbox from anywhere else on the internet.
- ✅ **Secrets in Secret Manager**, not in env vars on disk or in the image.
  Rotation documented in [docs/DEPLOY.md §7](docs/DEPLOY.md#7-rotation--ops).
- ✅ **Frontend never reads SERVICE key.** Enforced by [CLAUDE.md](CLAUDE.md)
  and verified by grep in CI (every PR).

---

## 4. Backlog — ranked by severity

Ranking uses: exploitability × blast radius × availability of mitigation.

### 4.1 Per-user failed-login lockout — ✅ shipped (PR #28, commit `6af63be`)
Tiers: 5 failures → 15 min, 10 → 1 hr, 20 → 24 hr. Keyed by normalized email
(`strip().lower()`), DB-clock `now()` for all comparisons, fails OPEN on DB
outage. See [backend/app/services/login_lockout.py](backend/app/services/login_lockout.py).
Verified live 2026-11-11: 5 failed logins → DB row `failed_count=5`,
`locked_until = first_failed_at + 15m`. SlowAPI (5/min per IP) still layered
in front. **Known quirk** — once `locked_until` expires, `failed_count` resets
to 1 instead of accumulating to the 10/20 tiers via the login endpoint alone.

### 4.2 Per-user daily submit cap — ✅ shipped (PR #28, commit `6af63be`)
Free: 100 submits/24h. Pro: 500. Rolling window keyed by `session_events`.
Header `X-AdaptCode-Submits-Today` on every response. Fails CLOSED (`403`) if
the user row is missing; fails OPEN on DB outage. See
[backend/app/services/submit_quota.py](backend/app/services/submit_quota.py).

### 4.3 Cloudflare in front (free tier)
Even with SlowAPI, L7 abuse (slow-loris, UA rotation, cheap DDoS) hits Cloud
Run directly today. Cloudflare's free tier gives: proxy with rate-limiting,
Bot Fight Mode, WAF-managed rules, and anonymizes the Cloud Run origin.
See [§5](#5-cloudflare-runbook-free-tier).

### 4.4 SENTRY_DSN → Secret Manager
Currently set via `gcloud run services update --update-env-vars SENTRY_DSN=…`.
Visible in `gcloud run services describe` for anyone with Viewer. Should move
to Secret Manager like the other secrets. See [§6](#6-sentry_dsn--secret-manager).

### 4.5 CAPTCHA on signup — ✅ code shipped, feature-flagged OFF
Cloudflare Turnstile wired into `/api/auth/register` and the signup form.
Feature-flagged on `TURNSTILE_SECRET_KEY` (backend) and
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` (frontend). Both unset → code is a no-op,
signup behaves as before. Verification fails CLOSED on Cloudflare API errors
(a CF DoS cannot be used to bypass).

**To turn it on:**

1. Go to https://dash.cloudflare.com/?to=/:account/turnstile → **Add site**
   → hostname = `adaptcode.vercel.app` (and any custom domain). Widget mode:
   Managed. Copy the **Site key** (public) and **Secret key** (private).
2. In Vercel project settings → Environment Variables, add
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` with the site key, Production + Preview.
   Redeploy once from Vercel for the baked-in var to take effect.
3. On Cloud Run:
   ```bash
   gcloud run services update adaptcode-backend \
     --region=asia-southeast1 \
     --update-env-vars=TURNSTILE_SECRET_KEY='<secret-key>'
   ```
   Secret Manager is better long-term; see §6 for the pattern. For now this
   is fine — the secret key is less sensitive than the DB service_role key.
4. Smoke-test: visit `/login` → Create account → confirm a Turnstile widget
   appears above the submit button, solve it, verify signup succeeds.

See [backend/app/services/turnstile.py](backend/app/services/turnstile.py)
and [frontend/src/components/Turnstile.tsx](frontend/src/components/Turnstile.tsx).

### 4.6 Piston runtime pinning + CVE audit
`LANGUAGE_MAP` in [backend/app/services/piston.py](backend/app/services/piston.py)
uses `"version": "*"`, which asks Piston for the newest installed runtime. A
silent runtime upgrade with a fresh CVE would land in production without any
code change here. See [§7](#7-piston-runtime-pinning).

### 4.7 Dependency floor bumps
`python-jose` and `psycopg2-binary` had version floors bumped (commit 3a14419).
Residual Dependabot queue is stale (branches 6+ weeks old); close and let
Dependabot regenerate against current `main`.

### 4.8 SECURITY DEFINER functions open to anon REST — _patch ready_

The Supabase advisor flagged two `SECURITY DEFINER` functions as callable by
the `anon` role via `/rest/v1/rpc/*`:

- `public.register_user(p_email, p_display_name, p_auth_uid)` — **real risk.**
  Inserts a row into `public.users` with `user_id = p_auth_uid` taken as a
  trusted argument, with **no check that `p_auth_uid = auth.uid()`**. An anon
  caller could insert `users` rows under any UUID they chose. Not an account
  takeover (they can't make `auth.users` entries), but trash data and
  collisions are possible. Called server-side from FastAPI's `/api/auth/register`
  with the service_role key, so revoking anon/authenticated EXECUTE is safe.

- `public.promote_user_to_admin(target_user)` — **false alarm.** Body has
  `IF (SELECT role FROM users WHERE user_id = auth.uid()) <> 'admin' …
  RAISE EXCEPTION`. Still shouldn't be on the public REST surface.

**Patch:** [backend/migrations/2026_11_11_harden_security_definer_fns.sql](backend/migrations/2026_11_11_harden_security_definer_fns.sql)
revokes EXECUTE from `anon`/`authenticated` on both and pins `search_path`
on all four `SECURITY DEFINER` / trigger functions. Idempotent; run via the
Supabase SQL editor against the dev project.

### 4.9 Supabase Auth: leaked-password protection disabled
HaveIBeenPwned check is off. One click in Supabase dashboard →
**Authentication → Password Settings → Leaked Password Protection**.

### 4.10 Audit logging for admin routes
`/api/admin/*` writes to Supabase but does not log the acting user id to a
tamper-evident log. Low priority — admin surface is tiny — but worth it before
a second admin exists.

---

## 5. Cloudflare runbook (free tier)

One-time, ~15 minutes.

1. **Create the Cloudflare account** and add the domain (`adaptcode.app` or
   whatever you register). Cloudflare will scan existing DNS — **do not accept
   the auto-imported records without a diff.**
2. **At the registrar**, change nameservers to the two Cloudflare provided.
   Propagation: 5 min – 24 h. Cloudflare emails when it's live.
3. **DNS tab in Cloudflare:**
   - `A` or `CNAME` `@` → `cname.vercel-dns.com` — **orange cloud OFF**
     (Vercel needs to see the raw request for its own TLS; proxying would
     double-TLS and break).
   - `CNAME` `api` → `adaptcode-backend-<hash>-<region>.run.app` — **orange
     cloud ON**. This is the one we want proxied.
   - Update frontend env var `NEXT_PUBLIC_API_URL` to `https://api.<domain>` in
     Vercel, redeploy.
4. **SSL/TLS tab:** mode = Full (strict). Not Flexible — that lets Cloudflare
   terminate TLS and talk HTTP to Cloud Run, which breaks the httpOnly cookie
   path.
5. **Security → WAF:**
   - Enable **Managed Rules** → "Cloudflare Managed Ruleset" (free).
   - Enable **Bot Fight Mode** (free).
   - Add a custom rule: `(http.request.uri.path contains "/api/auth/")` →
     Managed Challenge. Stops credential-stuffing rigs at the edge.
6. **Rate Limiting:** add a rule — `/api/*` at more than 300 requests / 10 min
   per client IP → Block for 10 min. Free tier gives one rule, use it here.
7. **Caching → Configuration:** default (standard). We don't want Cloudflare
   caching authenticated responses; the `Cache-Control: no-store` headers
   FastAPI sends keep them uncached automatically.
8. **Verify from a fresh tab**: `curl -I https://api.<domain>/health` should
   show `cf-ray` header and the health JSON. If you see a 522, Cloud Run isn't
   responding — unrelated to Cloudflare.

Rollback: at the registrar, point nameservers back to whoever had them before.
DNS flips in ~5 minutes. Our CORS allowlist does not need to change — both the
Vercel domain and `api.<domain>` resolve to the same Cloud Run service.

---

## 6. SENTRY_DSN → Secret Manager

The DSN is not a typical secret (Sentry's own docs call it "pseudo-public")
but exposing it in `gcloud run services describe` lets anyone with Viewer send
junk events into our Sentry project. Three commands:

```bash
# 1. Create the secret from the current value.
gcloud run services describe adaptcode-backend --region=asia-southeast1 \
  --format='value(spec.template.spec.containers[0].env)' | grep SENTRY_DSN
# Copy the value, then:
echo -n "<the-DSN-you-just-copied>" | gcloud secrets create SENTRY_DSN --data-file=-

# 2. Grant Cloud Build access (same as the other secrets):
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format='value(projectNumber)')
gcloud secrets add-iam-policy-binding SENTRY_DSN \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role=roles/secretmanager.secretAccessor

# 3. Flip cloudbuild.yaml: add SENTRY_DSN=SENTRY_DSN:latest to the --set-secrets
#    line, remove any SENTRY_DSN=... from --update-env-vars, redeploy.
```

Do **not** add `SENTRY_DSN` to the `--set-secrets` line in
[backend/cloudbuild.yaml](backend/cloudbuild.yaml) **before** step 1 — Cloud
Build will fail if the secret doesn't exist yet.

Same procedure applies to `SENTRY_TRACES_SAMPLE_RATE` if we ever want to tune
it per-env without rebuilding.

---

## 7. Piston runtime pinning

Current state: [backend/app/services/piston.py](backend/app/services/piston.py)
sends `"version": "*"` for every language. Piston interprets this as "newest
installed runtime," so the EC2 host's `piston runtime install --latest` cadence
silently changes what student code runs against.

**Risk:** if Piston installs a runtime with a known CVE (e.g. historical
Node.js vm-escape bugs, Python `pickle` sandboxing issues, Java deserialization
chains) between two of our deploys, we inherit that CVE immediately.

**Scaffold shipped (commit after `21ea150`):** backend reads an optional
`PISTON_PINNED_VERSIONS` env var at import time. Any language listed there
gets that version string sent to Piston instead of `"*"`; unlisted languages
still get `"*"`. Zero behaviour change until the env var is set.

**To turn it on:**

1. From your laptop on Tailscale (the sandbox is not public), query the
   installed runtimes:
   ```bash
   curl http://100.114.155.33:2000/api/v2/runtimes | jq '[.[] | {language, version}]'
   ```
2. Pick the latest patch of each language the UI exposes (python, java, c++,
   javascript). Example output:
   ```json
   [
     {"language":"python","version":"3.12.0"},
     {"language":"java","version":"15.0.2"},
     {"language":"c++","version":"10.2.0"},
     {"language":"javascript","version":"20.11.1"}
   ]
   ```
3. Set the env var on Cloud Run. **Watch the quoting** — the whole JSON must
   be a single argument:
   ```bash
   gcloud run services update adaptcode-backend \
     --region=asia-southeast1 \
     --update-env-vars='PISTON_PINNED_VERSIONS={"python":"3.12.0","java":"15.0.2","c++":"10.2.0","javascript":"20.11.1"}'
   ```
4. Smoke test: submit one problem per language and confirm the verdict still
   returns Accepted. Unset the env var to roll back:
   ```bash
   gcloud run services update adaptcode-backend \
     --region=asia-southeast1 --remove-env-vars=PISTON_PINNED_VERSIONS
   ```

**Follow-up:** schedule a quarterly CVE sweep (`osv-scanner` or similar)
against the pinned versions. The sandbox being Tailnet-only limits blast
radius to "compromised runtime can exec inside Piston's seccomp jail", which
is already the design assumption — but layered defence is cheap.

**Failure mode:** a wrong version string makes Piston 400 on every request
for that language. Code logs a warning line (`Piston runtime pins active: …`)
at import so you can tell at a glance from Cloud Run logs whether pinning is
active after a deploy. Invalid JSON is ignored with a warning (service keeps
running with `"*"` for everyone) — not a hard crash on boot.

---

## 8. What the frontend intentionally does NOT do

- Does not store Supabase service key.
- Does not sign JWTs — only reads them from `adaptcode_session` cookie set by
  FastAPI.
- Does not hit Piston directly. Any "run my code" button goes
  through `/api/submit` so SlowAPI, auth, and the per-user quota (see §4.2
  once landed) apply.
- Does not `dangerouslySetInnerHTML` any user content. Problem statements are
  markdown → `react-markdown` with the default (safe) renderer.

---

## 9. Dev-only backdoors (and why they are safe)

- `/docs` + `/redoc` are live when `ENV != production`. They are only reachable
  from a developer's laptop against a locally-running FastAPI; the deployed
  services always run `ENV=production`.
- The sample problems in `frontend/src/data/problems.ts` are static and used
  as the offline fallback. They contain no secrets and no PII.
- `backend/apply_migrations.py` reads `SUPABASE_DB_URL` from env and must
  never be committed with a real DSN. The plaintext DSN that used to live in
  that file was rotated; a commit hook rejects re-adding one.

---

Last reviewed: 2026-11-11.
