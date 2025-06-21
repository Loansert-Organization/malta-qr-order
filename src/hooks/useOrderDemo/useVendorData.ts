
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
      if (!slug) return;

      try {
        // Fetch vendor data
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (vendorError) throw vendorError;
        setVendor(vendorData);

        // Fetch menu and menu items
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
          .single();

        if (menuError) throw menuError;
        setMenuItems(menuData.menu_items || []);

        // Fetch weather data
        const weather = await weatherService.getWeatherData('Malta');
        if (weather) {
          setWeatherData(weather);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load menu data",
          variant: "destructive"
        });
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
