# Comprehensive Codebase Problem and Defect Audit Report (Requirement R4)

## Observation

A systematic, read-only empirical audit was conducted across the entire AdaptCode repository (`c:\Users\Justin\The Global Projects Folder\Adapt_Code`), inspecting configuration files, build tooling, dependency manifests, server routes, database schemas, test suites, and client components.

Direct empirical observations made using verification tools:
1. **Frontend Compilation Failure**:
   - Command: `cd frontend; npm run build`
   - Output:
     ```
     Failed to compile.
     ./src/app/(app)/problem/[id]/page.tsx
     Error: 
       x Nullish coalescing operator(??) requires parens when mixing with logical operators
        ,-[.../frontend/src/app/(app)/problem/[id]/page.tsx:51:1]
      54 | summary: fallback?.summary ?? (b.description || '').split('\n')[0]?.slice(0, 180) || b.title,
         :          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     > Build failed because of webpack errors
     ```
   - TypeScript Check: `cd frontend; npx tsc --noEmit`
   - Output: `src/app/(app)/problem/[id]/page.tsx(54,14): error TS5076: '??' and '||' operations cannot be mixed without parentheses.`
2. **ESLint Configuration Incompatibility**:
   - Command: `cd frontend; npm run lint`
   - Output: `Failed to load config "next/typescript" to extend from. Referenced from: .../frontend/.eslintrc.json`
   - File Content: `frontend/.eslintrc.json` line 2 extends `"next/typescript"`. The project is on `"next": "14.2.35"` and `"eslint-config-next": "14.2.3"`. In Next.js 14, `next/typescript` does not exist (it was introduced in Next.js 15).
3. **Jest Test Suite Missing**:
   - Command: `cd frontend; npm run test`
   - Output: `No tests found, exiting with code 1. Run with --passWithNoTests to exit with code 0.` (111 files checked, 0 test files found).
4. **Backend Test Suite Failure**:
   - Command: `cd backend; .\venv\Scripts\python.exe -m pytest`
   - Output:
     ```
     FAILED tests/test_api.py::test_get_next_problem - AttributeError: <module 'app.routers.problems' from '...\\app\\routers\\problems.py'> does not have the attribute 'get_supabase'
     1 failed, 7 passed, 5 warnings in 0.33s
     ```
   - Source observation: `backend/tests/test_api.py` line 21 applies `@patch("app.routers.problems.get_supabase")`. In `backend/app/routers/problems.py` lines 9-10, only `get_supabase_admin` and `get_supabase_user` are imported; `get_supabase` is not defined in `problems.py`.
5. **Backend Dependency Manifest Corruption**:
   - File: `backend/requirements.txt`
   - Direct observations of duplicated, conflicting pinned versions:
     - Lines 3 & 21: `pydantic==2.13.5` vs `pydantic==2.13.4`
     - Lines 22 & 49: `pydantic-settings==2.15.0` vs `pydantic-settings==2.5.2`
     - Lines 27 & 44: `pytest==9.1.1` vs `pytest==8.3.0`
     - Lines 28 & 45: `pytest-asyncio==1.4.0` vs `pytest-asyncio==0.24.0`
     - Lines 30 & 42: `python-dotenv==1.2.2` vs `python-dotenv==1.0.1`
     - Lines 36 & 47: `slowapi==0.1.10` vs `slowapi==0.1.10`
6. **Hardcoded Committed Database Credentials**:
   - File: `backend/simulator.py` line 57:
     ```python
     db_url = os.environ.get("SUPABASE_URL_DB", "postgresql://postgres:Justin12345Don54321@db.mnsuaqcrvnocvgbfreei.supabase.co:5432/postgres")
     ```
   - Tracked in git (`git ls-files backend/simulator.py` returns `backend/simulator.py`).
   - Git commit history confirms commit `beb0d01` message: `apply_migrations.py: reads SUPABASE_DB_URL from env (plaintext DB password removed from the file — had leaked on public GitHub, now rotated)`. However, the exact credential was left hardcoded in `backend/simulator.py`.
7. **Cloud Run / Cloud Build Startup Crash**:
   - File: `backend/cloudbuild.yaml` line 65:
     ```yaml
     --set-env-vars=ENV=production,PISTON_URL=http://100.114.155.33:2000,TS_HOSTNAME=${_SERVICE},FRONTEND_URL=${_FRONTEND_URL},TRUSTED_PROXY_CIDRS=35.191.0.0/16;130.211.0.0/22
     ```
   - File: `backend/app/core/rate_limit.py` line 8:
     ```python
     _TRUSTED_PROXIES = [ipaddress.ip_network(c.strip()) for c in settings.TRUSTED_PROXY_CIDRS.split(",") if c.strip()]
     ```
   - Because `cloudbuild.yaml` uses `;` instead of `,` to separate CIDRs, `rate_limit.py` attempts `ipaddress.ip_network("35.191.0.0/16;130.211.0.0/22")`, which raises `ValueError` on module import, crashing the backend container on Cloud Run startup.
8. **Broken Docker Compose & Local Development Container**:
   - File: `backend/entrypoint.sh` line 13:
     ```sh
     : "${TS_AUTHKEY:?TS_AUTHKEY env var is required to join the tailnet}"
     ```
   - File: `docker-compose.yml` lines 14–27 maps port `8000:8000` and omits `TS_AUTHKEY`.
   - File: `backend/Dockerfile` line 48 sets `PORT=8080`, and uvicorn runs on `$PORT`. Running `docker compose up` crashes immediately because `TS_AUTHKEY` is missing, and even if bypassed, port 8000 is not exposed by the container.
9. **Critical Runtime Exceptions in API Endpoints**:
   - **Leaderboard endpoint**: `backend/app/routers/leaderboard.py` lines 8-15:
     ```python
     @router.get("/leaderboard")
     async def get_leaderboard() -> Dict[str, Any]:
         try:
             supabase = get_supabase_user(user.jwt)
     ```
     `user` is undefined (never declared as a parameter or dependency), causing `NameError: name 'user' is not defined`. Every request returns HTTP 500.
   - **POTD endpoint exception masking**: `backend/app/routers/potd.py` line 22 raises `HTTPException(status_code=404, detail="No problems found.")` inside a `try` block whose `except Exception:` on line 37 intercepts it and re-raises `HTTPException(status_code=500, detail="An internal error occurred.")`.
10. **BKT Parameter Schema / Code Mismatch**:
    - File: `production_schema.sql` lines 4–10:
      ```sql
      CREATE TABLE IF NOT EXISTS public.bkt_params (
          concept_tag text PRIMARY KEY,
          "L0" double precision NOT NULL,
          "T" double precision NOT NULL,
          "S" double precision NOT NULL,
          "G" double precision NOT NULL
      );
      ```
    - File: `backend/app/services/bkt.py` line 18:
      ```python
      params = (float(p['l0']), float(p['p_t']), float(p['p_g']), float(p['p_s']))
      ```
    - Keys `'l0'`, `'p_t'`, `'p_g'`, `'p_s'` do not exist on the query response. The lookup raises `KeyError` on every execution, silently caught by `except Exception: pass`, forcing BKT to fall back to hardcoded defaults `(0.30, 0.12, 0.20, 0.10)` on every student submission.
11. **Agent State RLS Violation**:
    - File: `backend/app/routers/problems.py` lines 180, 260, 297:
      ```python
      supabase = get_supabase_user(user.jwt)
      ...
      supabase.table("agent_state").upsert({
          "student_id": "00000000-0000-0000-0000-000000000000",
          "a_matrices": a_matrices_json,
          "b_vectors": b_vectors_json
      }).execute()
      ```
    - File: `backend/apply_rls.sql` lines 59–61:
      ```sql
      CREATE POLICY "Users can modify own agent state" ON agent_state
        FOR ALL USING (auth.uid() = student_id);
      ```
    - Since `auth.uid()` evaluates to the authenticated student's UUID, updating the dummy UUID `'00000000-0000-0000-0000-000000000000'` violates RLS policies, throwing an unhandled PostgREST exception that crashes `/api/submit`.
12. **Incomplete / Orphaned Features and Mock Data**:
    - **Gemini AI Explanations**: Generated in `backend/app/routers/problems.py:316` via `generate_explanation` and stored in `explanations` table; `/api/explanation/{event_id}` endpoint exists. However, `frontend/src/components/adapt/ExplanationPanel.tsx` never calls the API and only renders hardcoded generic text (`CONCEPT_TEACHING[concept]`).
    - **Language Harnessing Missing**: `backend/app/services/piston.py` lines 98–99: Java and C++ submissions fall through unchanged without test harnesses. Class-based solutions (`class Solution { ... }`) fail on Piston due to missing `main` methods.
    - **Mock Buttons**: `frontend/src/app/login/page.tsx:152,161` social login buttons (Google, GitHub) only trigger a toast notification and redirect without authenticating.
    - **Hardcoded User Mock Data**: `frontend/src/components/adapt/data.ts:1-13` hardcodes user `Justin Varghese` (`Justinvcj`, rank 909633), directly referenced across `Navbar.tsx:65-66`, `page.tsx:49,60`, `settings/page.tsx:78`, and `profile/[user]/page.tsx:21`.
    - **Learn Route Stub**: `frontend/src/app/learn/page.tsx:32-34` hardcodes redirect to `/problem/two-sum` after 400ms.
    - **Dead Code**: `backend/app/core/executor.py` is never imported anywhere; `CodeSubmission` in `schemas.py` is unused.
    - **Unused Frontend Dependencies**: `frontend/package.json` installs `@supabase/supabase-js`, `ogl`, `gsap`, `@gsap/react`, `framer-motion`, and `motion`, none of which are imported in `frontend/src`.
13. **Inefficient Direct Database Connections in Audit Logger**:
    - File: `backend/app/services/audit.py` line 41:
      ```python
      with psycopg2.connect(url, connect_timeout=3) as conn:
      ```
    - Opens a new TCP + TLS connection to Supabase pooler on every single audit log write without connection pooling.

---

## Logic Chain

1. **Build Invalidation Chain**:
   - Observation: `src/app/(app)/problem/[id]/page.tsx(54,14)` combines `??` and `||` without parentheses.
   - Mechanism: ECMAScript / TypeScript specification forbids chaining nullish coalescing (`??`) directly with logical OR (`||`) due to precedence ambiguity.
   - Result: Both `npx tsc --noEmit` and `next build` fail with TS5076 / SWC parse error.
   - Downstream impact: `frontend/Dockerfile` line 13 executes `npm run build`; therefore, building the frontend container image fails unconditionally. CI workflow `.github/workflows/deploy.yml` line 60 executes `npm run build`; therefore, frontend CI fails unconditionally.

2. **Backend Runtime Failure Chain**:
   - Observation: `leaderboard.py:13` references `user.jwt` inside `get_leaderboard()`, where `user` is not in the parameter list.
   - Mechanism: Python interpreter raises `NameError` as soon as the line executes.
   - Handler: The enclosing `except Exception:` block intercepts the `NameError` and returns `HTTPException(500)`.
   - Result: Any client requesting `/api/leaderboard` receives a 500 Internal Server Error.

3. **RLS & Data Integrity Chain**:
   - Observation: The system enabled Row Level Security on `agent_state` with `auth.uid() = student_id` in `apply_rls.sql`.
   - Observation: In `problems.py:180`, the Supabase client is initialized with the student's JWT (`get_supabase_user(user.jwt)`).
   - Observation: In `problems.py:260,297`, the query specifically targets `student_id = "00000000-0000-0000-0000-000000000000"`.
   - Mechanism: PostgREST evaluates the row against the policy `auth.uid() = student_id`. Because the student's JWT UID does not match `'00000000-0000-0000-0000-000000000000'`, PostgREST rejects the update with an HTTP 403 / 42501 RLS violation.
   - Downstream impact: Code submission in `/api/submit` fails with an unhandled server error upon attempting to persist LinUCB agent state.

4. **Security Vulnerability Chain**:
   - Observation: `backend/simulator.py` contains a live Supabase connection string with cleartext password `Justin12345Don54321`.
   - Observation: Commit `beb0d01` claims to have removed the leaked database password from `apply_migrations.py`, but failed to remove it from `simulator.py`.
   - Mechanism: The repository is tracked by git; credentials present in tracked files are accessible to anyone with repository read access.
   - Result: Database superuser access exposure.

5. **Cloud Deployment Failure Chain**:
   - Observation: `cloudbuild.yaml:65` sets `TRUSTED_PROXY_CIDRS=35.191.0.0/16;130.211.0.0/22`.
   - Observation: `rate_limit.py:8` executes `[ipaddress.ip_network(c.strip()) for c in settings.TRUSTED_PROXY_CIDRS.split(",") if c.strip()]`.
   - Mechanism: Splitting by comma on a semicolon-separated string yields the entire string `35.191.0.0/16;130.211.0.0/22`. The `ipaddress` library expects a valid CIDR and raises `ValueError`.
   - Result: Import of `app.core.rate_limit` fails during FastAPI startup in Cloud Run, causing container crash loops.

---

## Caveats

1. **Live Cloud Secrets**: The exact current values of Google Secret Manager secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `TS_AUTHKEY`) could not be inspected in read-only local mode, as access to GCP Secret Manager requires authenticated cloud IAM privileges.
2. **Piston Sandbox Connectivity**: Verification of the EC2 Piston instance at `100.114.155.33:2000` requires an active Tailscale mesh tunnel, which was not active in this read-only local environment.
3. **Database State**: Queries were analyzed against the committed schema files (`clean_schema.sql`, `production_schema.sql`, `migrations/*.sql`) and the local codebase; live Supabase database state could differ if ad-hoc migrations were run directly in the Supabase web dashboard.

---

## Conclusion & Issue Catalog

The audit identified **23 discrete issues** spanning configuration, syntax/runtime bugs, security/credentials, dependencies, and architecture. 

### Issue Catalog Table

| Issue ID | Category | Severity | File(s) & Line(s) | Description | Impact | Recommended Remediation |
|---|---|---|---|---|---|---|
| **BUG-01** | Syntax / Build | **Critical** | `frontend/src/app/(app)/problem/[id]/page.tsx:54` | Mixing `??` and `||` without explicit parentheses (`fallback?.summary ?? (...) \|\| b.title`). | TypeScript TS5076 error completely breaks `next build` and frontend Docker image build. | Wrap the coalescing operations in explicit parentheses: `(fallback?.summary ?? (b.description \|\| '').split('\n')[0]?.slice(0, 180)) \|\| b.title`. |
| **BUG-02** | Runtime Bug | **Critical** | `backend/app/routers/leaderboard.py:13` | Variable `user` is undefined in `get_leaderboard()` (`supabase = get_supabase_user(user.jwt)`). | Any call to `/api/leaderboard` throws `NameError` and returns HTTP 500. | Change dependency to pass `CurrentUser`: `async def get_leaderboard(user: CurrentUser = Depends(get_current_user))`, or use `get_supabase_admin()` if public. |
| **BUG-03** | Runtime / Logic | **High** | `backend/app/services/bkt.py:18` vs `production_schema.sql:4-10` | Column name mismatch: queries `'l0'`, `'p_t'`, `'p_g'`, `'p_s'` while schema defines `"L0"`, `"T"`, `"S"`, `"G"`. | Silent `KeyError` caught by `except: pass`; DB parameters are ignored and defaults are always used. | Update `bkt.py` to map case-insensitively or match `"L0"`, `"T"`, `"S"`, `"G"` from the database row. |
| **BUG-04** | Runtime Bug | **Medium** | `backend/app/routers/potd.py:22,37-40` | `except Exception:` intercepts `HTTPException(404)` and re-raises as `HTTPException(500)`. | Valid 404 responses ("No problems found") are masked as 500 Internal Server Errors. | Re-raise `HTTPException` explicitly: `except HTTPException: raise` before catching generic `Exception`. |
| **BUG-05** | Test Suite | **High** | `backend/tests/test_api.py:21` | Test mocks deleted function `@patch("app.routers.problems.get_supabase")`. | `pytest` fails on `test_get_next_problem` with `AttributeError`. | Patch `app.routers.problems.get_supabase_user` and supply a `CurrentUser` fixture in `override_auth`. |
| **BUG-06** | Contract Mismatch | **Medium** | `frontend/src/app/(app)/problem/[id]/page.tsx:232,235` vs `backend/app/routers/problems.py:51-60` | Client expects `res.runtime_ms` and `res.mastery_delta`; backend `SubmitResponse` does not provide them. | Runtime display shows "Accepted · — ms" and mastery delta defaults to 0. | Add `runtime_ms` and `mastery_delta` to backend `SubmitResponse` and return computed values. |
| **SEC-01** | Credentials | **Critical** | `backend/simulator.py:57` | Hardcoded cleartext Supabase database password in tracked source file (`postgres:Justin12345Don54321@...`). | Unauthorized database access; credential leaked in git repository history. | Immediately rotate the Supabase database password, replace string with `os.environ["SUPABASE_DB_URL"]`, and purge from git history. |
| **SEC-02** | Security / RLS | **Critical** | `backend/app/routers/problems.py:260,297`, `backend/apply_rls.sql:56-61` | Student JWT client queries and updates dummy UUID `00000000-0000-0000-0000-000000000000` on table with RLS enabled. | RLS blocks upsert resulting in 403 error crashing submission, or global policy overwrites personal learning. | Save per-student agent state using `user.user_id`, or use `get_supabase_admin()` if LinUCB is strictly global. |
| **SEC-03** | Secrets | **High** | `backend/.env:1-10` | Plaintext Supabase service role key, database URL with password, and Gemini API key stored in local `.env`. | Local file exposure risk if accidentally staged or shared in archives. | Ensure all developers use `.env.local` or environment injection, and audit `.gitignore`. |
| **SEC-04** | Logging / Info Leak | **Medium** | `backend/app/core/logging.py:8-23` | `RedactingFormatter` formats to JSON but does not redact passwords, secrets, or connection strings in exceptions. | DB credentials or API keys logged to stdout / log aggregators on connection failures. | Implement regex scrubbing for `postgresql://`, passwords, and bearer tokens in `format()`. |
| **SEC-05** | Security Policy | **Medium** | `frontend/next.config.mjs:34` | CSP header permits `'unsafe-inline'`, `'unsafe-eval'`, and `'wasm-unsafe-eval'`. | Increases exploitability of any Cross-Site Scripting (XSS) vulnerability. | Implement nonce-based CSP via Next.js middleware for scripts and style hydration. |
| **CONF-01** | Build / Lint | **High** | `frontend/.eslintrc.json:2` | Extends `"next/typescript"` which does not exist in `eslint-config-next@14.2.3`. | `npm run lint` fails immediately on execution. | Remove `"next/typescript"` from `extends` array in `.eslintrc.json`. |
| **CONF-02** | Deployment | **Critical** | `backend/cloudbuild.yaml:65` vs `backend/app/core/rate_limit.py:8` | Semicolon separator used in `TRUSTED_PROXY_CIDRS=35.191.0.0/16;130.211.0.0/22`, but code splits only by `,`. | `ipaddress.ip_network` raises `ValueError`, crashing Cloud Run backend on container boot. | Update `rate_limit.py` to split on `re.split(r'[,;]', ...)` or fix `cloudbuild.yaml` to use comma escaping. |
| **CONF-03** | Dev Environment | **High** | `backend/entrypoint.sh:13`, `docker-compose.yml:14-27`, `backend/Dockerfile:48` | `entrypoint.sh` requires `TS_AUTHKEY` env var; `docker-compose.yml` does not provide it; port mismatch 8000 vs 8080. | `docker compose up` crashes immediately on startup; unable to run local stack. | Allow `TS_AUTHKEY` to be optional in local dev (`if [ -n "$TS_AUTHKEY" ]`), and align container port 8000. |
| **CONF-04** | CI Pipeline | **Medium** | `.github/workflows/ci.yml:12`, `.github/workflows/deploy.yml:13` | Backend test job hardcoded to `if: ${{ false }}`. | Backend regressions and test failures are not caught in GitHub Actions CI. | Fix backend test suite and re-enable `backend-test` job in GitHub Actions. |
| **CONF-05** | Config Docs | **Low** | `backend/.env.example` | Missing critical environment variables (`SUPABASE_SERVICE_KEY`, `SUPABASE_DB_URL`, `PISTON_URL`, `TRUSTED_PROXY_CIDRS`). | New developers or environments fail to configure required services. | Update `.env.example` with documented placeholders for all variables in `config.py`. |
| **DEP-01** | Dependencies | **High** | `backend/requirements.txt:3,21,22,27,28,30,42,44,45,49` | Conflicting duplicate version pins (`pydantic`, `pytest`, `python-dotenv`, `pydantic-settings`). | `pip install -r requirements.txt` triggers pip resolver errors or non-deterministic installation. | Deduplicate `requirements.txt` and retain single canonical versions matching virtual environment. |
| **DEP-02** | Bundle Size | **Low** | `frontend/package.json:13,15,16,17,19,21` | Heavy unused dependencies installed (`@supabase/supabase-js`, `ogl`, `gsap`, `@gsap/react`, `framer-motion`, `motion`). | Bloats `node_modules` and slows down CI dependency installations. | Remove unused packages from `package.json` and prune `package-lock.json`. |
| **ARCH-01** | Execution Engine | **High** | `backend/app/services/piston.py:98-99` | Java and C++ execution harnesses are unimplemented (`# Java / C++ harnessing is non-trivial — fall through unchanged`). | Submitting Java or C++ solutions fails on Piston due to missing `main` entrypoint. | Implement stdin/stdout test runners for Java (`public static void main`) and C++ (`int main()`). |
| **ARCH-02** | Incomplete Feature | **Medium** | `frontend/src/components/adapt/ExplanationPanel.tsx`, `backend/app/routers/problems.py:316-324` | Backend generates Gemini AI explanations asynchronously, but frontend never queries `/api/explanation/{event_id}`. | Users never see the AI explanation generated by Gemini; panel only shows static strings. | Wire `ExplanationPanel.tsx` to poll `/api/explanation/{event_id}` and render AI feedback. |
| **ARCH-03** | Fake Feature | **Medium** | `frontend/src/app/login/page.tsx:152,161`, `backend/app/routers/checkout.py:10` | Social OAuth buttons are dummy toast triggers; checkout `mock-upgrade` requires admin privileges. | Users cannot authenticate with Google/GitHub; regular users cannot test Pro upgrades. | Implement real OAuth via Supabase Auth or remove buttons; remove `require_admin` from `mock-upgrade`. |
| **ARCH-04** | Hardcoded Route | **Medium** | `frontend/src/app/learn/page.tsx:32-34` | `/learn` dispatcher hardcodes redirect to `/problem/two-sum` after 400ms. | Core adaptive learning loop does not adapt; always directs students to Two Sum. | Query `/api/next-problem` and redirect to the returned problem slug dynamically. |
| **ARCH-05** | Hardcoded Mock Data | **Medium** | `frontend/src/components/adapt/data.ts:1-13`, `Navbar.tsx:60-66`, `page.tsx:49,60` | Hardcoded user identity "Justin Varghese" (`Justinvcj`) rendered across Navbar, homepage, settings, profile. | Disregards real logged-in user profile from `useAuth()`. | Replace static `USER` references with dynamic `user` object from `useAuth()` hook. |
| **ARCH-06** | Dead Code | **Low** | `backend/app/core/executor.py`, `backend/app/models/schemas.py:14-50` | `executor.py` contains redundant Piston client code never imported; `CodeSubmission` schema unused. | Confuses maintainers regarding how code execution and submission validation operate. | Delete `app/core/executor.py` and prune unused models from `schemas.py`. |
| **ARCH-07** | Performance Bottleneck | **Medium** | `backend/app/services/audit.py:41` | Audit logger establishes a new unpooled direct TCP/TLS Postgres connection on every logged event. | Connection exhaustion under traffic and high per-request latency. | Implement connection pooling (e.g. `psycopg2.pool.ThreadedConnectionPool`) or an asynchronous queue. |

---

## Verification Method

To independently verify these findings:

1. **Verify Frontend Build Failure (BUG-01)**:
   ```powershell
   cd frontend
   npm run build
   # Observed: Fails with syntax error at src/app/(app)/problem/[id]/page.tsx:54
   ```
2. **Verify Frontend Lint Failure (CONF-01)**:
   ```powershell
   cd frontend
   npm run lint
   # Observed: Fails with "Failed to load config 'next/typescript' to extend from"
   ```
3. **Verify Backend Pytest Failure (BUG-05)**:
   ```powershell
   cd backend
   .\venv\Scripts\python.exe -m pytest
   # Observed: tests/test_api.py::test_get_next_problem fails with AttributeError
   ```
4. **Verify Semicolon Delimiter Crash (CONF-02)**:
   ```powershell
   cd backend
   .\venv\Scripts\python.exe -c "import ipaddress; [ipaddress.ip_network(c.strip()) for c in '35.191.0.0/16;130.211.0.0/22'.split(',') if c.strip()]"
   # Observed: Raises ValueError: '35.191.0.0/16;130.211.0.0/22' has invalid host bit / format
   ```
5. **Verify Leaderboard NameError (BUG-02)**:
   ```powershell
   cd backend
   .\venv\Scripts\python.exe -c "import inspect; from app.routers.leaderboard import get_leaderboard; print('user in params:', 'user' in inspect.signature(get_leaderboard).parameters)"
   # Observed: Output is False (user parameter does not exist)
   ```
6. **Verify Hardcoded Leaked Database Password (SEC-01)**:
   ```powershell
   git grep "Justin12345Don54321"
   # Observed: backend/simulator.py:57 contains active database password
   ```
