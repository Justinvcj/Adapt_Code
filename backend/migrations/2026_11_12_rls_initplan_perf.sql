-- Wrap auth.uid() in a scalar subquery so Postgres evaluates it once per query
-- instead of once per row. Pure performance; the predicate value is identical.
-- Advisor: auth_rls_initplan (15 WARN findings before this migration).
-- https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

ALTER POLICY "Users can modify own active problem state" ON public.active_problem_state
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can view own active problem state" ON public.active_problem_state
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can modify own agent state" ON public.agent_state
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can view own agent state" ON public.agent_state
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can insert own explanations" ON public.explanations
  WITH CHECK ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own explanations" ON public.explanations
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can view own explanations" ON public.explanations
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can update own mastery scores" ON public.mastery_scores
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can view own mastery scores" ON public.mastery_scores
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can insert own session events" ON public.session_events
  WITH CHECK ((select auth.uid()) = student_id);

ALTER POLICY "Users can view own session events" ON public.session_events
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can insert own sessions" ON public.sessions
  WITH CHECK ((select auth.uid()) = student_id);

ALTER POLICY "Users can view own sessions" ON public.sessions
  USING ((select auth.uid()) = student_id);

ALTER POLICY "Users can only select their own profile" ON public.users
  USING ((select auth.uid()) = user_id);

ALTER POLICY "Users can update their own profile (except role)" ON public.users
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
