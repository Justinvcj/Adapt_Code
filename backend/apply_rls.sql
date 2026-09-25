-- 1. Enable RLS on all sensitive tables
ALTER TABLE mastery_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_problem_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for users to only see and update their own data
-- Users Table
CREATE POLICY "Users can only select their own profile" ON users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile" ON users
  FOR UPDATE USING (auth.uid() = user_id);

-- Mastery Scores
CREATE POLICY "Users can view own mastery scores" ON mastery_scores
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can update own mastery scores" ON mastery_scores
  FOR ALL USING (auth.uid() = student_id);

-- Session Events
CREATE POLICY "Users can view own session events" ON session_events
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own session events" ON session_events
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Sessions
CREATE POLICY "Users can view own sessions" ON sessions
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Active Problem State
CREATE POLICY "Users can view own active problem state" ON active_problem_state
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can modify own active problem state" ON active_problem_state
  FOR ALL USING (auth.uid() = student_id);

-- Agent State
CREATE POLICY "Users can view own agent state" ON agent_state
  FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can modify own agent state" ON agent_state
  FOR ALL USING (auth.uid() = student_id);

-- Note: The `problems` table can remain public for SELECT since all users need to fetch problems.
-- Ensure you have appropriate admin policies if you need admins to view all data.

ALTER TABLE explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own explanations" ON explanations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own explanations" ON explanations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own explanations" ON explanations FOR UPDATE USING (auth.uid() = user_id);

