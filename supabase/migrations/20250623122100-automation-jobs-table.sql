
-- Create automation_jobs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.automation_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  target_url text,
  bar_id uuid,
  progress_data jsonb DEFAULT '{}',
  error_message text,
  created_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- Add RLS policies
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access to automation jobs" 
  ON public.automation_jobs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_automation_jobs_created_at ON public.automation_jobs (created_at);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_status ON public.automation_jobs (status);
CREATE INDEX IF NOT EXISTS idx_automation_jobs_type ON public.automation_jobs (job_type);
