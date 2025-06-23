
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { runGoogleMapsFetch, runWebsiteDiscovery, runMenuExtraction } from './automationUtils';

interface AutomationJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  target_url?: string;
  bar_id?: string;
  progress_data?: any;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export const useAutomationEngine = () => {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const fetchJobs = async () => {
    try {
      console.log('Fetching automation jobs...');
      const { data, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log('Fetched jobs:', data);
      
      // Type-safe mapping to ensure status matches our interface
      const typedJobs: AutomationJob[] = (data || []).map(job => ({
        ...job,
        status: job.status as 'pending' | 'running' | 'completed' | 'failed'
      }));
      
      setJobs(typedJobs);
    } catch (error: any) {
      console.error('Failed to fetch automation jobs:', error);
      toast({
        title: "Error",
        description: `Failed to fetch jobs: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const startAutomation = async (jobType: string) => {
    console.log('Starting automation:', jobType);
    setIsRunning(true);
    setProgress(0);
    
    try {
      toast({
        title: "Starting Automation",
        description: `Launching ${jobType} automation pipeline...`
      });

      if (jobType === 'google_maps_fetch') {
        await runGoogleMapsFetch(setProgress);
      } else if (jobType === 'website_discovery') {
        await runWebsiteDiscovery(setProgress);
      } else if (jobType === 'menu_extraction') {
        await runMenuExtraction(setProgress);
      }

      toast({
        title: "Automation Complete",
        description: `${jobType} completed successfully!`
      });
    } catch (error: any) {
      console.error('Automation failed:', error);
      toast({
        title: "Automation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setProgress(0);
      await fetchJobs();
    }
  };

  useEffect(() => {
    console.log('AutomationEngine mounted, fetching jobs...');
    fetchJobs();
  }, []);

  return {
    jobs,
    isRunning,
    progress,
    startAutomation,
    fetchJobs
  };
};
