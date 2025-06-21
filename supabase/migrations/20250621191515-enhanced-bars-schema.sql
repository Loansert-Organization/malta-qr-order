
-- Enhanced bars table schema with proper point type and audit logging
-- This migration corrects the geography issue and adds comprehensive enhancements

-- Drop existing bars table if it exists
DROP TABLE IF EXISTS public.bars CASCADE;

-- Create the enhanced bars table with proper point type for location
CREATE TABLE public.bars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  contact_number text,
  rating numeric,
  review_count integer,
  location_gps point, -- Using point type instead of geography
  google_place_id text UNIQUE,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  data_quality_score integer DEFAULT 100,
  is_active boolean DEFAULT true
);

-- Create audit logging table for tracking fetch operations
CREATE TABLE public.bar_fetch_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type text NOT NULL, -- 'fetch', 'update', 'error'
  total_bars_processed integer DEFAULT 0,
  new_bars_added integer DEFAULT 0,
  bars_updated integer DEFAULT 0,
  errors_count integer DEFAULT 0,
  api_calls_made integer DEFAULT 0,
  operation_duration_ms integer,
  error_details jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  status text DEFAULT 'in_progress' -- 'completed', 'failed', 'in_progress'
);

-- Create job status tracking table for automated scheduling
CREATE TABLE public.scheduled_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name text NOT NULL,
  job_type text NOT NULL,
  last_run timestamp with time zone,
  next_run timestamp with time zone,
  status text DEFAULT 'pending', -- 'running', 'completed', 'failed', 'pending'
  run_count integer DEFAULT 0,
  success_count integer DEFAULT 0,
  failure_count integer DEFAULT 0,
  last_error text,
  config jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add proper indexes for performance
CREATE INDEX idx_bars_location_gps ON public.bars USING GIST (location_gps);
CREATE INDEX idx_bars_google_place_id ON public.bars (google_place_id);
CREATE INDEX idx_bars_created_at ON public.bars (created_at);
CREATE INDEX idx_bars_rating ON public.bars (rating);
CREATE INDEX idx_bars_active ON public.bars (is_active);
CREATE INDEX idx_bars_quality_score ON public.bars (data_quality_score);

-- Add indexes for audit tables
CREATE INDEX idx_bar_fetch_logs_created_at ON public.bar_fetch_logs (created_at);
CREATE INDEX idx_bar_fetch_logs_status ON public.bar_fetch_logs (status);
CREATE INDEX idx_scheduled_jobs_job_name ON public.scheduled_jobs (job_name);
CREATE INDEX idx_scheduled_jobs_next_run ON public.scheduled_jobs (next_run);

-- Add RLS policies for the bars table
ALTER TABLE public.bars ENABLE ROW LEVEL SECURITY;

-- Policy to allow reading bars data for all users
CREATE POLICY "Allow public read access to bars" 
  ON public.bars 
  FOR SELECT 
  USING (true);

-- Policy to allow admin users to insert/update bars data
CREATE POLICY "Allow admin insert/update bars" 
  ON public.bars 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Add RLS policies for audit tables (admin only)
ALTER TABLE public.bar_fetch_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access to fetch logs" 
  ON public.bar_fetch_logs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin access to scheduled jobs" 
  ON public.scheduled_jobs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Create data validation trigger function
CREATE OR REPLACE FUNCTION validate_bar_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate that name is not empty
  IF NEW.name IS NULL OR trim(NEW.name) = '' THEN
    RAISE EXCEPTION 'Bar name cannot be empty';
  END IF;
  
  -- Validate rating range
  IF NEW.rating IS NOT NULL AND (NEW.rating < 0 OR NEW.rating > 5) THEN
    RAISE EXCEPTION 'Rating must be between 0 and 5';
  END IF;
  
  -- Validate review count
  IF NEW.review_count IS NOT NULL AND NEW.review_count < 0 THEN
    RAISE EXCEPTION 'Review count cannot be negative';
  END IF;
  
  -- Calculate and set data quality score
  NEW.data_quality_score := (
    CASE WHEN NEW.name IS NOT NULL AND trim(NEW.name) != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.address IS NOT NULL AND trim(NEW.address) != '' THEN 20 ELSE 0 END +
    CASE WHEN NEW.contact_number IS NOT NULL AND trim(NEW.contact_number) != '' THEN 15 ELSE 0 END +
    CASE WHEN NEW.rating IS NOT NULL THEN 15 ELSE 0 END +
    CASE WHEN NEW.review_count IS NOT NULL AND NEW.review_count > 0 THEN 15 ELSE 0 END +
    CASE WHEN NEW.location_gps IS NOT NULL THEN 15 ELSE 0 END
  );
  
  -- Update the updated_at timestamp
  NEW.updated_at = timezone('utc'::text, now());
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for data validation
CREATE TRIGGER validate_bar_data_trigger
  BEFORE INSERT OR UPDATE ON public.bars
  FOR EACH ROW
  EXECUTE FUNCTION validate_bar_data();

-- Insert initial scheduled job for Malta bar fetching
INSERT INTO public.scheduled_jobs (job_name, job_type, next_run, config)
VALUES (
  'fetch-malta-bars',
  'bar_data_sync',
  timezone('utc'::text, now()) + interval '1 day',
  '{"frequency": "daily", "time": "03:00", "timezone": "Europe/Malta", "auto_enabled": true}'::jsonb
)
ON CONFLICT (job_name) DO NOTHING;
