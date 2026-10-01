# AdaptCode — Security Fixes (ultimate)

One fix per finding in `SECURITY_ISSUES.md`, numbered to match. Each fix shows **the diff / config change**, **what you must verify after applying**, and **what you can delete** once the fix is in. Nothing in this file was applied to the repo — it's a prescription, not a patch.

Apply them in the order written: critical fixes first, each one assumes the earlier ones landed.

---

## CRITICAL

### C1 — Remove the `TEST_MODE` auth bypass entirely

The dev-token branch cannot stay in the production codepath. There is no safe version of "a magic token prefix lets you log in as anyone." Replace the whole mechanism with a Supabase-issued short-lived token used only in automated test runs.

**File: `backend/app/core/dependencies.py`** — delete the dev branch:

```python
async def get_current_user(authorization: str = Header(None)) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ")[1]
    return await _verify_supabase_jwt(token)   # see fix H7 for local verification
```

**File: `backend/app/routers/auth.py`** — delete the `if settings.TEST_MODE and req.email.startswith("dev_"):` block in `register` (lines 17–32) and the `if settings.TEST_MODE and "testuser_" in req.email:` block in `login` (lines 72–83).

**File: `backend/app/core/config.py`** — delete the `TEST_MODE` setting.

**File: `backend/app/main.py`** — delete the `assert` and the `if settings.TEST_MODE: origins.append(...)` branch. Replace with:

```python
if settings.ENV not in {"production", "staging"}:
    origins.append("http://localhost:3000")
```

**For end-to-end tests**: issue a real Supabase user in a dedicated test project (separate URL + separate anon key than prod), create the fixture account via Supabase's admin API in the test setup, and have Playwright sign in with that account's real email/password. No special backend code path.

**Verify**
- `grep -r TEST_MODE backend/` returns nothing.
- Posting `Authorization: Bearer DEV_TOKEN_anyone@anywhere.com` to any protected endpoint returns `401`.
- CI tests still pass against the test Supabase project.

**Delete**
- Any `.env.example` entry for `TEST_MODE`.
- Any CI secret named `TEST_MODE`.

---

### C2 — Stop using the service role key on user-driven paths

The service key is for *administrative* actions the server performs on its own behalf (seeding, migrations, scheduled jobs). For requests driven by a user, forward **their** JWT to Supabase so RLS actually applies.

**File: `backend/app/core/database.py`** (not shown but implied):

```python
from supabase import create_client, Client
from app.core.config import settings

# Admin client — only for internal tasks (seeding, cron, migrations)
_admin_client: Client | None = None
def get_supabase_admin() -> Client:
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)
    return _admin_client

# User client — built per-request with the caller's JWT. RLS applies.
def get_supabase_user(jwt: str) -> Client:
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)  # anon key
    client.postgrest.auth(jwt)   # sets Authorization header for every subsequent query
    return client
```

**File: `backend/app/core/dependencies.py`** — pass the raw JWT, not just the id:

```python
from dataclasses import dataclass

@dataclass
class CurrentUser:
    user_id: str
    jwt: str

async def get_current_user(authorization: str = Header(None)) -> CurrentUser:
    # ... verify, extract user_id ...
    return CurrentUser(user_id=claims["sub"], jwt=token)
```

**Every router** — change signatures from `user_id: str = Depends(get_current_user)` to `user: CurrentUser = Depends(get_current_user)` and build the client with `get_supabase_user(user.jwt)`.

**Only** the admin router, cron jobs, and migration scripts may call `get_supabase_admin()`.

**Verify**
- Pick a user A, pick a user B. Using A's JWT, call every router endpoint that touches user data with B's ids in the path/body. Every response must be 403 or empty, not B's data.
- `grep -r get_supabase_admin backend/app/routers/` returns only the admin router.

---

### C3 — Close the role-column RLS gap

Role mutations must go through a `SECURITY DEFINER` function callable only by admins. The direct UPDATE path must be column-restricted.

**File: new migration `backend/migrations/fix_role_escalation.sql`**:

```sql
-- 1. Drop the overly broad update policy
DROP POLICY "Users can only update their own profile" ON users;

-- 2. Replace with a trigger-enforced version that forbids role changes
CREATE OR REPLACE FUNCTION prevent_role_self_edit() RETURNS trigger AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'role changes are not permitted via direct update';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_block_role_self_edit
  BEFORE UPDATE ON users
  FOR EACH ROW
  WHEN (current_setting('request.jwt.claims', true)::jsonb ->> 'role' <> 'service_role')
  EXECUTE FUNCTION prevent_role_self_edit();

-- 3. Re-add the (now narrower) update policy
CREATE POLICY "Users can update their own profile (except role)" ON users
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. SECURITY DEFINER function so admins can promote via the API, nobody else can
CREATE OR REPLACE FUNCTION promote_user_to_admin(target_user uuid)
RETURNS void AS $$
BEGIN
  IF (SELECT role FROM users WHERE user_id = auth.uid()) <> 'admin' THEN
    RAISE EXCEPTION 'only admins may promote users';
  END IF;
  UPDATE users SET role = 'admin' WHERE user_id = target_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION promote_user_to_admin FROM public;
GRANT  EXECUTE ON FUNCTION promote_user_to_admin TO authenticated;
```

**Verify**
- As a plain user via Supabase REST: `PATCH /rest/v1/users?user_id=eq.<me>` with `{"role":"admin"}` returns a trigger error.
- As a plain user: `rpc('promote_user_to_admin', { target_user: '<anyone>' })` returns `only admins may promote users`.
- As an admin: the same `rpc` call succeeds.
- No one, except via the SECURITY DEFINER function, can write to the `role` column.

---

### C4 — Make rate limiting actually rate-limit

Three changes together: trust the proxy header only from the one proxy, add per-account lockout, and add exponential backoff.

**File: `backend/app/core/rate_limit.py`**:

```python
import ipaddress
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request
from app.core.config import settings

# Only trust X-Forwarded-For if the request came from this list.
# Set in env, e.g. "10.0.0.5/32,2600:1f14::/32" for your Vercel/Cloudflare egress.
_TRUSTED_PROXIES = [ipaddress.ip_network(c.strip()) for c in settings.TRUSTED_PROXY_CIDRS.split(",") if c.strip()]

def get_real_ip(request: Request) -> str:
    peer = request.client.host if request.client else "0.0.0.0"
    try:
        peer_ip = ipaddress.ip_address(peer)
    except ValueError:
        return peer
    if any(peer_ip in net for net in _TRUSTED_PROXIES):
        fwd = request.headers.get("X-Forwarded-For")
        if fwd:
            # right-most entry is the one the trusted proxy wrote
            return fwd.split(",")[-1].strip()
    return peer

limiter = Limiter(key_func=get_real_ip)
```

**File: `backend/app/routers/auth.py`** — add per-account lockout, keyed by email:

```python
# tighter per-IP limit, plus a per-email limit that survives IP rotation
@router.post("/login")
@limiter.limit("5/minute", key_func=get_real_ip)
@limiter.limit("10/hour",  key_func=lambda r: r.state.login_email)   # populated below
async def login(request: Request, req: LoginRequest) -> Dict[str, Any]:
    request.state.login_email = req.email.lower().strip()
    # ... rest ...
```

Add a persisted lockout: after N failed attempts for an email in M minutes, return 429 for that email for T minutes, from a redis `incr`/`expire` pair (`login:fails:<email>` and `login:lock:<email>`).

**Verify**
- From a single real IP, send 20 login requests with 20 different fake `X-Forwarded-For` values. 15 must receive 429.
- Repeated bad passwords for a real email get locked out after N attempts regardless of IP rotation.

---

### C5 — Move the token out of `localStorage` and tighten CSP

Two independent moves that together kill XSS-driven account takeover.

**Switch to an httpOnly, SameSite=Strict cookie set by your backend.** The frontend never touches the token.

**File: `backend/app/routers/auth.py`** — login response sets the cookie:

```python
from fastapi.responses import JSONResponse

response = JSONResponse({
    "status": "success",
    "user_id": user_id,
    "display_name": display_name,
    "is_pro": is_pro,
})
response.set_cookie(
    key="adaptcode_session",
    value=access_token,
    max_age=60 * 60,                 # 1 hour, matches Supabase JWT lifetime
    httponly=True,
    secure=True,                      # requires HTTPS; set False only in local dev
    samesite="strict",
    path="/",
)
return response
```

**File: `backend/app/core/dependencies.py`** — read the token from the cookie, not the header:

```python
async def get_current_user(request: Request) -> CurrentUser:
    token = request.cookies.get("adaptcode_session")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return await _verify_supabase_jwt(token)
```

**File: `frontend/src/lib/auth-context.tsx`** — delete every `localStorage.setItem/getItem('access_token')` and every `cached_user` write. The browser automatically sends the cookie on same-origin requests to your Next.js rewrite path (`/api/*`).

**File: `frontend/next.config.mjs`** — tighten the CSP:

```js
"Content-Security-Policy":
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-eval' 'wasm-unsafe-eval'; " +   // Monaco needs eval; drop 'unsafe-inline' and the CDN
  "style-src 'self' 'unsafe-inline'; " +                      // Tailwind inlines critical CSS; this stays
  "connect-src 'self' https://*.supabase.co; " +              // drop :8000 and :onrender from prod
  "font-src 'self' data: https://fonts.gstatic.com; " +
  "img-src 'self' data: blob:; " +
  "frame-ancestors 'none'; " +
  "object-src 'none'; " +
  "base-uri 'self'; " +
  "form-action 'self';"
```

Also add CSRF protection on cookie-bearing state-changing endpoints: issue a per-session CSRF token, require it in a header on POST/PATCH/PUT/DELETE, and reject when it doesn't match.

**Verify**
- `localStorage.getItem('access_token')` in the browser console on your prod site returns `null`.
- Opening devtools → Application → Cookies → shows `adaptcode_session` with `HttpOnly=true, Secure=true, SameSite=Strict`.
- `document.cookie` in the console does NOT include that cookie.
- A cross-origin POST from `evil.example` to your API without the CSRF header is rejected.

---

## HIGH

### H6 — One response body for every login failure, constant time

**File: `backend/app/routers/auth.py`** — collapse all failure branches into one and pad with a constant-time compare:

```python
import secrets, hmac

GENERIC_LOGIN_ERROR = HTTPException(status_code=401, detail="Invalid credentials.")

@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, req: LoginRequest):
    try:
        res = supabase.auth.sign_in_with_password({"email": req.email, "password": req.password})
        if not res.session:
            raise GENERIC_LOGIN_ERROR
        # ... success path ...
    except HTTPException:
        raise
    except Exception:
        # Burn a few ms to flatten timing between "no user" and "wrong password"
        hmac.compare_digest(secrets.token_bytes(32), secrets.token_bytes(32))
        raise GENERIC_LOGIN_ERROR
```

Make the register response generic too: don't leak "email already registered." Say "If this email is available, we've sent a confirmation link." and always return 200.

**Verify**
- Send login with a known-good email + bad password: body matches "Invalid credentials." exactly.
- Send login with a non-existent email: same body, same status, response time within ±20ms of the first case over 100 samples.

---

### H7 — Verify JWTs locally with Supabase's JWKS

**File: `backend/app/core/dependencies.py`** — add a cached JWKS verifier:

```python
import time, httpx
from jose import jwt, JWTError
from functools import lru_cache
from app.core.config import settings

JWKS_URL = f"{settings.SUPABASE_URL}/auth/v1/keys"
_JWKS_CACHE: dict = {"keys": None, "fetched_at": 0}
_JWKS_TTL   = 3600  # 1 hour

async def _get_jwks():
    now = time.time()
    if _JWKS_CACHE["keys"] and now - _JWKS_CACHE["fetched_at"] < _JWKS_TTL:
        return _JWKS_CACHE["keys"]
    async with httpx.AsyncClient(timeout=3.0) as client:
        r = await client.get(JWKS_URL)
        r.raise_for_status()
        _JWKS_CACHE["keys"] = r.json()
        _JWKS_CACHE["fetched_at"] = now
        return _JWKS_CACHE["keys"]

async def _verify_supabase_jwt(token: str) -> CurrentUser:
    try:
        jwks = await _get_jwks()
        claims = jwt.decode(
            token, jwks,
            algorithms=["ES256", "RS256"],
            audience="authenticated",
            issuer=f"{settings.SUPABASE_URL}/auth/v1",
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return CurrentUser(user_id=claims["sub"], jwt=token)
```

**Verify**
- Latency of authenticated endpoints drops noticeably (no per-request outbound call).
- Expired tokens produce 401 locally without any network hit.
- Tokens signed by a *different* Supabase project are rejected.

---

### H8 — Scrub logs

Switch to structured logging with an explicit field allowlist, strip exception messages to class + request id, and never log raw user input.

**File: `backend/app/core/logging.py`** (new):

```python
import logging, json, uuid
from contextvars import ContextVar

request_id_ctx: ContextVar[str] = ContextVar("request_id", default="-")

class RedactingFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "ts":     self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level":  record.levelname,
            "logger": record.name,
            "rid":    request_id_ctx.get(),
            "msg":    record.getMessage(),
        }
        if record.exc_info:
            payload["exc_type"] = record.exc_info[0].__name__
            # intentionally no exc value / traceback
        return json.dumps(payload)
```

Replace every `logger.error(f"...: {e}")` with `logger.error("operation failed", exc_info=True)`. The structured logger records the exception *type* and the request id; the exception *message* never leaves the server. If you need rich traces, send them to a dedicated error tracker (Sentry) with scrubbing rules enabled.

**Verify**
- `grep -rn "logger.*{e}" backend/app` returns nothing.
- A failing login writes a log line with `exc_type` but no body / email / stack.

---

### H9 — Harden CORS

**File: `backend/app/main.py`**:

```python
from urllib.parse import urlparse

allowed = [settings.FRONTEND_URL]
if settings.ENV == "development":
    allowed.append("http://localhost:3000")

for origin in allowed:
    parsed = urlparse(origin)
    assert parsed.scheme == "https" or settings.ENV == "development", f"Insecure CORS origin: {origin}"
    assert parsed.netloc, f"Malformed CORS origin: {origin}"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type", "X-CSRF-Token", "X-Request-Id"],
)
```

**Verify**
- Server refuses to boot if `FRONTEND_URL` is empty, `*`, or starts with `http://` in prod.
- CORS preflight from `evil.example` is denied.

---

### H10 — One auth path, or make both go through the same middleware

Pick one of two:

**Option A (cleanest)**: remove client-side Supabase from the frontend. All logins — email, Google OAuth — go through your `/api/auth/*` endpoints. The Google flow uses Supabase server-side via an "exchange code" endpoint on your backend.

```
browser → /api/auth/google/start   (your backend redirects to Supabase OAuth)
         ← Supabase redirects to /api/auth/google/callback
         → your backend exchanges the code with Supabase, sets your cookie
```

**Option B (if you want to keep Supabase OAuth client-side)**: have the browser immediately POST the Supabase session to your `/api/auth/supabase-session` endpoint, which verifies the Supabase JWT, applies the same rate-limiter and audit log, and returns your own httpOnly cookie. Then clear the Supabase localStorage.

Either way, the browser only ends up with one cookie, and every login event flows through one middleware stack.

**Verify**
- Rate-limit log shows OAuth and password logins both.
- Lockout policy applies regardless of login path.
- No `supabase.auth.*` call runs after initial login on authenticated pages.

---

## MEDIUM

### M11 — Rate-limit code execution per user

**File: `backend/app/routers/session.py` or wherever submission is**:

```python
@router.post("/submit")
@limiter.limit("20/minute", key_func=lambda r: r.state.user.user_id)
@limiter.limit("200/day",   key_func=lambda r: r.state.user.user_id)
async def submit(request: Request, user: CurrentUser = Depends(get_current_user), ...):
    ...
```

Also cap concurrent runs per user by `redis.incr('exec:running:<user_id>')` + `expire` + check against a ceiling (e.g., 2 concurrent).

**Verify**
- Scripted spam of `/submit` from one account hits 429 after the budget.

---

### M12 — Already handled in C5

Removed `unsafe-inline` for scripts and the jsdelivr source. Keep `unsafe-eval` only as long as Monaco needs it; evaluate `trusted-types` as a follow-up once Monaco supports it.

**Verify**
- Devtools → Issues → no CSP violation when loading Monaco.
- An injected `<script>alert(1)</script>` in a user bio field does not execute.

---

### M13 — Atomic register

Wrap sign-up and users-insert in one Supabase RPC or Postgres function, so the two writes succeed or fail together.

**New SQL function:**

```sql
CREATE OR REPLACE FUNCTION register_user(p_email text, p_display_name text, p_auth_uid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO users(user_id, email, display_name) VALUES (p_auth_uid, p_email, p_display_name);
  -- plus any other initial rows (mastery_scores defaults, etc.)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

Register flow: `sign_up` → on success, call `register_user(...)` via `rpc`. If the `rpc` fails, call Supabase admin API `auth.admin.deleteUser(auth_uid)` to roll back the auth row.

**Verify**
- Simulate a `register_user` failure (bad display name constraint): the auth user is deleted too; no orphans in Supabase Auth.

---

### M14 — Append-only audit log

New table `audit_log(id uuid pk, ts timestamptz default now(), actor uuid, action text, target uuid null, metadata jsonb)` with `INSERT`-only RLS. Insert on: login success, login failure, logout, role change (via the SECURITY DEFINER function), admin endpoint hits, failed authz.

Ship these rows to an external SIEM or at minimum a separate Supabase project. Rotate access to the audit project separately from the app.

**Verify**
- Simulate a role promotion: a row appears in `audit_log` with action = `role_change`, actor = admin uuid, target = promoted user.

---

### M15 — Strip migration/seed scripts from the deployed image

**File: `backend/Dockerfile`** — multi-stage build, final stage only copies the `app/` package and `requirements.txt`:

```dockerfile
FROM python:3.11-slim AS runtime
WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
# NO seed_db.py, NO fix_*.py, NO migrations/
USER 10001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Migrations run from CI with a short-lived service-key-holding image, not from the runtime image.

**Verify**
- `docker exec <runtime-container> ls /srv` shows only `app/` and `requirements.txt`.
- `docker exec <runtime-container> python seed_db.py` fails with "No such file."

---

## LOW / INFO

### L16 — `supabase.ts` guard

```ts
const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  throw new Error("Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}
export const supabase = createClient(url, key);
```

Or, if you're moving to the backend-cookie flow (C5 / H10), delete `supabase.ts` from the frontend entirely.

### L17 — Delete orphan tests and update `jest.setup.ts` to only mock what remains.

### L18 — Audit `docker-compose*.yml`: make sure `ports:` for Postgres, Redis, Piston are `127.0.0.1:xxxx:xxxx`, not `xxxx:xxxx` (which binds to `0.0.0.0`).

### L19 — HSTS at the edge:
- Vercel: project → settings → Security → enable HSTS.
- Cloudflare: SSL/TLS → Edge Certificates → HSTS → enable, 1 year, preload.

### L20 — Already covered by C3 (role write) and C2 (server-side RLS). The anon key being public is fine once RLS is strict.

---

## Order of operations

Day 1 (block the open fire): C1, C3, C4, C5 (cookie move at minimum; CSP tightening can follow).
Day 2 (close the big surfaces): C2, H7, H9, H10.
Day 3 (hygiene): H6, H8, M11, M12, M13, M14, M15.
Follow-up sprint: all L items + a pen-test retainer.

Hand this to the engineer doing the fix. Each section is self-contained — they shouldn't need to go back and ask what you meant.
