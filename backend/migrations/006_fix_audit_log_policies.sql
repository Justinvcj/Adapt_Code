-- Make audit_log inserts work from both the service_role admin client AND any
-- authenticated user. Reads/updates/deletes stay denied — audit_log is
-- write-only from the application's perspective.
--
-- Idempotent (safe to re-run).

DROP POLICY IF EXISTS "Insert only for everyone" ON audit_log;
DROP POLICY IF EXISTS "allow_audit_inserts" ON audit_log;
CREATE POLICY "allow_audit_inserts" ON audit_log
    FOR INSERT
    TO public
    WITH CHECK (true);

GRANT INSERT ON audit_log TO authenticated, anon, service_role;
