
-- Phase 1: Enhanced Data Architecture Implementation

-- Add missing columns to ai_waiter_logs for enhanced tracking
ALTER TABLE public.ai_waiter_logs 
ADD COLUMN ai_model_used TEXT,
ADD COLUMN processing_metadata JSONB,
ADD COLUMN satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5);

-- Create profiles table for user role management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role TEXT DEFAULT 'guest' CHECK (role IN ('guest', 'vendor', 'admin')),
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guest_ui_sessions for anonymous user tracking
CREATE TABLE public.guest_ui_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  device_fingerprint TEXT,
  location_context JSONB,
  interaction_history JSONB DEFAULT '[]'::jsonb,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create layout_suggestions for AI-generated UI layouts
CREATE TABLE public.layout_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  context_data JSONB NOT NULL,
  layout_config JSONB NOT NULL,
  ai_model_used TEXT,
  effectiveness_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendor_config for granular vendor settings
CREATE TABLE public.vendor_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE UNIQUE NOT NULL,
  happy_hour_enabled BOOLEAN DEFAULT false,
  happy_hour_start TIME,
  happy_hour_end TIME,
  dynamic_ui_enabled BOOLEAN DEFAULT true,
  ai_waiter_enabled BOOLEAN DEFAULT true,
  voice_search_enabled BOOLEAN DEFAULT true,
  weather_suggestions_enabled BOOLEAN DEFAULT true,
  config_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create qr_codes table for QR code management
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  code_type TEXT DEFAULT 'venue' CHECK (code_type IN ('venue', 'table', 'section')),
  table_number TEXT,
  qr_data TEXT NOT NULL,
  generated_url TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create posters table for marketing materials
CREATE TABLE public.posters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  template_name TEXT NOT NULL,
  poster_data JSONB NOT NULL,
  file_url TEXT,
  file_type TEXT CHECK (file_type IN ('pdf', 'png', 'jpg')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table for performance tracking
CREATE TABLE public.analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(vendor_id, date, metric_type)
);

-- Create terms_and_conditions table
CREATE TABLE public.terms_and_conditions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy_policy table
CREATE TABLE public.privacy_policy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  content TEXT NOT NULL,
  effective_date TIMESTAMP WITH TIME ZONE NOT NULL,
  active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_ui_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policy ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- RLS Policies for guest_ui_sessions (public access for anonymous users)
CREATE POLICY "Public can create guest sessions" ON public.guest_ui_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view guest sessions by session_id" ON public.guest_ui_sessions FOR SELECT USING (true);
CREATE POLICY "Public can update guest sessions" ON public.guest_ui_sessions FOR UPDATE USING (true);

-- RLS Policies for vendor-specific tables
CREATE POLICY "Vendors can manage their own config" ON public.vendor_config FOR ALL USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);

CREATE POLICY "Vendors can manage their QR codes" ON public.qr_codes FOR ALL USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);

CREATE POLICY "Vendors can manage their posters" ON public.posters FOR ALL USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);

CREATE POLICY "Vendors can view their analytics" ON public.analytics FOR SELECT USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);

-- Admin policies for oversight
CREATE POLICY "Admins can view all vendor data" ON public.vendor_config FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all QR codes" ON public.qr_codes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can view all analytics" ON public.analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Public policies for terms and privacy
CREATE POLICY "Public can view active terms" ON public.terms_and_conditions FOR SELECT USING (active = true);
CREATE POLICY "Public can view active privacy policy" ON public.privacy_policy FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage legal documents" ON public.terms_and_conditions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage privacy policy" ON public.privacy_policy FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert default vendor config for existing vendor
INSERT INTO public.vendor_config (vendor_id, happy_hour_enabled, dynamic_ui_enabled, ai_waiter_enabled)
SELECT id, true, true, true FROM public.vendors WHERE slug = 'ta-kris';

-- Insert sample terms and privacy policy
INSERT INTO public.terms_and_conditions (version, content, effective_date, active) VALUES
('1.0', 'Welcome to ICUPA Malta. By using our service, you agree to these terms...', now(), true);

INSERT INTO public.privacy_policy (version, content, effective_date, active) VALUES
('1.0', 'ICUPA Malta respects your privacy. This policy explains how we collect and use your data...', now(), true);

-- Create trigger function for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (new.id, 'guest');
  RETURN new;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
