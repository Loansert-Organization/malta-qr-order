
-- Add website_url to bars table for website discovery
ALTER TABLE public.bars ADD COLUMN website_url TEXT;

-- Add source_url to menu_items table to track where menu came from
ALTER TABLE public.menu_items ADD COLUMN source_url TEXT;

-- Create a linking table between bars and menu_items since menu_items currently links to menus
-- First, let's add bar_id to menu_items for direct linking
ALTER TABLE public.menu_items ADD COLUMN bar_id UUID REFERENCES public.bars(id);

-- Create automation_jobs table to track scraping operations
CREATE TABLE public.automation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL, -- 'menu_scrape', 'image_generation', etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  target_url TEXT,
  bar_id UUID REFERENCES public.bars(id),
  progress_data JSONB DEFAULT '{}',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create menu_scraping_logs table for detailed logging
CREATE TABLE public.menu_scraping_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_job_id UUID REFERENCES public.automation_jobs(id),
  bar_id UUID REFERENCES public.bars(id),
  website_url TEXT NOT NULL,
  menu_links_found JSONB DEFAULT '[]',
  ai_models_used JSONB DEFAULT '[]',
  items_extracted INTEGER DEFAULT 0,
  images_generated INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX idx_automation_jobs_status ON public.automation_jobs(status);
CREATE INDEX idx_automation_jobs_bar_id ON public.automation_jobs(bar_id);
CREATE INDEX idx_menu_scraping_logs_bar_id ON public.menu_scraping_logs(bar_id);
CREATE INDEX idx_bars_website_url ON public.bars(website_url);

-- Enable RLS for new tables
ALTER TABLE public.automation_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_scraping_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin access
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

CREATE POLICY "Allow admin access to menu scraping logs" 
  ON public.menu_scraping_logs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
