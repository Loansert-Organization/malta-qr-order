-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres user
GRANT USAGE ON SCHEMA cron TO postgres;

-- Schedule the fill-menu-item-images function to run daily at 3 AM UTC
SELECT cron.schedule(
  'fill-menu-item-images', -- job name
  '0 3 * * *', -- cron expression: daily at 3:00 AM UTC
  $$
  SELECT
    net.http_post(
      url := 'https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/fill-menu-item-images',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.JhUCiklNO9vHWLrmrBYwDGbdaQtLUSBXmKTIoB4b7G8'
      ),
      body := jsonb_build_object('batchSize', 20)
    ) AS request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule (if needed):
-- SELECT cron.unschedule('fill-menu-item-images'); 