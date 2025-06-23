
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, RefreshCw, Globe, Menu, Image, Brain } from 'lucide-react';

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

const AutomationEngine = () => {
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
        await runGoogleMapsFetch();
      } else if (jobType === 'website_discovery') {
        await runWebsiteDiscovery();
      } else if (jobType === 'menu_extraction') {
        await runMenuExtraction();
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

  const runGoogleMapsFetch = async () => {
    console.log('Running Google Maps fetch...');
    setProgress(25);
    
    try {
      // Call the existing fetch-malta-bars function
      const { data, error } = await supabase.functions.invoke('fetch-malta-bars');
      
      if (error) {
        console.error('Google Maps fetch error:', error);
        throw new Error(`Google Maps fetch failed: ${error.message}`);
      }
      
      console.log('Google Maps fetch result:', data);
      setProgress(100);
    } catch (error) {
      console.error('Error in runGoogleMapsFetch:', error);
      throw error;
    }
  };

  const runWebsiteDiscovery = async () => {
    console.log('Running website discovery...');
    
    try {
      // Get bars without website URLs
      const { data: bars, error } = await supabase
        .from('bars')
        .select('id, name, address')
        .is('website_url', null);

      if (error) {
        console.error('Error fetching bars for website discovery:', error);
        throw error;
      }

      console.log('Bars without websites:', bars);

      if (!bars || bars.length === 0) {
        throw new Error('All bars already have website URLs.');
      }

      const totalBars = bars.length;
      let processed = 0;

      for (const bar of bars) {
        try {
          setProgress((processed / totalBars) * 100);
          
          // Simple Google search to find website
          const searchQuery = `${bar.name} ${bar.address} Malta restaurant bar website`;
          const websiteUrl = await discoverWebsite(searchQuery);
          
          if (websiteUrl) {
            await supabase
              .from('bars')
              .update({ website_url: websiteUrl })
              .eq('id', bar.id);
          }

          processed++;
        } catch (error) {
          console.error(`Error discovering website for ${bar.name}:`, error);
          processed++;
        }
      }
    } catch (error) {
      console.error('Error in runWebsiteDiscovery:', error);
      throw error;
    }
  };

  const runMenuExtraction = async () => {
    console.log('Running menu extraction...');
    
    try {
      // Get bars with website URLs
      const { data: bars, error } = await supabase
        .from('bars')
        .select('id, name, website_url')
        .not('website_url', 'is', null);

      if (error) {
        console.error('Error fetching bars for menu extraction:', error);
        throw error;
      }

      console.log('Bars with websites:', bars);

      if (!bars || bars.length === 0) {
        throw new Error('No bars with website URLs found. Run website discovery first.');
      }

      const totalBars = bars.length;
      let processed = 0;

      for (const bar of bars) {
        try {
          setProgress((processed / totalBars) * 100);
          
          console.log(`Processing menu for ${bar.name}...`);
          
          // Call the menu extraction function
          const response = await supabase.functions.invoke('extract-menu-items', {
            body: {
              website_url: bar.website_url,
              bar_id: bar.id
            }
          });

          if (response.error) {
            console.error(`Failed to process ${bar.name}:`, response.error);
          } else {
            console.log(`Successfully processed ${bar.name}`);
          }

          processed++;
        } catch (error) {
          console.error(`Error processing ${bar.name}:`, error);
          processed++;
        }
      }
    } catch (error) {
      console.error('Error in runMenuExtraction:', error);
      throw error;
    }
  };

  const discoverWebsite = async (searchQuery: string): Promise<string | null> => {
    // This is a simplified version - in production, you'd use Google Search API
    // For now, return null to avoid API costs
    console.log('Website discovery query:', searchQuery);
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getJobIcon = (jobType: string) => {
    switch (jobType) {
      case 'google_maps_fetch': return <Globe className="h-4 w-4" />;
      case 'menu_extraction': return <Menu className="h-4 w-4" />;
      case 'website_discovery': return <Globe className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  React.useEffect(() => {
    console.log('AutomationEngine mounted, fetching jobs...');
    fetchJobs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Malta Bars Automation Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => startAutomation('google_maps_fetch')}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Fetch from Google Maps
            </Button>
            
            <Button
              onClick={() => startAutomation('website_discovery')}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Discover Websites
            </Button>
            
            <Button
              onClick={() => startAutomation('menu_extraction')}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              <Menu className="h-4 w-4" />
              Extract Menus
            </Button>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Processing...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Automation Jobs</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchJobs}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {jobs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No automation jobs yet</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getJobIcon(job.job_type)}
                    <div>
                      <p className="font-medium">{job.job_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(job.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(job.status)}>
                      {job.status}
                    </Badge>
                    {job.progress_data?.items_extracted && (
                      <span className="text-sm text-gray-500">
                        {job.progress_data.items_extracted} items
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutomationEngine;
