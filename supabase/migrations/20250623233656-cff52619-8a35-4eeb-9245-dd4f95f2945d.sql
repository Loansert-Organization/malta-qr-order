
-- Create missing tables for vendor applications and related functionality
CREATE TABLE IF NOT EXISTS public.vendor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  business_email TEXT NOT NULL,
  business_phone TEXT,
  location TEXT,
  business_type TEXT,
  description TEXT,
  website_url TEXT,
  instagram_handle TEXT,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vendor documents table
CREATE TABLE IF NOT EXISTS public.vendor_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.vendor_applications(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create verification checklist table
CREATE TABLE IF NOT EXISTS public.verification_checklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES public.vendor_applications(id) ON DELETE CASCADE,
  business_license BOOLEAN DEFAULT false,
  food_safety_cert BOOLEAN DEFAULT false,
  insurance_docs BOOLEAN DEFAULT false,
  bank_details BOOLEAN DEFAULT false,
  identity_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create QR scan logs table
CREATE TABLE IF NOT EXISTS public.qr_scan_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  table_id TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  user_agent TEXT,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create menu analytics table
CREATE TABLE IF NOT EXISTS public.menu_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  total_orders INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  avg_rating NUMERIC DEFAULT 0,
  last_ordered_at TIMESTAMP WITH TIME ZONE,
  revenue_trend TEXT DEFAULT 'stable',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to vendors table
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS is_open BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS current_wait_time INTEGER,
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique constraint on vendor slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'vendors_slug_key') THEN
    ALTER TABLE public.vendors ADD CONSTRAINT vendors_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Update existing vendors to have slugs if they don't have them
UPDATE public.vendors 
SET slug = LOWER(REPLACE(business_name, ' ', '-')) 
WHERE slug IS NULL OR slug = '';

-- Enable RLS on new tables
ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor applications (admin access only)
CREATE POLICY "Admin can view all vendor applications" ON public.vendor_applications
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admin can update vendor applications" ON public.vendor_applications
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for vendor documents (admin access only)
CREATE POLICY "Admin can view all vendor documents" ON public.vendor_documents
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for verification checklist (admin access only)
CREATE POLICY "Admin can manage verification checklist" ON public.verification_checklist
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Create RLS policies for QR scan logs (vendors can see their own)
CREATE POLICY "Vendors can view their QR scan logs" ON public.qr_scan_logs
  FOR SELECT USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));

-- Create RLS policies for menu analytics (vendors can see their own)
CREATE POLICY "Vendors can view their menu analytics" ON public.menu_analytics
  FOR SELECT USING (vendor_id IN (SELECT id FROM public.vendors WHERE user_id = auth.uid()));
