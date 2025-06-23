
import { supabase } from '@/integrations/supabase/client';

export const runGoogleMapsFetch = async (setProgress: (progress: number) => void) => {
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

export const runWebsiteDiscovery = async (setProgress: (progress: number) => void) => {
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

export const runMenuExtraction = async (setProgress: (progress: number) => void) => {
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
