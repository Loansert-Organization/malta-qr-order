-- Create system_logs table for audit trail
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_type TEXT NOT NULL,
  admin_id UUID REFERENCES auth.users(id),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  error_message TEXT
);

-- Create indexes for performance
CREATE INDEX idx_system_logs_admin_id ON system_logs(admin_id);
CREATE INDEX idx_system_logs_action_type ON system_logs(action_type);
CREATE INDEX idx_system_logs_resource_type ON system_logs(resource_type);
CREATE INDEX idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX idx_system_logs_status ON system_logs(status);

-- Enable RLS
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view all logs" ON system_logs
  FOR SELECT USING (is_admin());

-- System can insert logs
CREATE POLICY "System can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_status TEXT DEFAULT 'success',
  p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO system_logs (
    action_type,
    admin_id,
    resource_type,
    resource_id,
    metadata,
    status,
    error_message
  ) VALUES (
    p_action_type,
    auth.uid(),
    p_resource_type,
    p_resource_id,
    p_metadata,
    p_status,
    p_error_message
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger functions for automatic logging
CREATE OR REPLACE FUNCTION log_bar_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_admin_action('create_bar', 'bars', NEW.id::TEXT, row_to_json(NEW)::JSONB);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM log_admin_action('update_bar', 'bars', NEW.id::TEXT, jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    ));
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_admin_action('delete_bar', 'bars', OLD.id::TEXT, row_to_json(OLD)::JSONB);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_menu_moderation() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_reviewed = false AND NEW.is_reviewed = true THEN
    PERFORM log_admin_action('approve_menu', 'menus', NEW.id::TEXT, jsonb_build_object(
      'bar_id', NEW.bar_id,
      'item_name', NEW.name,
      'price', NEW.price
    ));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION log_order_override() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.payment_status != NEW.payment_status AND is_admin() THEN
    PERFORM log_admin_action('override_order_status', 'orders', NEW.id::TEXT, jsonb_build_object(
      'old_status', OLD.payment_status,
      'new_status', NEW.payment_status,
      'bar_id', NEW.bar_id,
      'amount', NEW.total_amount
    ));
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER tr_log_bar_changes
  AFTER INSERT OR UPDATE OR DELETE ON bars
  FOR EACH ROW
  WHEN (is_admin())
  EXECUTE FUNCTION log_bar_changes();

CREATE TRIGGER tr_log_menu_moderation
  AFTER UPDATE ON menus
  FOR EACH ROW
  WHEN (is_admin())
  EXECUTE FUNCTION log_menu_moderation();

CREATE TRIGGER tr_log_order_override
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_override();

-- Create system health monitoring table
CREATE TABLE IF NOT EXISTS system_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'down')),
  last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time_ms INTEGER,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Insert default services
INSERT INTO system_health (service_name, status) VALUES
  ('supabase_database', 'healthy'),
  ('supabase_auth', 'healthy'),
  ('supabase_storage', 'healthy'),
  ('edge_functions', 'healthy'),
  ('ai_tools', 'healthy'),
  ('payment_gateway', 'healthy')
ON CONFLICT (service_name) DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION log_admin_action TO authenticated;
GRANT SELECT ON system_health TO authenticated; 