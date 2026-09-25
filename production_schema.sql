-- Production Schema Bootstrapper for AdaptCode Supabase

-- 1. Create BKT Params table
CREATE TABLE IF NOT EXISTS public.bkt_params (
    concept_tag text PRIMARY KEY,
    "L0" double precision NOT NULL,
    "T" double precision NOT NULL,
    "S" double precision NOT NULL,
    "G" double precision NOT NULL
);

-- 2. Insert initial global parameters
INSERT INTO public.bkt_params (concept_tag, "L0", "T", "S", "G")
VALUES
    ('basic_syntax', 0.30, 0.10, 0.20, 0.20),
    ('loops', 0.25, 0.08, 0.25, 0.25),
    ('arrays', 0.25, 0.08, 0.25, 0.25),
    ('strings', 0.25, 0.08, 0.25, 0.25),
    ('hashing', 0.20, 0.05, 0.30, 0.30),
    ('two_pointers', 0.20, 0.05, 0.30, 0.30),
    ('sliding_window', 0.20, 0.05, 0.30, 0.30),
    ('recursion', 0.15, 0.03, 0.35, 0.35),
    ('backtracking', 0.15, 0.03, 0.35, 0.35),
    ('binary_search', 0.15, 0.03, 0.35, 0.35),
    ('trees', 0.10, 0.02, 0.40, 0.40),
    ('dynamic_programming', 0.05, 0.01, 0.40, 0.40)
ON CONFLICT (concept_tag) DO NOTHING;

-- 3. Ensure global agent state exists (for LinUCB cold start)
CREATE TABLE IF NOT EXISTS public.agent_state (
    student_id uuid PRIMARY KEY,
    a_matrices jsonb NOT NULL,
    b_vectors jsonb NOT NULL,
    last_updated timestamp with time zone DEFAULT now()
);

-- Insert the global dummy user for global LinUCB matrices
INSERT INTO public.agent_state (student_id, a_matrices, b_vectors)
VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid, 
    '{}'::jsonb, 
    '{}'::jsonb
)
ON CONFLICT (student_id) DO NOTHING;
