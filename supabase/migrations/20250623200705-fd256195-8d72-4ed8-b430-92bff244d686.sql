
-- Create support_tickets table for customer support functionality
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id TEXT NOT NULL,
  vendor_id UUID REFERENCES public.vendors(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('order', 'payment', 'technical', 'general')),
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security_audits table for security monitoring
CREATE TABLE public.security_audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_score INTEGER NOT NULL DEFAULT 0,
  issues_found JSONB DEFAULT '[]'::jsonb,
  recommendations JSONB DEFAULT '[]'::jsonb,
  audit_type TEXT NOT NULL DEFAULT 'comprehensive',
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_metrics table for performance monitoring
CREATE TABLE public.system_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value NUMERIC NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tags JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_tickets
CREATE POLICY "Public can create support tickets" 
  ON public.support_tickets 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Vendors can view their support tickets" 
  ON public.support_tickets 
  FOR SELECT 
  USING (vendor_id IN (
    SELECT id FROM public.vendors WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all support tickets" 
  ON public.support_tickets 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for security_audits (admin only)
CREATE POLICY "Admins can manage security audits" 
  ON public.security_audits 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS policies for system_metrics (admin only)
CREATE POLICY "Admins can manage system metrics" 
  ON public.system_metrics 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_support_tickets_vendor_id ON public.support_tickets(vendor_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX idx_security_audits_performed_at ON public.security_audits(performed_at);
CREATE INDEX idx_system_metrics_name ON public.system_metrics(name);
CREATE INDEX idx_system_metrics_timestamp ON public.system_metrics(timestamp);
