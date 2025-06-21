
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

-- Enable RLS on vendor_config
ALTER TABLE public.vendor_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor-specific config
CREATE POLICY "Vendors can manage their own config" ON public.vendor_config FOR ALL USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);

-- Admin policies for oversight
CREATE POLICY "Admins can view all vendor data" ON public.vendor_config FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Insert default vendor config for existing vendor
INSERT INTO public.vendor_config (vendor_id, happy_hour_enabled, dynamic_ui_enabled, ai_waiter_enabled)
SELECT id, true, true, true FROM public.vendors WHERE slug = 'ta-kris';
