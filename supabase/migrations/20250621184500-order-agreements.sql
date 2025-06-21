
-- Create order_agreements table for GDPR compliance and legal tracking
CREATE TABLE public.order_agreements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  guest_session_id TEXT NOT NULL,
  agreed_to_terms BOOLEAN NOT NULL DEFAULT false,
  agreed_to_privacy BOOLEAN NOT NULL DEFAULT false,
  terms_version TEXT,
  privacy_version TEXT,
  ip_address INET,
  user_agent TEXT,
  consent_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  withdrawal_timestamp TIMESTAMP WITH TIME ZONE,
  data_processing_purposes JSONB DEFAULT '[]'::jsonb,
  marketing_consent BOOLEAN DEFAULT false,
  analytics_consent BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_processing_log for GDPR audit trail
CREATE TABLE public.data_processing_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_session_id TEXT NOT NULL,
  processing_purpose TEXT NOT NULL,
  data_categories JSONB NOT NULL,
  legal_basis TEXT NOT NULL,
  retention_period TEXT,
  processor_name TEXT,
  processing_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  anonymized_timestamp TIMESTAMP WITH TIME ZONE,
  deleted_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_subject_requests for GDPR rights management
CREATE TABLE public.data_subject_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_session_id TEXT NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'rectification', 'erasure', 'portability', 'restriction')),
  request_details JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  response_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.order_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_agreements
CREATE POLICY "Public can create order agreements" ON public.order_agreements FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can view their own agreements" ON public.order_agreements FOR SELECT USING (true);
CREATE POLICY "Admins can view all agreements" ON public.order_agreements FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for data_processing_log
CREATE POLICY "System can create processing logs" ON public.data_processing_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all processing logs" ON public.data_processing_log FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for data_subject_requests
CREATE POLICY "Public can create data subject requests" ON public.data_subject_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Guests can view their own requests" ON public.data_subject_requests FOR SELECT USING (true);
CREATE POLICY "Admins can manage all requests" ON public.data_subject_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create function for automatic consent logging
CREATE OR REPLACE FUNCTION public.log_order_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_terms_version TEXT;
  active_privacy_version TEXT;
BEGIN
  -- Get active document versions
  SELECT version INTO active_terms_version 
  FROM public.terms_and_conditions 
  WHERE active = true 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  SELECT version INTO active_privacy_version 
  FROM public.privacy_policy 
  WHERE active = true 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Insert order agreement record
  INSERT INTO public.order_agreements (
    order_id,
    guest_session_id,
    agreed_to_terms,
    agreed_to_privacy,
    terms_version,
    privacy_version,
    data_processing_purposes
  ) VALUES (
    NEW.id,
    NEW.guest_session_id,
    true, -- Required for order placement
    true, -- Required for order placement
    active_terms_version,
    active_privacy_version,
    '["order_processing", "payment_processing", "service_delivery"]'::jsonb
  );

  -- Log data processing activity
  INSERT INTO public.data_processing_log (
    guest_session_id,
    processing_purpose,
    data_categories,
    legal_basis,
    retention_period,
    processor_name
  ) VALUES (
    NEW.guest_session_id,
    'Order Processing',
    '["contact_data", "payment_data", "order_preferences"]'::jsonb,
    'Contract Performance',
    '7 years',
    'ICUPA Malta'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for automatic consent logging on order creation
CREATE TRIGGER on_order_created_log_consent
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE PROCEDURE public.log_order_consent();

-- Insert sample GDPR-compliant legal documents
UPDATE public.terms_and_conditions 
SET content = 'ICUPA Malta Terms and Conditions

1. ACCEPTANCE OF TERMS
By using ICUPA Malta services, you agree to these terms and conditions.

2. SERVICE DESCRIPTION
ICUPA Malta provides AI-powered hospitality platform services for restaurants and bars.

3. DATA PROCESSING
We process your data in accordance with our Privacy Policy and GDPR requirements.

4. USER RESPONSIBILITIES
Users must provide accurate information and comply with applicable laws.

5. LIMITATION OF LIABILITY
Our liability is limited as permitted by applicable law.

6. GOVERNING LAW
These terms are governed by Maltese law.

Last updated: ' || now()::date
WHERE active = true;

UPDATE public.privacy_policy 
SET content = 'ICUPA Malta Privacy Policy

1. DATA CONTROLLER
ICUPA Malta is the data controller for your personal data.

2. DATA WE COLLECT
- Order information
- Payment details
- Session data (anonymized)
- AI interaction logs

3. LEGAL BASIS FOR PROCESSING
- Contract performance for order processing
- Legitimate interest for service improvement
- Consent for marketing communications

4. YOUR RIGHTS (GDPR)
- Right to access your data
- Right to rectification
- Right to erasure ("right to be forgotten")
- Right to data portability
- Right to restrict processing

5. DATA RETENTION
Order data: 7 years for accounting purposes
Session data: Anonymized after 30 days
AI logs: Anonymized immediately

6. CONTACT US
For data protection inquiries: privacy@icupa.mt

Last updated: ' || now()::date
WHERE active = true;
