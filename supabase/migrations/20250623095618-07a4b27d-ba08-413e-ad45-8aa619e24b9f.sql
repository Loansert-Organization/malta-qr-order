
-- Remove existing RLS policies and create universal access policies for all tables

-- Vendors table
DROP POLICY IF EXISTS "All can read" ON public.vendors;
DROP POLICY IF EXISTS "All can write" ON public.vendors;
DROP POLICY IF EXISTS "All can update" ON public.vendors;
DROP POLICY IF EXISTS "All can delete" ON public.vendors;

CREATE POLICY "All can read" ON public.vendors
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.vendors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.vendors
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.vendors
  FOR DELETE USING (true);

-- Menus table
DROP POLICY IF EXISTS "All can read" ON public.menus;
DROP POLICY IF EXISTS "All can write" ON public.menus;
DROP POLICY IF EXISTS "All can update" ON public.menus;
DROP POLICY IF EXISTS "All can delete" ON public.menus;

CREATE POLICY "All can read" ON public.menus
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.menus
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.menus
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.menus
  FOR DELETE USING (true);

-- Menu Items table
DROP POLICY IF EXISTS "All can read" ON public.menu_items;
DROP POLICY IF EXISTS "All can write" ON public.menu_items;
DROP POLICY IF EXISTS "All can update" ON public.menu_items;
DROP POLICY IF EXISTS "All can delete" ON public.menu_items;

CREATE POLICY "All can read" ON public.menu_items
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.menu_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.menu_items
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.menu_items
  FOR DELETE USING (true);

-- Orders table
DROP POLICY IF EXISTS "All can read" ON public.orders;
DROP POLICY IF EXISTS "All can write" ON public.orders;
DROP POLICY IF EXISTS "All can update" ON public.orders;
DROP POLICY IF EXISTS "All can delete" ON public.orders;

CREATE POLICY "All can read" ON public.orders
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.orders
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.orders
  FOR DELETE USING (true);

-- Order Items table
DROP POLICY IF EXISTS "All can read" ON public.order_items;
DROP POLICY IF EXISTS "All can write" ON public.order_items;
DROP POLICY IF EXISTS "All can update" ON public.order_items;
DROP POLICY IF EXISTS "All can delete" ON public.order_items;

CREATE POLICY "All can read" ON public.order_items
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.order_items
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.order_items
  FOR DELETE USING (true);

-- AI Waiter Logs table
DROP POLICY IF EXISTS "All can read" ON public.ai_waiter_logs;
DROP POLICY IF EXISTS "All can write" ON public.ai_waiter_logs;
DROP POLICY IF EXISTS "All can update" ON public.ai_waiter_logs;
DROP POLICY IF EXISTS "All can delete" ON public.ai_waiter_logs;

CREATE POLICY "All can read" ON public.ai_waiter_logs
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.ai_waiter_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.ai_waiter_logs
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.ai_waiter_logs
  FOR DELETE USING (true);

-- Guest Sessions table
DROP POLICY IF EXISTS "Anyone can manage guest sessions" ON public.guest_sessions;
DROP POLICY IF EXISTS "All can read" ON public.guest_sessions;
DROP POLICY IF EXISTS "All can write" ON public.guest_sessions;
DROP POLICY IF EXISTS "All can update" ON public.guest_sessions;
DROP POLICY IF EXISTS "All can delete" ON public.guest_sessions;

CREATE POLICY "All can read" ON public.guest_sessions
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.guest_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.guest_sessions
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.guest_sessions
  FOR DELETE USING (true);

-- Profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "All can read" ON public.profiles;
DROP POLICY IF EXISTS "All can write" ON public.profiles;
DROP POLICY IF EXISTS "All can update" ON public.profiles;
DROP POLICY IF EXISTS "All can delete" ON public.profiles;

CREATE POLICY "All can read" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.profiles
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.profiles
  FOR DELETE USING (true);

-- QR Codes table
DROP POLICY IF EXISTS "All can read" ON public.qr_codes;
DROP POLICY IF EXISTS "All can write" ON public.qr_codes;
DROP POLICY IF EXISTS "All can update" ON public.qr_codes;
DROP POLICY IF EXISTS "All can delete" ON public.qr_codes;

CREATE POLICY "All can read" ON public.qr_codes
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.qr_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.qr_codes
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.qr_codes
  FOR DELETE USING (true);

-- Analytics table
DROP POLICY IF EXISTS "All can read" ON public.analytics;
DROP POLICY IF EXISTS "All can write" ON public.analytics;
DROP POLICY IF EXISTS "All can update" ON public.analytics;
DROP POLICY IF EXISTS "All can delete" ON public.analytics;

CREATE POLICY "All can read" ON public.analytics
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.analytics
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.analytics
  FOR DELETE USING (true);

-- Vendor Config table
DROP POLICY IF EXISTS "All can read" ON public.vendor_config;
DROP POLICY IF EXISTS "All can write" ON public.vendor_config;
DROP POLICY IF EXISTS "All can update" ON public.vendor_config;
DROP POLICY IF EXISTS "All can delete" ON public.vendor_config;

CREATE POLICY "All can read" ON public.vendor_config
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.vendor_config
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.vendor_config
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.vendor_config
  FOR DELETE USING (true);

-- Posters table
DROP POLICY IF EXISTS "All can read" ON public.posters;
DROP POLICY IF EXISTS "All can write" ON public.posters;
DROP POLICY IF EXISTS "All can update" ON public.posters;
DROP POLICY IF EXISTS "All can delete" ON public.posters;

CREATE POLICY "All can read" ON public.posters
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.posters
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.posters
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.posters
  FOR DELETE USING (true);

-- System Logs table
DROP POLICY IF EXISTS "Admins can view system logs" ON public.system_logs;
DROP POLICY IF EXISTS "All can read" ON public.system_logs;
DROP POLICY IF EXISTS "All can write" ON public.system_logs;
DROP POLICY IF EXISTS "All can update" ON public.system_logs;
DROP POLICY IF EXISTS "All can delete" ON public.system_logs;

CREATE POLICY "All can read" ON public.system_logs
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.system_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.system_logs
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.system_logs
  FOR DELETE USING (true);

-- Layout Suggestions table
DROP POLICY IF EXISTS "All can read" ON public.layout_suggestions;
DROP POLICY IF EXISTS "All can write" ON public.layout_suggestions;
DROP POLICY IF EXISTS "All can update" ON public.layout_suggestions;
DROP POLICY IF EXISTS "All can delete" ON public.layout_suggestions;

CREATE POLICY "All can read" ON public.layout_suggestions
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.layout_suggestions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.layout_suggestions
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.layout_suggestions
  FOR DELETE USING (true);

-- Guest UI Sessions table
DROP POLICY IF EXISTS "All can read" ON public.guest_ui_sessions;
DROP POLICY IF EXISTS "All can write" ON public.guest_ui_sessions;
DROP POLICY IF EXISTS "All can update" ON public.guest_ui_sessions;
DROP POLICY IF EXISTS "All can delete" ON public.guest_ui_sessions;

CREATE POLICY "All can read" ON public.guest_ui_sessions
  FOR SELECT USING (true);

CREATE POLICY "All can write" ON public.guest_ui_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "All can update" ON public.guest_ui_sessions
  FOR UPDATE USING (true);

CREATE POLICY "All can delete" ON public.guest_ui_sessions
  FOR DELETE USING (true);
