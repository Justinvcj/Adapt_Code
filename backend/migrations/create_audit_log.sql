CREATE TABLE audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ts timestamptz DEFAULT now(),
    actor uuid,
    action text NOT NULL,
    target uuid,
    metadata jsonb
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert only for everyone" ON audit_log
    FOR INSERT
    WITH CHECK (true);

-- Deny read/update/delete to all roles except superuser/service_role
CREATE POLICY "No read access" ON audit_log FOR SELECT USING (false);
CREATE POLICY "No update access" ON audit_log FOR UPDATE USING (false);
CREATE POLICY "No delete access" ON audit_log FOR DELETE USING (false);
