-- Log client actions like reorders for analytics
CREATE TABLE IF NOT EXISTS user_action_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action TEXT NOT NULL,
  item_ids UUID[] NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE user_action_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous users can insert their own actions
CREATE POLICY "Anon insert logs" ON user_action_logs
  FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Admins view logs" ON user_action_logs
  FOR SELECT USING (is_admin()); 