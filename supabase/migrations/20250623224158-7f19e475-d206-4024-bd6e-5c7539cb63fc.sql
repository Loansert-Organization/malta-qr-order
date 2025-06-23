
-- Add missing columns and tables for ICUPA Malta system

-- Update vendors table with additional fields
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS phone_number text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS opening_hours jsonb DEFAULT '{}';
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS contact_person text;

-- Create table for AI-generated layout suggestions
CREATE TABLE IF NOT EXISTS ai_layout_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  context_hash text NOT NULL,
  layout_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone DEFAULT (now() + interval '1 hour'),
  effectiveness_score integer DEFAULT 0
);

-- Create table for guest preferences and AI memory
CREATE TABLE IF NOT EXISTS guest_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  dietary_restrictions text[],
  favorite_categories text[],
  previous_orders jsonb DEFAULT '[]',
  ai_memory jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for AI waiter conversations
CREATE TABLE IF NOT EXISTS ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]',
  context_data jsonb DEFAULT '{}',
  satisfaction_rating integer,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create table for dynamic promotions
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  discount_type text CHECK (discount_type IN ('percentage', 'fixed_amount', 'bogo')),
  discount_value numeric,
  conditions jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for order feedback
CREATE TABLE IF NOT EXISTS order_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback_text text,
  ai_service_rating integer CHECK (ai_service_rating >= 1 AND ai_service_rating <= 5),
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for menu categories with smart sorting
CREATE TABLE IF NOT EXISTS smart_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  display_order integer DEFAULT 0,
  is_ai_managed boolean DEFAULT false,
  popularity_score numeric DEFAULT 0,
  time_based_rules jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create table for vendor notifications and alerts
CREATE TABLE IF NOT EXISTS vendor_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success')),
  read boolean DEFAULT false,
  action_required boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_layout_cache_vendor_context ON ai_layout_cache(vendor_id, context_hash);
CREATE INDEX IF NOT EXISTS idx_guest_preferences_session ON guest_preferences(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_promotions_vendor_active ON promotions(vendor_id, active);
CREATE INDEX IF NOT EXISTS idx_vendor_alerts_unread ON vendor_alerts(vendor_id, read);

-- Enable RLS on new tables
ALTER TABLE ai_layout_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_alerts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read ai_layout_cache" ON ai_layout_cache FOR SELECT USING (true);
CREATE POLICY "Public can read guest_preferences" ON guest_preferences FOR SELECT USING (true);
CREATE POLICY "Public can insert guest_preferences" ON guest_preferences FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update guest_preferences" ON guest_preferences FOR UPDATE USING (true);

CREATE POLICY "Public can read ai_conversations" ON ai_conversations FOR SELECT USING (true);
CREATE POLICY "Public can insert ai_conversations" ON ai_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update ai_conversations" ON ai_conversations FOR UPDATE USING (true);

CREATE POLICY "Public can read promotions" ON promotions FOR SELECT USING (active = true);
CREATE POLICY "Vendors can manage promotions" ON promotions FOR ALL USING (true);

CREATE POLICY "Public can insert order_feedback" ON order_feedback FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can read order_feedback" ON order_feedback FOR SELECT USING (true);

CREATE POLICY "Public can read smart_categories" ON smart_categories FOR SELECT USING (true);
CREATE POLICY "Vendors can manage smart_categories" ON smart_categories FOR ALL USING (true);

CREATE POLICY "Vendors can read vendor_alerts" ON vendor_alerts FOR SELECT USING (true);
CREATE POLICY "Vendors can update vendor_alerts" ON vendor_alerts FOR UPDATE USING (true);
