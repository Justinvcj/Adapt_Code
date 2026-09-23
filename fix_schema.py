with open("backend/schema.sql", "a") as f:
    f.write("""

-- 9. Explanations Table (Added via Fix N8)
CREATE TABLE IF NOT EXISTS explanations (
    explanation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_event_id UUID NOT NULL REFERENCES session_events(event_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    what_went_wrong TEXT,
    why_approach_fails TEXT,
    concept_to_review TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_explanations_event_unique ON explanations(session_event_id);

-- 10. Users Table Alteration (Added via Fix N8)
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- 11. Performance Indexes (Added via Fix N6)
CREATE INDEX IF NOT EXISTS idx_session_events_student_id ON session_events(student_id);
CREATE INDEX IF NOT EXISTS idx_session_events_student_verdict ON session_events(student_id, final_verdict);
CREATE INDEX IF NOT EXISTS idx_mastery_scores_student_id ON mastery_scores(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_started ON sessions(student_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_state_student_id ON agent_state(student_id);
CREATE INDEX IF NOT EXISTS idx_problems_concept_difficulty ON problems(concept_tag, difficulty_level);
""")
print("Done updating schema.sql")
