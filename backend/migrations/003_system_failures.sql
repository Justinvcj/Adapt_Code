CREATE TABLE IF NOT EXISTS system_failures (
    id SERIAL PRIMARY KEY,
    stage TEXT NOT NULL,
    occurred_at TIMESTAMPTZ DEFAULT now(),
    context JSONB
);
