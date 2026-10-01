CREATE OR REPLACE FUNCTION register_user(p_email text, p_display_name text, p_auth_uid uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO users(user_id, email, display_name) VALUES (p_auth_uid, p_email, p_display_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
