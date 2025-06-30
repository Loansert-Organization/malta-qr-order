-- ICUPA Home-Screen Database Schema
-- Created: $(date)

-- 1. Menu Categories
CREATE TABLE IF NOT EXISTS menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  icon text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price_local numeric NOT NULL,
  currency text DEFAULT 'RWF',
  image_url text,
  tags text[] DEFAULT '{}', -- ['vegan','spicy']
  is_available boolean DEFAULT true,
  prep_time_minutes int DEFAULT 15,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Carts
CREATE TABLE IF NOT EXISTS carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'ordered', 'abandoned')),
  table_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Cart Items
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid REFERENCES carts(id) ON DELETE CASCADE,
  item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  qty int DEFAULT 1 CHECK (qty > 0),
  special_instructions text,
  created_at timestamptz DEFAULT now()
);

-- 5. Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  cart_snapshot jsonb NOT NULL,
  total_local numeric NOT NULL,
  currency text DEFAULT 'RWF',
  table_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'served', 'closed')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  customer_name text,
  customer_phone text,
  special_requests text,
  estimated_prep_time int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. AI Draft Orders
CREATE TABLE IF NOT EXISTS ai_draft_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  payload jsonb NOT NULL,
  generated_for timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
  ai_reasoning text,
  created_at timestamptz DEFAULT now()
);

-- 7. User Profiles (for loyalty points)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE,
  session_id text,
  loyalty_points int DEFAULT 0,
  loyalty_tier text DEFAULT 'Bronze' CHECK (loyalty_tier IN ('Bronze', 'Silver', 'Gold', 'Platinum')),
  preferred_table text,
  dietary_preferences text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Promotions
CREATE TABLE IF NOT EXISTS promotions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  discount_percentage int,
  discount_amount numeric,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  applicable_items uuid[], -- menu item IDs
  applicable_categories uuid[], -- category IDs
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(is_active, valid_until);

-- Enable RLS on all tables
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_draft_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Menu categories and items: public read
CREATE POLICY "Allow public read on menu_categories" ON menu_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read on menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read on promotions" ON promotions FOR SELECT USING (is_active = true);

-- Carts: users can manage their own carts
CREATE POLICY "Users manage own carts" ON carts FOR ALL USING (
  auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
);

-- Cart items: through cart ownership
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM carts 
    WHERE carts.id = cart_items.cart_id 
    AND (carts.user_id = auth.uid() OR carts.session_id = current_setting('app.session_id', true))
  )
);

-- Orders: users can view their own orders
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (
  auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
);

CREATE POLICY "Users create own orders" ON orders FOR INSERT WITH CHECK (
  auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
);

-- AI draft orders: users manage their own
CREATE POLICY "Users manage own ai drafts" ON ai_draft_orders FOR ALL USING (
  auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
);

-- User profiles: users manage their own
CREATE POLICY "Users manage own profile" ON user_profiles FOR ALL USING (
  auth.uid() = user_id OR session_id = current_setting('app.session_id', true)
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_categories_updated_at BEFORE UPDATE ON menu_categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Seed data for development
INSERT INTO menu_categories (name, icon, sort_order) VALUES
('All', '🍽️', 0),
('Starters', '🥗', 1),
('Mains', '🍖', 2),
('Drinks', '🍹', 3),
('Desserts', '🍰', 4),
('Vegan', '🌱', 5),
('Trending', '🔥', 6)
ON CONFLICT DO NOTHING;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE carts;
ALTER PUBLICATION supabase_realtime ADD TABLE cart_items;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Success message
SELECT 'ICUPA Menu & Order schema created successfully!' as status;
