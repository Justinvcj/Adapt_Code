-- Row Level Security for AdaptCode's student-owned tables.
-- Safe to re-run: every policy is DROP IF EXISTS + CREATE.

-- 1. Enable RLS on every sensitive table (ALTER ENABLE is idempotent).
ALTER TABLE mastery_scores        ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_problem_state  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state           ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE explanations          ENABLE ROW LEVEL SECURITY;

-- 2. Policies (drop-then-create for idempotency).

-- users
DROP POLICY IF EXISTS "Users can only select their own profile" ON users;
CREATE POLICY "Users can only select their own profile" ON users
  FOR SELECT USING (auth.uid() = user_id);

-- NOTE: the UPDATE policy for users is created by fix_role_escalation.sql
-- as "Users can update their own profile (except role)". Do NOT recreate it here.

-- mastery_scores
DROP POLICY IF EXISTS "Users can view own mastery scores" ON mastery_scores;
CREATE POLICY "Users can view own mastery scores" ON mastery_scores
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Users can update own mastery scores" ON mastery_scores;
CREATE POLICY "Users can update own mastery scores" ON mastery_scores
  FOR ALL USING (auth.uid() = student_id);

-- session_events
DROP POLICY IF EXISTS "Users can view own session events" ON session_events;
CREATE POLICY "Users can view own session events" ON session_events
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Users can insert own session events" ON session_events;
CREATE POLICY "Users can insert own session events" ON session_events
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- active_problem_state
DROP POLICY IF EXISTS "Users can view own active problem state" ON active_problem_state;
CREATE POLICY "Users can view own active problem state" ON active_problem_state
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Users can modify own active problem state" ON active_problem_state;
CREATE POLICY "Users can modify own active problem state" ON active_problem_state
  FOR ALL USING (auth.uid() = student_id);

-- agent_state
DROP POLICY IF EXISTS "Users can view own agent state" ON agent_state;
CREATE POLICY "Users can view own agent state" ON agent_state
  FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Users can modify own agent state" ON agent_state;
CREATE POLICY "Users can modify own agent state" ON agent_state
  FOR ALL USING (auth.uid() = student_id);

-- explanations
DROP POLICY IF EXISTS "Users can view own explanations" ON explanations;
CREATE POLICY "Users can view own explanations" ON explanations
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own explanations" ON explanations;
CREATE POLICY "Users can insert own explanations" ON explanations
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own explanations" ON explanations;
CREATE POLICY "Users can update own explanations" ON explanations
  FOR UPDATE USING (auth.uid() = user_id);

-- NOTE: the `problems` table stays public for SELECT since every student fetches
-- it. Our backend already strips hidden test_cases from GET /api/problems/{id}
-- for authenticated users (see backend/app/routers/problems.py).
