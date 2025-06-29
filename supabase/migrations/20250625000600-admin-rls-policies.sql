-- Create admin role enum if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
  END IF;
END$$;

-- Add role column to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'customer';

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS for bars table
ALTER TABLE bars ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view active bars" ON bars;
DROP POLICY IF EXISTS "Vendors can view own bars" ON bars;
DROP POLICY IF EXISTS "Vendors can update own bars" ON bars;
DROP POLICY IF EXISTS "Admins have full access to bars" ON bars;

-- Bars policies
CREATE POLICY "Public can view active bars" ON bars
  FOR SELECT USING (is_active = true);

CREATE POLICY "Vendors can view own bars" ON bars
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update own bars" ON bars
  FOR UPDATE USING (auth.uid() = vendor_id)
  WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Admins have full access to bars" ON bars
  FOR ALL USING (is_admin());

-- RLS for menus table
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Public can view reviewed menus" ON menus;
DROP POLICY IF EXISTS "Vendors can manage own menus" ON menus;
DROP POLICY IF EXISTS "Admins have full access to menus" ON menus;

-- Menus policies
CREATE POLICY "Public can view reviewed menus" ON menus
  FOR SELECT USING (
    is_reviewed = true AND 
    EXISTS (SELECT 1 FROM bars WHERE bars.id = menus.bar_id AND bars.is_active = true)
  );

CREATE POLICY "Vendors can manage own menus" ON menus
  FOR ALL USING (
    EXISTS (SELECT 1 FROM bars WHERE bars.id = menus.bar_id AND bars.vendor_id = auth.uid())
  );

CREATE POLICY "Admins have full access to menus" ON menus
  FOR ALL USING (is_admin());

-- RLS for orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Vendors can view bar orders" ON orders;
DROP POLICY IF EXISTS "Admins have full access to orders" ON orders;

-- Orders policies
CREATE POLICY "Customers can view own orders" ON orders
  FOR SELECT USING (
    auth.uid()::text = customer_id OR 
    (customer_id IS NULL AND auth.uid() IS NOT NULL)
  );

CREATE POLICY "Vendors can view bar orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bars WHERE bars.id = orders.bar_id AND bars.vendor_id = auth.uid())
  );

CREATE POLICY "Admins have full access to orders" ON orders
  FOR ALL USING (is_admin());

-- RLS for payments table
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Vendors can view bar payments" ON payments;
DROP POLICY IF EXISTS "Admins have full access to payments" ON payments;

-- Payments policies
CREATE POLICY "Vendors can view bar payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      JOIN bars ON bars.id = orders.bar_id 
      WHERE orders.id = payments.order_id 
      AND bars.vendor_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to payments" ON payments
  FOR ALL USING (is_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_bars_vendor_id ON bars(vendor_id);

-- Grant execute permission on admin check function
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated; 