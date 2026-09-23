# M4: Authentication Security & Connection Pooling

## Objective
Secure the auth bypass mechanism and optimize database connection handling to prevent connection exhaustion.

## Context & Architectural Flaw
- **Connection Exhaustion:** Every router file calls `get_supabase()` at module level, spawning isolated PostgREST connection clients.
- **Security Bypass:** `DEV_TOKEN_` bypasses are hardcoded in `auth.py`. If `TEST_MODE` accidentally defaults to `True` in production, the system is fundamentally compromised.
- **Session Brittleness:** The auth context completely drops the user session on any API `500` error, destroying the UX during temporary offline states.

## Code-Level Execution Blueprint
1. **Target:** `backend/app/core/database.py`
   - Implement the Singleton pattern for the Supabase client:
     ```python
     _client = None
     def get_supabase() -> Client:
         global _client
         if _client is None: _client = create_client(URL, KEY)
         return _client
     ```
2. **Target:** `backend/app/main.py`
   - Add explicit startup assertion: `assert not settings.TEST_MODE, "CRITICAL: TEST_MODE active in production!"` (if `ENV=production`).
3. **Target:** `frontend/src/lib/auth-context.tsx`
   - Wrap fetch in a `try/catch`. Only `setToken(null)` if `err.status === 401`. Otherwise, flag `isOffline = true`.

## Verification Protocol
1. Monitor active DB connections in Supabase dashboard while load testing; assert < 10 active pools.
2. Simulate a network 500 error via proxy; verify the user is not automatically logged out.
