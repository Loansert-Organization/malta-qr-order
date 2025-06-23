
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useDemoDataSeeding = () => {
  const [isSeeding, setIsSeeding] = useState(false);

  const seedDemoData = async () => {
    if (isSeeding) return;
    
    try {
      setIsSeeding(true);
      
      const { data: existingVendors } = await supabase
        .from('vendors')
        .select('id')
        .limit(1);

      if (existingVendors && existingVendors.length > 0) {
        console.log('Demo vendors already exist');
        return;
      }

      const demoVendors = [
        {
          business_name: 'The Harbour Bistro', // Fixed: using business_name
          name: 'The Harbour Bistro', // Keep both for compatibility
          slug: 'harbour-bistro',
          description: 'Fresh seafood and Mediterranean cuisine with stunning harbor views',
          location: 'Valletta Waterfront',
          active: true,
          is_active: true
        },
        {
          business_name: 'Malta Street Kitchen',
          name: 'Malta Street Kitchen',
          slug: 'malta-street-kitchen',
          description: 'Traditional Maltese dishes with a modern twist',
          location: 'St. Julian\'s',
          active: true,
          is_active: true
        },
        {
          business_name: 'Gozo Garden Café',
          name: 'Gozo Garden Café',
          slug: 'gozo-garden-cafe',
          description: 'Farm-to-table dining experience with local ingredients',
          location: 'Victoria, Gozo',
          active: true,
          is_active: true
        },
        {
          business_name: 'Mdina Medieval Tavern',
          name: 'Mdina Medieval Tavern',
          slug: 'mdina-medieval-tavern',
          description: 'Historic dining in the silent city with traditional recipes',
          location: 'Mdina',
          active: true,
          is_active: true
        },
        {
          business_name: 'Sliema Sunset Bar',
          name: 'Sliema Sunset Bar',
          slug: 'sliema-sunset-bar',
          description: 'Cocktails and light bites with panoramic sea views',
          location: 'Sliema',
          active: true,
          is_active: true
        }
      ];

      const { error } = await supabase
        .from('vendors')
        .insert(demoVendors);

      if (error) {
        console.error('Error seeding demo vendors:', error);
      } else {
        console.log('Demo vendors seeded successfully');
        await seedMenusForVendors();
      }
    } catch (error) {
      console.error('Error in seedDemoData:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  const seedMenusForVendors = async () => {
    try {
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, slug');

      if (!vendors) return;

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

        if (menuError) {
          console.error('Error creating menu:', menuError);
          continue;
        }

        const menuItems = getSampleMenuItems(vendor.slug, menu.id);
        
        const { error: itemsError } = await supabase
          .from('menu_items')
          .insert(menuItems);

        if (itemsError) {
          console.error('Error creating menu items:', itemsError);
        }
      }
    } catch (error) {
      console.error('Error seeding menus:', error);
    }
  };

  const getSampleMenuItems = (vendorSlug: string, menuId: string) => {
    const baseItems = [
      {
        menu_id: menuId,
        name: 'Maltese Ftira Bread',
        description: 'Traditional Maltese sourdough bread with tomatoes, olives, and local cheese',
        price: 8.50,
        category: 'starters',
        available: true,
        popular: true
      },
      {
        menu_id: menuId,
        name: 'Bragioli',
        description: 'Traditional Maltese beef olives stuffed with breadcrumbs, bacon, and herbs',
        price: 18.50,
        category: 'mains',
        available: true,
        popular: true
      },
      {
        menu_id: menuId,
        name: 'Kinnie',
        description: 'Malta\'s national soft drink with bitter orange and herbs',
        price: 3.50,
        category: 'drinks',
        available: true,
        popular: true
      }
    ];

    if (vendorSlug === 'harbour-bistro') {
      baseItems.push({
        menu_id: menuId,
        name: 'Grilled Sea Bass',
        description: 'Fresh local sea bass with Mediterranean herbs and lemon',
        price: 24.00,
        category: 'mains',
        available: true,
        popular: true
      });
    }

    return baseItems;
  };

  return { seedDemoData, isSeeding };
};
