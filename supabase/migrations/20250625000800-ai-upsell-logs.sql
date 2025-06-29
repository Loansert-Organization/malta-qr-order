-- Track AI upsell suggestions and outcomes
CREATE TABLE IF NOT EXISTS ai_upsell_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  bar_id UUID REFERENCES bars(id) ON DELETE SET NULL,
  cart_items JSONB NOT NULL,
  suggestions JSONB NOT NULL,
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE ai_upsell_logs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert but not select
CREATE POLICY "Anonymous can insert upsell logs" ON ai_upsell_logs
  FOR INSERT WITH CHECK (auth.role() = 'anon');

CREATE POLICY "Admins can view logs" ON ai_upsell_logs
  FOR SELECT USING (is_admin()); 