
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
        console.log('Fetching vendor data for slug:', slug);

        // Use maybeSingle() instead of single() to handle no results gracefully
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .maybeSingle();

        if (vendorError) {
          console.error('Vendor fetch error:', vendorError);
          throw new Error(`Failed to fetch vendor: ${vendorError.message}`);
        }

        if (!vendorData) {
          console.log('No vendor found with slug:', slug);
          
          // Check what vendors actually exist
          const { data: availableVendors, error: listError } = await supabase
            .from('vendors')
            .select('slug, name')
            .eq('active', true)
            .limit(5);
          
          if (!listError && availableVendors?.length > 0) {
            console.log('Available vendors:', availableVendors.map(v => v.slug));
            toast({
              title: "Vendor Not Found",
              description: `No active vendor found with slug "${slug}". Try: ${availableVendors.map(v => v.slug).join(', ')}`,
              variant: "destructive"
            });
          } else {
            toast({
              title: "No Vendors Available",
              description: "No active vendors found in the system.",
              variant: "destructive"
            });
          }
          
          setLoading(false);
          return;
        }

        console.log('Vendor found:', vendorData.name);
        setVendor(vendorData);

        // Fetch menu and menu items
        console.log('Fetching menu for vendor ID:', vendorData.id);
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
          console.error('Menu fetch error:', menuError);
          throw new Error(`Failed to fetch menu: ${menuError.message}`);
        }

        if (!menuData) {
          console.log('No active menu found for vendor:', vendorData.name);
          toast({
            title: "No Menu Available",
            description: `No active menu found for ${vendorData.name}`,
            variant: "destructive"
          });
          setMenuItems([]);
        } else {
          console.log('Menu items loaded:', menuData.menu_items?.length || 0);
          setMenuItems(menuData.menu_items || []);
        }

        // Fetch weather data
        try {
          const weather = await weatherService.getWeatherData('Malta');
          if (weather) {
            setWeatherData(weather);
            console.log('Weather data loaded');
          }
        } catch (weatherError) {
          console.warn('Failed to load weather data:', weatherError);
          // Don't fail the whole operation for weather data
        }

      } catch (error: any) {
        console.error('Error in fetchVendorAndMenu:', error);
        toast({
          title: "Error Loading Data",
          description: error?.message || "Failed to load menu data",
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
