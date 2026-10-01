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
