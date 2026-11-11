-- Migration: 2026_11_11_login_attempts.sql
-- Description: Idempotent table definition for per-identity failed-login lockout (Requirement R1).
-- Integrity: Safe to re-run; does NOT drop tables, columns, or data.

CREATE TABLE IF NOT EXISTS public.login_attempts (
    email text PRIMARY KEY,
    failed_count int NOT NULL DEFAULT 0,
    first_failed_at timestamptz,
    locked_until timestamptz
);

-- Index on locked_until for fast expiration checks and cleanup queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_locked_until ON public.login_attempts (locked_until);

-- Enable Row Level Security (service_role retains full access; anon/authenticated denied direct access)
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
