
-- ICUPA Malta: Enhanced Schema Migration
-- This migration adds new tables while preserving existing ones

-- ----------------------------------------------------------------
-- Extension and Type Definitions (only if not exists)
-- ----------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "postgis" WITH SCHEMA "extensions";

-- Create new enums only if they don't exist
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('client', 'vendor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.order_status AS ENUM ('new', 'preparing', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ----------------------------------------------------------------
-- Add missing columns to existing tables
-- ----------------------------------------------------------------

-- Update existing vendors table with new columns if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'business_name') THEN
        ALTER TABLE vendors ADD COLUMN business_name TEXT;
        UPDATE vendors SET business_name = name WHERE business_name IS NULL;
        ALTER TABLE vendors ALTER COLUMN business_name SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'category') THEN
        ALTER TABLE vendors ADD COLUMN category TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'location_text') THEN
        ALTER TABLE vendors ADD COLUMN location_text TEXT;
        UPDATE vendors SET location_text = location WHERE location_text IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'location_geo') THEN
        ALTER TABLE vendors ADD COLUMN location_geo GEOMETRY(Point, 4326);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'stripe_account_id') THEN
        ALTER TABLE vendors ADD COLUMN stripe_account_id TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'revolut_payment_link') THEN
        ALTER TABLE vendors ADD COLUMN revolut_payment_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'is_active') THEN
        ALTER TABLE vendors ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vendors' AND column_name = 'owner_id') THEN
        ALTER TABLE vendors ADD COLUMN owner_id UUID REFERENCES public.profiles(id);
    END IF;
END $$;

-- Update existing profiles table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE profiles ADD COLUMN full_name TEXT;
    END IF;
END $$;

-- Update existing menu_items table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'dietary_tags') THEN
        ALTER TABLE menu_items ADD COLUMN dietary_tags TEXT[];
    END IF;
END $$;

-- Update existing orders table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'client_id') THEN
        ALTER TABLE orders ADD COLUMN client_id UUID REFERENCES public.profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'table_identifier') THEN
        ALTER TABLE orders ADD COLUMN table_identifier TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'agreed_to_terms') THEN
        ALTER TABLE orders ADD COLUMN agreed_to_terms BOOLEAN NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'whatsapp_consent') THEN
        ALTER TABLE orders ADD COLUMN whatsapp_consent BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- ----------------------------------------------------------------
-- Create new tables
-- ----------------------------------------------------------------

-- Menu Categories (For Dynamic Sections)
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_smart_category BOOLEAN DEFAULT false,
    smart_rules JSONB
);

-- Item Modifiers
CREATE TABLE IF NOT EXISTS public.menu_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- QR Analytics (for tracking scans)
CREATE TABLE IF NOT EXISTS public.qr_analytics (
    id BIGSERIAL PRIMARY KEY,
    qr_code_id UUID NOT NULL REFERENCES public.qr_codes(id) ON DELETE CASCADE,
    scanned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_agent TEXT,
    ip_address TEXT
);

-- Order Heatmap Data (stores geolocation for heatmap visualization)
CREATE TABLE IF NOT EXISTS public.order_heatmap_data (
    id BIGSERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    location GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Suggestions (for personalized layouts)
CREATE TABLE IF NOT EXISTS public.ai_suggestions (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id),
    suggestion_type TEXT NOT NULL,
    suggestion_payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_applied BOOLEAN DEFAULT false
);

-- Agent Logs (for Kai, the AI Waiter)
CREATE TABLE IF NOT EXISTS public.agent_logs (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id),
    user_query TEXT,
    agent_response JSONB,
    satisfaction_score INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Menu QA Issues (for admin tool)
CREATE TABLE IF NOT EXISTS public.menu_qa_issues (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    issue_type TEXT NOT NULL,
    details TEXT,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add category_id to menu_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'menu_items' AND column_name = 'category_id') THEN
        ALTER TABLE menu_items ADD COLUMN category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add selected_modifiers to order_items if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_items' AND column_name = 'selected_modifiers') THEN
        ALTER TABLE order_items ADD COLUMN selected_modifiers JSONB;
    END IF;
END $$;

-- ----------------------------------------------------------------
-- Enable RLS on new tables
-- ----------------------------------------------------------------
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_heatmap_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_qa_issues ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- Additional RLS Policies for new tables
-- ----------------------------------------------------------------

-- Menu Categories: Public can view, vendors can manage their own
CREATE POLICY "Public can view menu categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their categories" ON public.menu_categories FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND vendor_id = public.menu_categories.vendor_id)
);

-- Menu Item Modifiers: Public can view, vendors can manage
CREATE POLICY "Public can view modifiers" ON public.menu_item_modifiers FOR SELECT USING (true);
CREATE POLICY "Vendors can manage modifiers" ON public.menu_item_modifiers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM menu_items mi 
        JOIN menus m ON mi.menu_id = m.id 
        JOIN profiles p ON p.vendor_id = m.vendor_id 
        WHERE mi.id = public.menu_item_modifiers.menu_item_id AND p.id = auth.uid()
    )
);

-- QR Analytics: Only admins can view
CREATE POLICY "Admins can view QR analytics" ON public.qr_analytics FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order Heatmap: Only admins can view
CREATE POLICY "Admins can view heatmap data" ON public.order_heatmap_data FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- AI Suggestions: Public can create, admins can view all
CREATE POLICY "Public can create AI suggestions" ON public.ai_suggestions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all AI suggestions" ON public.ai_suggestions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Agent Logs: Public can create, admins can view all
CREATE POLICY "Public can create agent logs" ON public.agent_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all agent logs" ON public.agent_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Menu QA Issues: Admins only
CREATE POLICY "Admins can manage QA issues" ON public.menu_qa_issues FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
