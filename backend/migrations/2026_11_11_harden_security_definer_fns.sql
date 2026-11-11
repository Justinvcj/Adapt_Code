-- Migration: 2026_11_11_harden_security_definer_fns.sql
-- Description: Lock down pre-existing SECURITY DEFINER functions flagged by
--              the Supabase advisor. `register_user` is only ever called
--              server-side from FastAPI with the service_role key; the
--              anon/authenticated REST surface has no legitimate reason to
--              invoke it directly. `promote_user_to_admin` has its own
--              auth.uid() admin check but also does not belong on the public
--              RPC surface.
--
-- Also pins search_path on all SECURITY DEFINER / trigger functions, to
-- defuse the search-path hijack amplifier reported by the linter.
--
-- Integrity: idempotent. REVOKE / GRANT / ALTER FUNCTION are all re-runnable.

REVOKE EXECUTE ON FUNCTION public.register_user(text, text, uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.register_user(text, text, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.register_user(text, text, uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.register_user(text, text, uuid) TO service_role;

REVOKE EXECUTE ON FUNCTION public.promote_user_to_admin(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.promote_user_to_admin(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.promote_user_to_admin(uuid) FROM authenticated;
GRANT  EXECUTE ON FUNCTION public.promote_user_to_admin(uuid) TO service_role;

ALTER FUNCTION public.register_user(text, text, uuid)       SET search_path = public, pg_temp;
ALTER FUNCTION public.promote_user_to_admin(uuid)           SET search_path = public, pg_temp;
ALTER FUNCTION public.prevent_role_self_edit()              SET search_path = public, pg_temp;
ALTER FUNCTION public.get_leaderboard_stats()               SET search_path = public, pg_temp;
