
-- 1. Create system UUIDs to replace "system" strings
INSERT INTO vendors (id, name, slug, location, description, active) 
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'System', 'system', 'Malta', 'System vendor for AI operations', true),
  ('00000000-0000-0000-0000-000000000002', 'Anonymous', 'anonymous', 'Malta', 'Anonymous guest operations', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create a function to get system UUID
CREATE OR REPLACE FUNCTION get_system_uuid() 
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$$ LANGUAGE plpgsql;

-- 3. Create a function to get anonymous UUID  
CREATE OR REPLACE FUNCTION get_anonymous_uuid()
RETURNS UUID AS $$
BEGIN
  RETURN '00000000-0000-0000-0000-000000000002'::UUID;
END;
$$ LANGUAGE plpgsql;

-- 4. Fix existing invalid UUID entries in ai_waiter_logs
UPDATE ai_waiter_logs 
SET vendor_id = get_system_uuid()
WHERE vendor_id::text = 'system' OR vendor_id::text = '00000000-0000-0000-0000-000000000000';

-- 5. Create proper order status enum
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status_enum') THEN
    CREATE TYPE order_status_enum AS ENUM (
      'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'
    );
  END IF;
END
$$;

-- 6. Create guest sessions table for proper anonymous handling
CREATE TABLE IF NOT EXISTS guest_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::JSONB
);

-- 7. Enable RLS on guest_sessions
ALTER TABLE guest_sessions ENABLE ROW LEVEL SECURITY;

-- 8. Create policy for guest sessions
CREATE POLICY "Anyone can manage guest sessions" ON guest_sessions
FOR ALL TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 9. Add system_logs table for better error tracking
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_type TEXT NOT NULL,
  component TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Enable RLS on system_logs
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- 11. Create policy for system logs (admin only)
CREATE POLICY "Admins can view system logs" ON system_logs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
