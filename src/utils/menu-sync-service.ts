import { supabase } from '@/integrations/supabase/client';

/**
 * Interface for menu item data
 */
export interface MenuItem {
  bar: string;
  category: string;
  subcategory: string;
  item: string;
  volume?: string;
  price: number;
  description?: string;
}

/**
 * Interface for menu sync response
 */
export interface MenuSyncResponse {
  success: boolean;
  summary?: {
    barsAdded: string[];
    itemsInserted: number;
    errors: Array<{ item: string; error: string }>;
  };
  error?: string;
  details?: string;
}

/**
 * Sync menu data from raw tab-delimited text
 * 
 * @param rawMenuData Tab-delimited text with menu items
 * @returns Response with sync summary
 */
export async function syncMenuFromText(rawMenuData: string): Promise<MenuSyncResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('sync-menu-data', {
      body: { rawMenuData }
    });

    if (error) {
      console.error('Error syncing menu data:', error);
      return {
        success: false,
        error: 'Failed to sync menu data',
        details: error.message
      };
    }

    return data as MenuSyncResponse;
  } catch (err) {
    console.error('Exception syncing menu data:', err);
    return {
      success: false,
      error: 'Exception occurred while syncing menu data',
      details: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Sync menu data from array of menu items
 * 
 * @param menuItems Array of menu item objects
 * @returns Response with sync summary
 */
export async function syncMenuItems(menuItems: MenuItem[]): Promise<MenuSyncResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('sync-menu-data', {
      body: { menuItems }
    });

    if (error) {
      console.error('Error syncing menu items:', error);
      return {
        success: false,
        error: 'Failed to sync menu items',
        details: error.message
      };
    }

    return data as MenuSyncResponse;
  } catch (err) {
    console.error('Exception syncing menu items:', err);
    return {
      success: false,
      error: 'Exception occurred while syncing menu items',
      details: err instanceof Error ? err.message : String(err)
    };
  }
}

/**
 * Parse tab-delimited text into menu items
 * 
 * @param rawData Tab-delimited text with menu items
 * @returns Array of parsed menu items
 */
export function parseMenuData(rawData: string): MenuItem[] {
  const lines = rawData.trim().split('\n');
  const parsedItems: MenuItem[] = [];

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 6) continue;

    const [bar, category, subcategory, item, volumeOrDesc, priceStr] = parts;
    
    // Determine if the 5th column is volume or description
    const isVolume = /^\d+ml$|^\d+cl$|^\d+l$/i.test(volumeOrDesc);
    
    parsedItems.push({
      bar,
      category,
      subcategory,
      item,
      volume: isVolume ? volumeOrDesc : undefined,
      description: isVolume ? (parts[6] || undefined) : volumeOrDesc,
      price: parseFloat(priceStr) || parseFloat(parts[6]) || 0
    });
  }

  return parsedItems;
} 