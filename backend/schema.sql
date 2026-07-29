-- AdaptCode Database Schema for Supabase (PostgreSQL)

-- 1. Users Table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'admin'))
);

-- 2. Problems Table
CREATE TABLE problems (
    problem_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL, -- Markdown text
    concept_tag TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    test_cases JSONB NOT NULL, -- JSON array of input-output pairs
    hint_text TEXT,
    solution_code TEXT,
    solution_explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Sessions Table
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_number INT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    total_problems_attempted INT DEFAULT 0
);

-- 4. Session Events Table
CREATE TABLE session_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(session_id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES problems(problem_id) ON DELETE CASCADE,
    concept_tag TEXT NOT NULL,
    difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    compile_errors INT DEFAULT 0,
    time_on_task_seconds INT NOT NULL,
    hint_used BOOLEAN DEFAULT FALSE,
    attempt_count INT DEFAULT 1,
    abandoned BOOLEAN DEFAULT FALSE,
    final_verdict TEXT CHECK (final_verdict IN ('Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded', 'Abandoned')),
    reward_signal NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Mastery Scores Table
CREATE TABLE mastery_scores (
    record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    concept_tag TEXT NOT NULL,
    mastery_probability NUMERIC(4,3) DEFAULT 0.000, -- From 0.0 to 1.0
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, concept_tag) -- Ensure one row per student per concept
);

-- 6. Agent State Table (LinUCB parameters)
CREATE TABLE agent_state (
    student_id UUID PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    a_matrices JSONB NOT NULL, -- JSON serialized NumPy arrays
    b_vectors JSONB NOT NULL, -- JSON serialized NumPy arrays
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
