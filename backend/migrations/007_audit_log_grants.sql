-- audit_log is a server-side-only append log, written by the backend using a
-- fresh service_role client (see app/core/database.py#new_supabase_admin).
-- No role other than service_role should ever read or write it, and we don't
-- rely on RLS because the shared admin client's role identity drifts when the
-- login handler signs a user in on it.
--
-- Idempotent (safe to re-run).

ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert only for everyone" ON audit_log;
DROP POLICY IF EXISTS "No read access" ON audit_log;
DROP POLICY IF EXISTS "No update access" ON audit_log;
DROP POLICY IF EXISTS "No delete access" ON audit_log;
DROP POLICY IF EXISTS "allow_audit_inserts" ON audit_log;

REVOKE ALL ON audit_log FROM PUBLIC;
REVOKE ALL ON audit_log FROM anon, authenticated;
GRANT INSERT, SELECT ON audit_log TO service_role;
