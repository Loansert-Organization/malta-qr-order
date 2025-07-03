import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BarData {
  name: string;
  address: string;
  menuItems: MenuItemData[];
}

interface MenuItemData {
  name: string;
  description?: string;
  price: number;
  category: string;
  subcategory?: string;
}

const barDataWithMenus: BarData[] = [
  {
    name: 'Okurama Asian Fusion',
    address: 'Malta',
    menuItems: [
      { name: 'Red Curry Duck', price: 14.5, category: 'CHEF\'S SPECIALS' },
      { name: 'Pad Kee Mao Duck', price: 14, category: 'CHEF\'S SPECIALS' },
      { name: 'Hong Kong Duck (Half)', price: 16.5, category: 'CHEF\'S SPECIALS' },
      { name: 'Hong Kong Duck (Whole)', price: 29.5, category: 'CHEF\'S SPECIALS' },
      { name: 'Avocado Nigiri', price: 3.8, category: 'SUSHI NIGIRI' },
      { name: 'Sweet Egg Nigiri', price: 3.8, category: 'SUSHI NIGIRI' },
      { name: 'Tofu Pocket Nigiri', price: 3.8, category: 'SUSHI NIGIRI' },
      { name: 'Salmon Nigiri', price: 4.6, category: 'SUSHI NIGIRI' },
      { name: 'Tuna Nigiri', price: 4.8, category: 'SUSHI NIGIRI' },
      { name: 'Prawn Nigiri', price: 4.6, category: 'SUSHI NIGIRI' },
      { name: 'Flame Seared Salmon Nigiri', price: 4.6, category: 'SUSHI NIGIRI' },
      { name: 'Eel Nigiri', price: 5, category: 'SUSHI NIGIRI' },
      { name: 'Beef Ribeye Nigiri', price: 5.5, category: 'SUSHI NIGIRI' },
      { name: 'Seaweed Gunkan', price: 3.8, category: 'SUSHI GUNKAN' },
      { name: 'Spicy Salmon Gunkun', price: 4.6, category: 'SUSHI GUNKAN' },
      { name: 'Spicy Tuna Gunkun', price: 4.6, category: 'SUSHI GUNKAN' },
      { name: 'Tobiko Gunkun', price: 4.6, category: 'SUSHI GUNKAN' },
      { name: 'Grilled Salmon & Philadelphia Gunkun', price: 4.6, category: 'SUSHI GUNKAN' },
      { name: 'Crab Stick & Mayo Gunkun', price: 4.6, category: 'SUSHI GUNKAN' },
      { name: 'Avocado', price: 4.3, category: 'HOSOMAKI' },
      { name: 'Cucumber', price: 4.3, category: 'HOSOMAKI' },
      { name: 'Philadelphia Cheese', price: 4.3, category: 'HOSOMAKI' },
      { name: 'Salmon', price: 5, category: 'HOSOMAKI' },
      { name: 'Tuna', price: 5, category: 'HOSOMAKI' },
      { name: 'Crab Stick', price: 5, category: 'HOSOMAKI' },
      { name: 'Vegetarian', description: 'Lettuce, carrot, cucumber, avocado, garlic mayo', price: 4.5, category: 'TEMAKI' },
      { name: 'California', description: 'Crab stick, sweet egg, avocado, tobiko, mayo', price: 5, category: 'TEMAKI' },
      { name: 'Salmon & Cucumber', description: 'Salmon, cucumber, tobiko, garlic mayo', price: 5, category: 'TEMAKI' },
      { name: 'Tuna & Cucumber', description: 'Tuna, cucumber, green masago, garlic mayo', price: 5, category: 'TEMAKI' },
      { name: 'Teriyaki Chicken', description: 'Teriyaki chicken, cucumber, teriyaki sauce, sesame seeds', price: 5, category: 'TEMAKI' },
      { name: 'Prawn Tempura', description: 'Prawn tempura, avocado, teriyaki sauce, mayo', price: 5, category: 'TEMAKI' },
      { name: 'Salmon Sashimi', price: 11.5, category: 'SASHIMI' },
      { name: 'Tuna Sashimi', price: 11.5, category: 'SASHIMI' },
      { name: 'Mixed Sashimi (8 Pieces)', price: 17, category: 'SASHIMI' },
    ]
  },
  {
    name: 'House of Flavors',
    address: 'Malta',
    menuItems: [
      { name: 'English Breakfast', description: 'Eggs, bacon, sausages, baked beans, tomatoes, toast', price: 7.5, category: 'BREAKFAST' },
      { name: 'Omelettes', description: 'Choose one: ham, cheese, onion, tomatoes, mushroom, salmon topping; served with toast', price: 6.5, category: 'BREAKFAST' },
      { name: 'Ftira Bajd U Laham', description: 'Maltese ftira, sliced beef, fried eggs, caramelized onions', price: 7, category: 'SNACKS' },
      { name: 'Parma Ham', description: 'Rucola, cherry tomatoes, parmesan shavings', price: 6.5, category: 'SNACKS' },
      { name: 'Tuna', description: 'Tuna, olives, capers, tomatoes, ġbejna, onions, kunserva, fresh mint', price: 5.5, category: 'SNACKS' },
      { name: 'Chicken & Bacon', description: 'Chicken, bacon, lettuce, tomatoes, mango mayo', price: 6, category: 'SNACKS' },
      { name: 'Smoked Salmon', description: 'Smoked salmon, Philadelphia cheese, tomatoes, rucola', price: 8, category: 'SNACKS' },
      { name: 'Chips', price: 3, category: 'SNACKS' },
      { name: 'Ham & Cheese Toast', price: 3.5, category: 'TOASTIE' },
      { name: 'Bacon, Cheese & Egg Toast', price: 4.5, category: 'TOASTIE' },
      { name: 'Cheese & Tomato Toast', price: 3.5, category: 'TOASTIE' },
      { name: 'Egg & Cheese Toast', price: 3, category: 'TOASTIE' },
    ]
  },
  {
    name: 'Peperino Pizza Cucina Verace',
    address: 'Malta',
    menuItems: [
      { name: 'Tartare', description: 'Beef tartare with capers, black olives, red onions, butter croutons', price: 16, category: 'APPETIZERS' },
      { name: 'Crocchè (2 pcs)', description: 'Deep fried potato croquettes', price: 8, category: 'APPETIZERS' },
      { name: 'Malelingue', description: 'Lightly fried pizza dough strips with cherry tomatoes', price: 9, category: 'APPETIZERS' },
      { name: 'Montanara', description: 'Traditional Neapolitan fried pizza dough with Piennolo tomatoes, parmesan, basil', price: 12, category: 'APPETIZERS' },
      { name: 'Bruschette with Tomatoes (4 pcs)', price: 8, category: 'APPETIZERS' },
      { name: 'Marinara', description: 'Tomato sauce, garlic, oregano, olive oil', price: 8, category: 'PIZZE VERACI' },
      { name: 'Margherita', description: 'Tomato sauce, mozzarella, basil, parmesan, olive oil', price: 10, category: 'PIZZE VERACI' },
      { name: 'Margherita con Bufala', description: 'Buffalo mozzarella, tomato sauce, basil, parmesan, olive oil', price: 12.5, category: 'PIZZE VERACI' },
      { name: 'Provola e Pepe', description: 'Tomato sauce, provola cheese, black pepper, parmesan', price: 11, category: 'PIZZE VERACI' },
      { name: 'Capricciosa', description: 'Tomato sauce, mozzarella, ham, mushrooms, olives, artichokes', price: 15, category: 'PIZZE VERACI' },
      { name: 'Diavola', description: 'Tomato sauce, mozzarella, spicy salami, chili oil', price: 12, category: 'PIZZE VERACI' },
      { name: 'Quattro Formaggi', description: 'Fossa cheese, mozzarella, gorgonzola, parmesan', price: 13, category: 'PIZZE VERACI' },
    ]
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting Malta bars and menus population...');

    let barsCreated = 0;
    let menusCreated = 0;
    let menuItemsCreated = 0;
    const errors: string[] = [];

    for (const barData of barDataWithMenus) {
      try {
        console.log(`Processing bar: ${barData.name}`);

        // 1. Insert or update bar
        const { data: barResult, error: barError } = await supabaseClient
          .from('bars')
          .upsert({
            name: barData.name,
            address: barData.address,
            has_menu: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name'
          })
          .select()
          .single();

        if (barError) {
          errors.push(`Bar ${barData.name}: ${barError.message}`);
          continue;
        }

        console.log(`Bar processed: ${barResult.name} (ID: ${barResult.id})`);
        barsCreated++;

        // 2. Create or get menu for the bar
        const { data: menuResult, error: menuError } = await supabaseClient
          .from('menus')
          .upsert({
            vendor_id: barResult.id, // Using bar_id as vendor_id for now
            name: 'Main Menu',
            active: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'vendor_id'
          })
          .select()
          .single();

        if (menuError) {
          errors.push(`Menu for ${barData.name}: ${menuError.message}`);
          continue;
        }

        console.log(`Menu processed for ${barData.name} (Menu ID: ${menuResult.id})`);
        menusCreated++;

        // 3. Insert menu items in batches
        const batchSize = 50;
        for (let i = 0; i < barData.menuItems.length; i += batchSize) {
          const batch = barData.menuItems.slice(i, i + batchSize);
          
          const menuItemsData = batch.map(item => ({
            bar_id: barResult.id,
            menu_id: menuResult.id,
            name: item.name,
            description: item.description || null,
            price: item.price,
            category: item.category,
            subcategory: item.subcategory || null,
            available: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          const { error: itemsError } = await supabaseClient
            .from('menu_items')
            .upsert(menuItemsData, {
              onConflict: 'bar_id,name'
            });

          if (itemsError) {
            errors.push(`Menu items batch for ${barData.name}: ${itemsError.message}`);
          } else {
            menuItemsCreated += batch.length;
            console.log(`Batch of ${batch.length} menu items added for ${barData.name}`);
          }
        }

      } catch (error) {
        errors.push(`Error processing ${barData.name}: ${error.message}`);
        console.error(`Error processing ${barData.name}:`, error);
      }
    }

    const result = {
      success: true,
      message: 'Malta bars and menus population completed',
      summary: {
        barsProcessed: barsCreated,
        menusCreated: menusCreated,
        menuItemsCreated: menuItemsCreated,
        errors: errors.length,
        errorDetails: errors
      }
    };

    console.log('Final result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Critical error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Failed to populate Malta bars and menus'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});