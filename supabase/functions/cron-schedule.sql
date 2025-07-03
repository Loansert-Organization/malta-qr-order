-- Set up CRON schedule for photo fill job
-- This runs every day at 2:00 AM Europe/Malta time

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Safely unschedule the job if it exists, to avoid errors on first run
DO $$
BEGIN
  PERFORM cron.unschedule('fill-bar-photos-nightly');
EXCEPTION
  WHEN OTHERS THEN
    -- This is expected if the job doesn't exist yet
    RAISE NOTICE 'CRON job "fill-bar-photos-nightly" did not exist, creating it.';
END;
$$;

-- Create the cron job
-- The command is wrapped to set the timezone for the execution context.
SELECT cron.schedule(
    'fill-bar-photos-nightly',  -- job name
    '0 2 * * *',               -- cron expression: daily at 2:00 AM (UTC, will be adjusted by timezone)
    $$
    BEGIN;
    SET timezone = 'Europe/Malta';
    PERFORM
        net.http_post(
            url := 'https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/cron-fill-photos',
            headers := jsonb_build_object(
                'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
                'Content-Type', 'application/json'
            ),
            body := '{}'::jsonb
        );
    COMMIT;
    $$
);

-- View scheduled jobs to confirm
SELECT 
    jobid,
    jobname,
    schedule,
    active,
    command
FROM cron.job 
WHERE jobname = 'fill-bar-photos-nightly'; 