
-- Fix RLS policy for automation_jobs table to allow system operations
DROP POLICY IF EXISTS "Allow admin access to automation jobs" ON public.automation_jobs;

-- Create a more permissive policy that allows both admin users and system operations
CREATE POLICY "Allow automation job operations" 
  ON public.automation_jobs 
  FOR ALL 
  USING (
    -- Allow if user is an admin
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role = 'admin'
    )
    -- Or allow if this is a system operation (no auth.uid())
    OR auth.uid() IS NULL
  );

-- Grant necessary permissions to the service role
GRANT ALL ON public.automation_jobs TO service_role;
