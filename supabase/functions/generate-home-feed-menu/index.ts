import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    console.log(`🍽️ Generating home feed for category: ${category}, page: ${page}`);

    // 1. Get active promotions
    const { data: promotions, error: promoError } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .gte('valid_until', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(5);

    if (promoError) {
      console.error('Error fetching promotions:', promoError);
    }

    // 2. Get menu categories
    const { data: categories, error: catError } = await supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order');

    if (catError) {
      console.error('Error fetching categories:', catError);
    }

    // 3. Get menu items based on category filter
    let menuQuery = supabase
      .from('menu_items')
      .select(`
        *,
        menu_categories(name, icon)
      `)
      .eq('is_available', true);

    if (category !== 'all') {
      if (category === 'trending') {
        // For trending, get items with high order frequency (simulate with random for now)
        menuQuery = menuQuery.limit(limit * 2); // Get more to filter trending
      } else {
        // Filter by category name
        menuQuery = menuQuery.eq('menu_categories.name', category);
      }
    }

    const { data: menuItems, error: menuError } = await menuQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (menuError) {
      console.error('Error fetching menu items:', menuError);
    }

    // 4. For trending category, simulate trending logic
    let processedMenuItems = menuItems || [];
    if (category === 'trending') {
      processedMenuItems = processedMenuItems
        .sort(() => Math.random() - 0.5) // Simulate trending algorithm
        .slice(0, limit);
    }

    // 5. Get user's current cart count (if session provided)
    const sessionId = req.headers.get('x-session-id');
    let cartInfo = { itemCount: 0, total: 0 };
    
    if (sessionId) {
      const { data: cartData } = await supabase
        .from('carts')
        .select(`
          *,
          cart_items(
            qty,
            menu_items(price_local)
          )
        `)
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .single();

      if (cartData?.cart_items) {
        cartInfo.itemCount = cartData.cart_items.reduce((sum: number, item: any) => sum + item.qty, 0);
        cartInfo.total = cartData.cart_items.reduce((sum: number, item: any) => 
          sum + (item.qty * item.menu_items.price_local), 0
        );
      }
    }

    // 6. Generate smart greeting based on time
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Hello!';
    
    if (hour < 12) greeting = 'Good morning!';
    else if (hour < 17) greeting = 'Good afternoon!';
    else greeting = 'Good evening!';

    // 7. Get user loyalty info (if available)
    let loyaltyInfo = { points: 0, tier: 'Bronze' };
    if (sessionId) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('loyalty_points, loyalty_tier')
        .eq('session_id', sessionId)
        .single();
      
      if (profile) {
        loyaltyInfo = {
          points: profile.loyalty_points,
          tier: profile.loyalty_tier
        };
      }
    }

    const response = {
      success: true,
      data: {
        greeting: {
          message: greeting,
          subtext: sessionId ? `${loyaltyInfo.points} pts · ${loyaltyInfo.tier} tier` : 'Welcome to ICUPA!'
        },
        promotions: promotions || [],
        categories: categories || [],
        menuItems: processedMenuItems,
        pagination: {
          page,
          limit,
          hasMore: (menuItems?.length || 0) === limit
        },
        cart: cartInfo,
        meta: {
          totalPromotions: promotions?.length || 0,
          totalCategories: categories?.length || 0,
          currentCategory: category,
          generatedAt: new Date().toISOString()
        }
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Home feed generation error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: {
        greeting: { message: 'Welcome to ICUPA!', subtext: 'Discover amazing food & drinks' },
        promotions: [],
        categories: [
          { id: '1', name: 'All', icon: '🍽️', sort_order: 0 },
          { id: '2', name: 'Drinks', icon: '🍹', sort_order: 1 },
          { id: '3', name: 'Food', icon: '🍔', sort_order: 2 }
        ],
        menuItems: [],
        cart: { itemCount: 0, total: 0 }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});
