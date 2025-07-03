
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
      console.log('📋 Fetching automation jobs...');
      const { data, error } = await supabase
        .from('automation_jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Error fetching jobs:', error);
        throw error;
      }
      
      console.log('✅ Fetched jobs:', data);
      
      const typedJobs: AutomationJob[] = (data || []).map(job => ({
        ...job,
        status: job.status as 'pending' | 'running' | 'completed' | 'failed',
        target_url: job.target_url || undefined,
        bar_id: job.bar_id || undefined,
        error_message: job.error_message || undefined,
        started_at: job.started_at || undefined,
        completed_at: job.completed_at || undefined,
        created_at: job.created_at || new Date().toISOString()
      }));
      
      setJobs(typedJobs);
    } catch (error: any) {
      console.error('💥 Failed to fetch automation jobs:', error);
      toast({
        title: "Error Fetching Jobs",
        description: `Failed to load job history: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const startAutomation = async (jobType: string) => {
    console.log('🚀 Starting automation:', jobType);
    
    if (isRunning) {
      toast({
        title: "Automation Already Running",
        description: "Please wait for the current automation to complete.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    setProgress(0);
    
    try {
      toast({
        title: "Starting Automation",
        description: `Launching ${jobType.replace('_', ' ')} automation pipeline...`
      });

      if (jobType === 'google_maps_fetch') {
        await runGoogleMapsFetch(setProgress);
      } else if (jobType === 'website_discovery') {
        await runWebsiteDiscovery(setProgress);
      } else if (jobType === 'menu_extraction') {
        await runMenuExtraction(setProgress);
      } else {
        throw new Error(`Unknown job type: ${jobType}`);
      }

      toast({
        title: "Automation Complete",
        description: `${jobType.replace('_', ' ')} completed successfully!`
      });

    } catch (error: any) {
      console.error('💥 Automation failed:', error);
      
      let errorMessage = error.message || 'Unknown error occurred';
      
      if (errorMessage.includes('REQUEST_DENIED') || errorMessage.includes('API key')) {
        errorMessage = 'Google Maps API key is missing or invalid. Please check your API key configuration.';
      } else if (errorMessage.includes('PERMISSION_DENIED')) {
        errorMessage = 'Authentication failed. Please check your admin permissions.';
      } else if (errorMessage.includes('Edge function failed')) {
        errorMessage = 'Backend service error. Please check the edge function logs.';
      } else if (errorMessage.includes('row-level security policy')) {
        errorMessage = 'Database permission error. Running automation without job tracking.';
      }
      
      toast({
        title: "Automation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setProgress(0);
      await fetchJobs();
    }
  };

  useEffect(() => {
    console.log('🔄 AutomationEngine mounted, fetching jobs...');
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
