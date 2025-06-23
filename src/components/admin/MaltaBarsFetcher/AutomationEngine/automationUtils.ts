
import { supabase } from '@/integrations/supabase/client';

interface AutomationJob {
  id: string;
  job_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error_message?: string;
  progress_data?: any;
  created_at: string;
}

export const runGoogleMapsFetch = async (setProgress: (progress: number) => void) => {
  console.log('🚀 Starting Google Maps fetch automation...');
  
  try {
    setProgress(10);

    // Call the fetch-malta-bars function directly without job creation
    console.log('📡 Invoking fetch-malta-bars edge function...');
    const { data, error } = await supabase.functions.invoke('fetch-malta-bars', {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (error) {
      console.error('❌ Edge function error:', error);
      throw new Error(`Edge function failed: ${error.message}`);
    }

    console.log('✅ Edge function response:', data);
    setProgress(90);

    // Try to create job record, but don't fail if RLS blocks it
    try {
      await supabase
        .from('automation_jobs')
        .insert({
          job_type: 'google_maps_fetch',
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          progress_data: {
            response: data,
            total_processed: data?.summary?.total_processed || 0,
            new_bars_added: data?.summary?.new_bars_added || 0,
            bars_updated: data?.summary?.bars_updated || 0
          }
        });
    } catch (jobError) {
      console.warn('⚠️ Could not create job record:', jobError);
      // Continue execution even if job logging fails
    }

    setProgress(100);
    console.log('🎉 Google Maps fetch completed successfully!');

  } catch (error: any) {
    console.error('💥 Google Maps fetch failed:', error);
    
    // Try to log the error, but don't fail if RLS blocks it
    try {
      await supabase
        .from('automation_jobs')
        .insert({
          job_type: 'google_maps_fetch',
          status: 'failed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          error_message: error.message,
          progress_data: {
            error_type: error.name || 'UnknownError',
            error_details: error.message
          }
        });
    } catch (jobError) {
      console.warn('⚠️ Could not log error to job record:', jobError);
    }
    
    throw error;
  }
};

export const runWebsiteDiscovery = async (setProgress: (progress: number) => void) => {
  console.log('🔍 Running website discovery...');
  
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

export const runMenuExtraction = async (setProgress: (progress: number) => void) => {
  console.log('📋 Running menu extraction...');
  
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

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-green-500';
    case 'running': return 'bg-blue-500';
    case 'failed': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

export const getJobIcon = (jobType: string) => {
  switch (jobType) {
    case 'google_maps_fetch': return 'Globe';
    case 'menu_extraction': return 'Menu';
    case 'website_discovery': return 'Globe';
    default: return 'Brain';
  }
};
