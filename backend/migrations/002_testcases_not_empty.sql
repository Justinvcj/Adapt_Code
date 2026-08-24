ALTER TABLE problems ADD CONSTRAINT problems_testcases_nonempty CHECK (jsonb_array_length(test_cases) > 0);
