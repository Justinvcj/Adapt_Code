-- Migration: 2026_11_12_enable_rls_on_public_tables.sql
-- Description: Close the pre-existing Supabase advisor ERRORs for
--              RLS-disabled public tables.
--
-- Context: three tables in `public` had RLS off, so the Supabase anon key
-- (shipped to every browser via NEXT_PUBLIC_SUPABASE_ANON_KEY) could read
-- and write them directly via /rest/v1/*. For audit_log and
-- system_failures that is a straight data-exfil / tamper vector. For
-- problems it would let anyone overwrite the problem bank.
--
-- All three are accessed only from FastAPI with the service_role key,
-- which bypasses RLS. Enabling RLS without any policies locks anon and
-- authenticated out of the REST surface completely — exactly the shape
-- we want.
--
-- Verified 2026-11-12: `grep` over frontend/src found zero direct
-- Supabase reads of these tables. Every access path goes through the
-- backend.
--
-- Integrity: idempotent. ENABLE on an already-enabled table is a no-op.

ALTER TABLE public.audit_log       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems        ENABLE ROW LEVEL SECURITY;
