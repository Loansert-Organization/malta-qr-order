
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

-- Enable RLS on analytics and legal tables
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_and_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policy ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics
CREATE POLICY "Vendors can view their analytics" ON public.analytics FOR SELECT USING (
  vendor_id IN (SELECT vendor_id FROM public.profiles WHERE user_id = auth.uid() AND role = 'vendor')
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

-- Insert sample terms and privacy policy
INSERT INTO public.terms_and_conditions (version, content, effective_date, active) VALUES
('1.0', 'Welcome to ICUPA Malta. By using our service, you agree to these terms...', now(), true);

INSERT INTO public.privacy_policy (version, content, effective_date, active) VALUES
('1.0', 'ICUPA Malta respects your privacy. This policy explains how we collect and use your data...', now(), true);
