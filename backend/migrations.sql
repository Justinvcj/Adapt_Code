-- AdaptCode: Phase 5 Schema Migrations

-- 1. Create a table to track active problem sessions (replaces in-memory dicts)
CREATE TABLE IF NOT EXISTS active_problem_state (
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    start_time NUMERIC NOT NULL,
    hint_used BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (student_id, problem_id)
);


-- 2. Update agent_state if it's missing the a_matrices or b_vectors (just in case simulator broke it)
-- Note: agent_state already uses student_id as PRIMARY KEY, which is correct.

-- 3. Update session_events to allow 'Pending' (Optional, if we want to log start events)
ALTER TABLE session_events DROP CONSTRAINT IF EXISTS session_events_final_verdict_check;
ALTER TABLE session_events ADD CONSTRAINT session_events_final_verdict_check 
    CHECK (final_verdict IN ('Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded', 'Abandoned', 'Pending'));
