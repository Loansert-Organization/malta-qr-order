import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Supabase client setup
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const menuData = await req.json();

    for (const restaurant of menuData) {
      const restaurantName = restaurant.restaurant_name;

      // Find the bar_id for the current restaurant
      const { data: bar, error: barError } = await supabase
        .from('bars')
        .select('id')
        .eq('name', restaurantName)
        .single();

      if (barError || !bar) {
        console.warn(`Restaurant not found, skipping: ${restaurantName}`);
        continue;
      }

      const menuItems = restaurant.menu.map((item: any) => ({
        bar_id: bar.id,
        name: item.item,
        description: item.description,
        price: item.price,
        category: item.class,
        subcategory: item.subcategory,
        is_available: true,
      }));

      if (menuItems.length > 0) {
        const { error: insertError } = await supabase.from('menus').insert(menuItems);
        if (insertError) {
          console.error(`Error inserting menu for ${restaurantName}:`, insertError);
        }
      }
    }

    return new Response(JSON.stringify({ message: 'Menu data uploaded successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
}); 