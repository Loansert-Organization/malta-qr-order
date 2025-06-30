-- WhatsApp AI Agent - Database Schema
-- Created: 2024-06-30
-- Purpose: Complete WhatsApp integration with autonomous ordering

-- WhatsApp Sessions Table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  current_cart JSONB DEFAULT '[]',
  conversation_step TEXT DEFAULT 'greeting',
  preferences JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_history TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced WhatsApp Logs Table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  direction TEXT CHECK (direction IN ('incoming', 'outgoing')) NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  status TEXT DEFAULT 'sent',
  response_time_ms INTEGER,
  ai_model_used TEXT,
  intent_detected TEXT,
  confidence_score DECIMAL(3,2),
  error_message TEXT,
  retries SMALLINT DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Bot Analytics
CREATE TABLE IF NOT EXISTS whatsapp_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE DEFAULT CURRENT_DATE,
  phone_number TEXT,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  
  -- Conversation metrics
  messages_sent INTEGER DEFAULT 0,
  messages_received INTEGER DEFAULT 0,
  conversations_started INTEGER DEFAULT 0,
  conversations_completed INTEGER DEFAULT 0,
  
  -- Order metrics
  orders_initiated INTEGER DEFAULT 0,
  orders_completed INTEGER DEFAULT 0,
  cart_abandonment_rate DECIMAL(5,2),
  average_order_value DECIMAL(10,2),
  
  -- Performance metrics
  average_response_time_ms INTEGER,
  success_rate DECIMAL(5,2),
  error_rate DECIMAL(5,2),
  
  -- AI metrics
  intent_accuracy DECIMAL(5,2),
  fallback_rate DECIMAL(5,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(date, phone_number, vendor_id)
);

-- WhatsApp Quick Replies/Templates
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  template_type TEXT CHECK (template_type IN ('text', 'interactive', 'media')),
  content JSONB NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add WhatsApp fields to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_order BOOLEAN DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS whatsapp_session_id UUID REFERENCES whatsapp_sessions(id);

-- Add WhatsApp fields to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS whatsapp_enabled BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS whatsapp_welcome_message TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS whatsapp_auto_confirm BOOLEAN DEFAULT true;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_vendor ON whatsapp_sessions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_activity ON whatsapp_sessions(last_activity);

CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_phone ON whatsapp_logs(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_vendor ON whatsapp_logs(vendor_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_direction ON whatsapp_logs(direction);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_created ON whatsapp_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_date ON whatsapp_analytics(date);
CREATE INDEX IF NOT EXISTS idx_whatsapp_analytics_vendor ON whatsapp_analytics(vendor_id);

-- Row Level Security
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can read whatsapp sessions" ON whatsapp_sessions FOR SELECT USING (true);
CREATE POLICY "Service role can manage whatsapp sessions" ON whatsapp_sessions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read whatsapp logs" ON whatsapp_logs FOR SELECT USING (true);
CREATE POLICY "Service role can manage whatsapp logs" ON whatsapp_logs FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Admins can view whatsapp analytics" ON whatsapp_analytics FOR SELECT USING (is_admin());
CREATE POLICY "Service role can manage whatsapp analytics" ON whatsapp_analytics FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Public can read whatsapp templates" ON whatsapp_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage whatsapp templates" ON whatsapp_templates FOR ALL USING (is_admin());

-- Functions for WhatsApp analytics
CREATE OR REPLACE FUNCTION update_whatsapp_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily analytics when new message is logged
  INSERT INTO whatsapp_analytics (
    date, 
    phone_number, 
    vendor_id,
    messages_sent,
    messages_received
  ) VALUES (
    CURRENT_DATE,
    NEW.phone_number,
    NEW.vendor_id,
    CASE WHEN NEW.direction = 'outgoing' THEN 1 ELSE 0 END,
    CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END
  )
  ON CONFLICT (date, phone_number, vendor_id) 
  DO UPDATE SET
    messages_sent = whatsapp_analytics.messages_sent + 
      CASE WHEN NEW.direction = 'outgoing' THEN 1 ELSE 0 END,
    messages_received = whatsapp_analytics.messages_received + 
      CASE WHEN NEW.direction = 'incoming' THEN 1 ELSE 0 END,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic analytics updates
CREATE TRIGGER trigger_update_whatsapp_analytics
  AFTER INSERT ON whatsapp_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_analytics();

-- Function to clean old WhatsApp sessions (cleanup inactive sessions after 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_whatsapp_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM whatsapp_sessions 
  WHERE last_activity < NOW() - INTERVAL '7 days'
  AND current_cart = '[]';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Insert sample WhatsApp templates
INSERT INTO whatsapp_templates (name, category, template_type, content) VALUES
('welcome_message', 'greeting', 'text', '{"text": "🇲🇹 Welcome to ICUPA Malta! I''m your AI dining assistant. Type ''start'' to begin ordering or ''help'' for assistance."}'),
('menu_categories', 'menu', 'interactive', '{"body": "Browse by category:", "action": {"buttons": [{"type": "reply", "reply": {"id": "cat_mains", "title": "🍽️ Main Courses"}}, {"type": "reply", "reply": {"id": "cat_drinks", "title": "🍹 Drinks"}}, {"type": "reply", "reply": {"id": "cat_desserts", "title": "🍰 Desserts"}}]}}'),
('order_confirmation', 'order', 'text', '{"text": "✅ Order confirmed! Order #{order_id}. Estimated time: {estimated_time} minutes. The restaurant will contact you when ready."}'),
('payment_options', 'payment', 'interactive', '{"body": "Choose payment method:", "action": {"buttons": [{"type": "reply", "reply": {"id": "pay_revolut", "title": "💳 Revolut"}}, {"type": "reply", "reply": {"id": "pay_cash", "title": "💵 Cash at pickup"}}]}}'),
('help_message', 'support', 'text', '{"text": "🤖 *ICUPA Malta AI Assistant*\n\nCommands:\n• ''start'' - Begin ordering\n• ''menu'' - Browse items\n• ''cart'' - View your order\n• ''help'' - Show this help\n\nJust chat naturally - I understand! 😊"}');

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_sessions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON whatsapp_logs TO anon, authenticated;
GRANT SELECT ON whatsapp_analytics TO anon, authenticated;
GRANT SELECT ON whatsapp_templates TO anon, authenticated;

-- Comments for documentation
COMMENT ON TABLE whatsapp_sessions IS 'Stores WhatsApp conversation sessions and cart state';
COMMENT ON TABLE whatsapp_logs IS 'Detailed logging of all WhatsApp interactions';
COMMENT ON TABLE whatsapp_analytics IS 'Daily analytics for WhatsApp bot performance';
COMMENT ON TABLE whatsapp_templates IS 'Reusable message templates for WhatsApp bot';

COMMENT ON COLUMN whatsapp_sessions.current_cart IS 'JSON array of cart items with quantities and prices';
COMMENT ON COLUMN whatsapp_sessions.conversation_step IS 'Current step in the ordering conversation flow';
COMMENT ON COLUMN whatsapp_sessions.preferences IS 'JSON object storing user preferences and dietary restrictions';

COMMENT ON COLUMN whatsapp_logs.intent_detected IS 'AI-detected user intent from the message';
COMMENT ON COLUMN whatsapp_logs.confidence_score IS 'Confidence score (0-1) for AI intent detection';
COMMENT ON COLUMN whatsapp_logs.response_time_ms IS 'Time taken to process and respond to the message';

-- Success message
SELECT 'WhatsApp AI Agent database schema created successfully!' as status; 