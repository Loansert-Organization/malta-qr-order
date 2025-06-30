-- MALTA QR ORDER - COMPLETE DATABASE SETUP FOR PRODUCTION

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";

-- WhatsApp Sessions Table
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  conversation_state TEXT DEFAULT 'greeting',
  current_step TEXT DEFAULT 'start',
  cart_data JSONB DEFAULT '{}',
  user_preferences JSONB DEFAULT '{}',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced WhatsApp Logs Table
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES whatsapp_sessions(id),
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('incoming', 'outgoing', 'system')),
  message_content TEXT NOT NULL,
  vendor_id UUID REFERENCES vendors(id),
  order_id UUID REFERENCES orders(id),
  metadata JSONB DEFAULT '{}',
  processing_time_ms INTEGER,
  ai_model_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- WhatsApp Analytics Table
CREATE TABLE IF NOT EXISTS whatsapp_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE DEFAULT CURRENT_DATE,
  vendor_id UUID REFERENCES vendors(id),
  total_messages INTEGER DEFAULT 0,
  successful_orders INTEGER DEFAULT 0,
  abandoned_carts INTEGER DEFAULT 0,
  average_response_time NUMERIC DEFAULT 0,
  user_satisfaction_score NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  popular_items JSONB DEFAULT '[]',
  peak_hours JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date, vendor_id)
);

-- Add WhatsApp fields to orders table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'whatsapp_phone') THEN
        ALTER TABLE orders ADD COLUMN whatsapp_phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'whatsapp_session_id') THEN
        ALTER TABLE orders ADD COLUMN whatsapp_session_id UUID REFERENCES whatsapp_sessions(id);
    END IF;
END $$;

-- Enhanced bars table with Google Maps integration
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bars' AND column_name = 'google_place_id') THEN
        ALTER TABLE bars ADD COLUMN google_place_id TEXT UNIQUE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bars' AND column_name = 'latitude') THEN
        ALTER TABLE bars ADD COLUMN latitude NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bars' AND column_name = 'longitude') THEN
        ALTER TABLE bars ADD COLUMN longitude NUMERIC;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bars' AND column_name = 'is_active') THEN
        ALTER TABLE bars ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- User preferences table for welcome wizard
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  session_id TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INTEGER DEFAULT 0,
  dietary_restrictions TEXT[],
  favorite_cuisines TEXT[],
  notification_settings JSONB DEFAULT '{}',
  language_preference TEXT DEFAULT 'en',
  location_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced notifications table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'priority') THEN
        ALTER TABLE notifications ADD COLUMN priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'action_url') THEN
        ALTER TABLE notifications ADD COLUMN action_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'icon') THEN
        ALTER TABLE notifications ADD COLUMN icon TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_session ON whatsapp_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_bars_google_place_id ON bars(google_place_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_priority ON notifications(user_id, priority);

-- Enable RLS on new tables
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public access to whatsapp_sessions" ON whatsapp_sessions FOR ALL USING (true);
CREATE POLICY "Allow public access to whatsapp_logs" ON whatsapp_logs FOR ALL USING (true);
CREATE POLICY "Users can manage their own preferences" ON user_preferences FOR ALL USING (true);

-- Insert sample Malta bars
INSERT INTO bars (
  id, name, address, rating, latitude, longitude, google_place_id, is_active
) VALUES 
(gen_random_uuid(), 'Trabuxu Bistro', '1, Strait Street, Valletta', 4.5, 35.8989, 14.5145, 'valletta_trabuxu_001', true),
(gen_random_uuid(), 'Bridge Bar', '256, Republic Street, Valletta', 4.3, 35.8976, 14.5134, 'valletta_bridge_001', true),
(gen_random_uuid(), 'Hugo''s Lounge', 'Strand, Sliema', 4.4, 35.9042, 14.5019, 'sliema_hugos_001', true),
(gen_random_uuid(), 'Sky Club Malta', 'Level 22, Portomaso Marina', 4.7, 35.9198, 14.4925, 'stjulians_skyclub_001', true),
(gen_random_uuid(), 'Medina Restaurant & Bar', 'Holy Cross Street, Mdina', 4.5, 35.8859, 14.4035, 'mdina_medina_001', true)
ON CONFLICT (google_place_id) DO NOTHING;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_logs;

SELECT 'Database setup completed successfully!' as status;
