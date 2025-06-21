
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { vendor_id } = await req.json();

    // Get today's date range
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const yesterday = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch today's orders
    const { data: todayOrders, error: todayError } = await supabase
      .from('orders')
      .select('total_amount, created_at, payment_status')
      .eq('vendor_id', vendor_id)
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString());

    if (todayError) throw todayError;

    // Fetch yesterday's orders
    const { data: yesterdayOrders, error: yesterdayError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('vendor_id', vendor_id)
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', todayStart.toISOString())
      .eq('payment_status', 'paid');

    if (yesterdayError) throw yesterdayError;

    // Fetch popular items
    const { data: popularItems, error: popularError } = await supabase
      .from('order_items')
      .select(`
        quantity,
        unit_price,
        menu_item:menu_items (
          name
        ),
        order:orders!inner (
          vendor_id,
          created_at,
          payment_status
        )
      `)
      .gte('order.created_at', weekStart.toISOString())
      .eq('order.vendor_id', vendor_id)
      .eq('order.payment_status', 'paid');

    if (popularError) throw popularError;

    // Calculate metrics
    const todayRevenue = todayOrders
      ?.filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + order.total_amount, 0) || 0;

    const yesterdayRevenue = yesterdayOrders
      ?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

    const weekRevenue = todayRevenue; // Simplified for demo

    const totalOrders = todayOrders?.length || 0;
    const avgOrderValue = totalOrders > 0 ? todayRevenue / totalOrders : 0;

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (todayRevenue > yesterdayRevenue) trend = 'up';
    else if (todayRevenue < yesterdayRevenue) trend = 'down';

    // Process popular items
    const itemStats: Record<string, { orders: number; revenue: number }> = {};
    
    popularItems?.forEach(item => {
      const name = item.menu_item?.name || 'Unknown Item';
      if (!itemStats[name]) {
        itemStats[name] = { orders: 0, revenue: 0 };
      }
      itemStats[name].orders += item.quantity;
      itemStats[name].revenue += item.quantity * item.unit_price;
    });

    const popular_items = Object.entries(itemStats)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 5);

    // Calculate peak hour (simplified)
    const hourCounts: Record<number, number> = {};
    todayOrders?.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '12';

    const peakHourFormatted = `${peakHour}:00`;

    // Generate AI recommendations
    const ai_recommendations = [
      {
        type: 'menu' as const,
        title: 'Feature Popular Items',
        description: popular_items[0] ? 
          `${popular_items[0].name} is your top seller. Consider featuring it prominently on your menu.` :
          'Track your sales to identify popular items to feature.',
        priority: 'high' as const
      },
      {
        type: 'timing' as const,
        title: 'Optimize for Peak Hours',
        description: `Most orders come at ${peakHourFormatted}. Consider prep time and staffing for busy periods.`,
        priority: 'medium' as const
      },
      {
        type: 'pricing' as const,
        title: 'Revenue Optimization',
        description: trend === 'up' ? 
          'Revenue is trending upward. Consider introducing premium items.' :
          'Revenue could be improved. Review pricing strategy and item mix.',
        priority: trend === 'down' ? 'high' : 'low'
      }
    ];

    const analytics = {
      revenue: {
        today: todayRevenue,
        yesterday: yesterdayRevenue,
        week: weekRevenue,
        trend
      },
      orders: {
        total: totalOrders,
        avgValue: avgOrderValue,
        peakHour: peakHourFormatted
      },
      popular_items,
      ai_recommendations
    };

    return new Response(JSON.stringify(analytics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in vendor-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
