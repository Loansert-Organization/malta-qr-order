
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

-- Enable RLS on QR and poster tables
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posters ENABLE ROW LEVEL SECURITY;

-- RLS Policies for QR codes
CREATE POLICY "Vendors can manage their QR codes" ON public.qr_codes FOR ALL USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);

CREATE POLICY "Admins can view all QR codes" ON public.qr_codes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for posters
CREATE POLICY "Vendors can manage their posters" ON public.posters FOR ALL USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
);
