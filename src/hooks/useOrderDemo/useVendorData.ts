
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { weatherService } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, Vendor } from './types';

export const useVendorData = (slug: string | undefined) => {
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    const fetchVendorAndMenu = async () => {
      if (!slug) {
        console.log('No slug provided for vendor data fetch');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Fetching vendor data for slug:', slug);

        // Use maybeSingle() to handle no results gracefully
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .maybeSingle();

        if (vendorError) {
          console.error('❌ Vendor fetch error:', vendorError);
          setVendor(null);
          setMenuItems([]);
          setLoading(false);
          return;
        }

        if (!vendorData) {
          console.log('⚠️  No vendor found with slug:', slug);
          setVendor(null);
          setMenuItems([]);
          setLoading(false);
          return;
        }

        console.log('✅ Vendor found:', vendorData.name);
        setVendor(vendorData);

        // Fetch menu and menu items
        console.log('🔍 Fetching menu for vendor ID:', vendorData.id);
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select(`
            id,
            menu_items (
              id,
              name,
              description,
              price,
              image_url,
              category,
              popular,
              prep_time,
              available
            )
          `)
          .eq('vendor_id', vendorData.id)
          .eq('active', true)
          .maybeSingle();

        if (menuError) {
          console.error('❌ Menu fetch error:', menuError);
          setMenuItems([]);
        } else if (!menuData) {
          console.log('⚠️  No active menu found for vendor:', vendorData.name);
          setMenuItems([]);
        } else {
          console.log('✅ Menu items loaded:', menuData.menu_items?.length || 0);
          setMenuItems(menuData.menu_items || []);
        }

        // Fetch weather data (non-blocking)
        try {
          const weather = await weatherService.getWeatherData('Malta');
          if (weather) {
            setWeatherData(weather);
            console.log('✅ Weather data loaded');
          }
        } catch (weatherError) {
          console.warn('⚠️  Failed to load weather data:', weatherError);
          // Don't fail the whole operation for weather data
        }

      } catch (error: any) {
        console.error('❌ Error in fetchVendorAndMenu:', error);
        setVendor(null);
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendorAndMenu();
  }, [slug, toast]);

  return {
    vendor,
    menuItems,
    loading,
    weatherData
  };
};
