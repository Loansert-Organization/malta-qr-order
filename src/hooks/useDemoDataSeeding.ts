
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDemoDataSeeding = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const seedDemoData = async () => {
    setIsSeeding(true);
    
    try {
      // Create demo vendors
      const demoVendors = [
        {
          business_name: 'The Maltese Falcon Bar',
          name: 'The Maltese Falcon Bar',
          slug: 'maltese-falcon-bar',
          description: 'Traditional Maltese bar with authentic local cuisine',
          location: 'Valletta, Malta',
          active: true
        },
        {
          business_name: 'Mediterranean Bistro',
          name: 'Mediterranean Bistro',
          slug: 'mediterranean-bistro',
          description: 'Fresh Mediterranean dishes and cocktails',
          location: 'Sliema, Malta',
          active: true
        },
        {
          business_name: 'Harbour View Lounge',
          name: 'Harbour View Lounge',
          slug: 'harbour-view-lounge',
          description: 'Upscale lounge with stunning harbour views',
          location: 'Valletta, Malta',
          active: true
        }
      ];

      const { data: vendors, error: vendorError } = await supabase
        .from('vendors')
        .insert(demoVendors)
        .select();

      if (vendorError) throw vendorError;

      // Create demo menus for each vendor
      if (vendors) {
        for (const vendor of vendors) {
          const { data: menu, error: menuError } = await supabase
            .from('menus')
            .insert({
              vendor_id: vendor.id,
              name: 'Main Menu',
              active: true
            })
            .select()
            .single();

          if (menuError) throw menuError;

          // Create demo menu items
          const demoMenuItems = [
            {
              menu_id: menu.id,
              name: 'Maltese Platter',
              description: 'Traditional Maltese cheese, olives, and bread',
              price: 12.50,
              category: 'Appetizers',
              available: true
            },
            {
              menu_id: menu.id,
              name: 'Rabbit Stew',
              description: 'Traditional Maltese rabbit stew with vegetables',
              price: 18.90,
              category: 'Main Courses',
              available: true
            },
            {
              menu_id: menu.id,
              name: 'Cisk Beer',
              description: 'Local Maltese beer',
              price: 3.50,
              category: 'Drinks',
              available: true
            }
          ];

          const { error: itemsError } = await supabase
            .from('menu_items')
            .insert(demoMenuItems);

          if (itemsError) throw itemsError;
        }
      }

      toast({
        title: "Demo Data Seeded!",
        description: "Successfully created demo vendors and menu items.",
      });

    } catch (error) {
      console.error('Demo data seeding error:', error);
      toast({
        title: "Seeding Failed",
        description: "Failed to create demo data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return {
    seedDemoData,
    isSeeding
  };
};
