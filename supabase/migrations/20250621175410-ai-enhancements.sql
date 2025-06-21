
-- Add missing columns to ai_waiter_logs for enhanced tracking
ALTER TABLE public.ai_waiter_logs 
ADD COLUMN ai_model_used TEXT,
ADD COLUMN processing_metadata JSONB,
ADD COLUMN satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5);

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

-- Enable RLS on AI tables
ALTER TABLE public.guest_ui_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guest_ui_sessions (public access for anonymous users)
CREATE POLICY "Public can create guest sessions" ON public.guest_ui_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view guest sessions by session_id" ON public.guest_ui_sessions FOR SELECT USING (true);
CREATE POLICY "Public can update guest sessions" ON public.guest_ui_sessions FOR UPDATE USING (true);
