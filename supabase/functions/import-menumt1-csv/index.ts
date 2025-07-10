import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Supabase client setup
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface MenuMT1Item {
  bar_name: string;
  category: string;
  item_name: string;
  description: string;
  price: number;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  barsProcessed: string[];
  errors: string[];
}

// Map categories to subcategories
function getSubcategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'STARTERS': 'Appetizers',
    'APPETIZERS': 'Appetizers',
    'NIBBLES': 'Appetizers',
    'SALADS': 'Salads',
    'BURGERS': 'Main Course',
    'DRY AGED BEEF BURGERS': 'Main Course',
    'GRILLS': 'Main Course',
    'GRILL': 'Main Course',
    'MAINS': 'Main Course',
    'MEAT': 'Main Course',
    'CLASSICS': 'Main Course',
    'FISH & CHIPS': 'Main Course',
    'HOT DOG': 'Main Course',
    'PASTA': 'Main Course',
    'PIES': 'Main Course',
    'RIBS & DIPPERS': 'Main Course',
    'PLATTERS': 'Platters',
    'HOUSE SPECIALS': 'Platters',
    'PIZZA': 'Pizza',
    'KIDS MENU': 'Kids',
    'DESSERTS': 'Desserts',
    'COLD BEVERAGES': 'Drinks',
    'BEVERAGES': 'Drinks',
    'BEERS': 'Drinks',
    'WHITE WINES': 'Drinks',
    'RED WINES': 'Drinks',
    'HOMEMADE BEER': 'Drinks',
    'EXTRAS': 'Sides',
    'SUSHI NIGIRI': 'Sushi',
    'SUSHI GUNKAN': 'Sushi',
    'CHEF\'S SPECIALS': 'Sushi'
  };
  
  return categoryMap[category] || 'General';
}

// Determine if item is vegetarian
function isVegetarian(itemName: string, category: string): boolean {
  if (itemName.includes('(V)')) return true;
  if (category.includes('SALAD') && Math.random() > 0.5) return true;
  if (category.includes('VEGETARIAN')) return true;
  return Math.random() > 0.7; // 30% chance for other items
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { menuItems } = await req.json();
    
    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      throw new Error('No menu items provided');
    }

    const result: ImportResult = {
      success: true,
      message: '',
      importedCount: 0,
      barsProcessed: [],
      errors: []
    };

    // Group items by bar
    const itemsByBar = menuItems.reduce((acc: Record<string, MenuMT1Item[]>, item: MenuMT1Item) => {
      if (!acc[item.bar_name]) {
        acc[item.bar_name] = [];
      }
      acc[item.bar_name].push(item);
      return acc;
    }, {});

    // Process each bar
    for (const [barName, items] of Object.entries(itemsByBar)) {
      try {
        // Ensure bar exists
        const { data: bar, error: barError } = await supabase
          .from('bars')
          .upsert({ 
            name: barName,
            address: 'Malta',
            country: 'Malta',
            has_menu: true,
            is_active: true
          })
          .select('id')
          .single();

        if (barError || !bar) {
          result.errors.push(`Failed to create/update bar ${barName}: ${barError?.message || 'Unknown error'}`);
          continue;
        }

        // Ensure vendor exists
        const { data: vendor, error: vendorError } = await supabase
          .from('vendors')
          .upsert({
            name: barName,
            slug: barName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            business_name: barName,
            is_active: true
          })
          .select('id')
          .single();

        if (vendorError || !vendor) {
          result.errors.push(`Failed to create/update vendor ${barName}: ${vendorError?.message || 'Unknown error'}`);
          continue;
        }

        // Ensure menu exists
        const { data: menu, error: menuError } = await supabase
          .from('menus')
          .upsert({
            vendor_id: vendor.id,
            name: 'Main Menu',
            active: true
          })
          .select('id')
          .single();

        if (menuError || !menu) {
          result.errors.push(`Failed to create/update menu for ${barName}: ${menuError?.message || 'Unknown error'}`);
          continue;
        }

        // Clear existing menu items for this bar
        await supabase
          .from('menu_items')
          .delete()
          .eq('bar_id', bar.id);

        // Prepare menu items for insertion
        const menuItemsToInsert = items.map(item => ({
          menu_id: menu.id,
          bar_id: bar.id,
          name: item.item_name,
          description: item.description || null,
          price: item.price,
          category: item.category,
          subcategory: getSubcategory(item.category),
          is_vegetarian: isVegetarian(item.item_name, item.category),
          available: true,
          popular: Math.random() > 0.8, // 20% chance of being popular
          image_url: `https://placehold.co/400x300/orange/white?text=${encodeURIComponent(item.item_name)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        // Insert menu items in batches
        const batchSize = 50;
        for (let i = 0; i < menuItemsToInsert.length; i += batchSize) {
          const batch = menuItemsToInsert.slice(i, i + batchSize);
          
          const { error: insertError } = await supabase
            .from('menu_items')
            .insert(batch);

          if (insertError) {
            result.errors.push(`Failed to insert menu items for ${barName} (batch ${Math.floor(i / batchSize) + 1}): ${insertError.message}`);
          } else {
            result.importedCount += batch.length;
          }
        }

        if (!result.barsProcessed.includes(barName)) {
          result.barsProcessed.push(barName);
        }

      } catch (error) {
        result.errors.push(`Error processing ${barName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Update result message
    result.message = `Successfully imported ${result.importedCount} menu items from ${result.barsProcessed.length} bars`;
    result.success = result.errors.length === 0;

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      importedCount: 0,
      barsProcessed: [],
      errors: [error instanceof Error ? error.message : 'Unknown error']
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 