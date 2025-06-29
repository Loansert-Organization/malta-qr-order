-- AI Waiter feature tables --------------------------------------------------
-- 1. Root conversation/session
CREATE TABLE IF NOT EXISTS ai_waiter_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  bar_id UUID REFERENCES bars(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

-- 2. Message log
CREATE TABLE IF NOT EXISTS ai_waiter_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES ai_waiter_sessions(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user','assistant')) NOT NULL,
  content TEXT NOT NULL,
  processing_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Feedback (thumbs)
CREATE TABLE IF NOT EXISTS ai_waiter_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES ai_waiter_messages(id) ON DELETE CASCADE,
  rating INT CHECK (rating IN (-1,1)) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------- RLS --------------------------------------------
-- Enable RLS
ALTER TABLE ai_waiter_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_waiter_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_waiter_feedback ENABLE ROW LEVEL SECURITY;

-- Helper: current user or anon uid
CREATE OR REPLACE FUNCTION public.current_uid()
  RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE sql STABLE;

-- Session policy: user can access their own session rows (anonymous allowed)
CREATE POLICY "session owner CRUD" ON ai_waiter_sessions
  FOR ALL
  USING (user_id IS NULL OR user_id = public.current_uid())
  WITH CHECK (user_id IS NULL OR user_id = public.current_uid());

-- Messages: access via session ownership
CREATE POLICY "own session messages" ON ai_waiter_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ai_waiter_sessions s
      WHERE s.id = ai_waiter_messages.session_id
        AND (s.user_id IS NULL OR s.user_id = public.current_uid())
    )
  )
  WITH CHECK (true);

-- Feedback: same rule via message -> session
CREATE POLICY "own feedback" ON ai_waiter_feedback
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM ai_waiter_messages m
      JOIN ai_waiter_sessions s ON s.id = m.session_id
      WHERE m.id = ai_waiter_feedback.message_id
        AND (s.user_id IS NULL OR s.user_id = public.current_uid())
    )
  )
  WITH CHECK (true);

-- Grant anonymous insert/select as covered by RLS
GRANT SELECT, INSERT ON ai_waiter_sessions TO authenticated;
GRANT SELECT, INSERT ON ai_waiter_messages TO authenticated;
GRANT SELECT, INSERT ON ai_waiter_feedback TO authenticated; 