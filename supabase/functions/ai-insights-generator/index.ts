
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    // Fetch vendor data for context
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('name, business_name')
      .eq('id', vendor_id)
      .single();

    if (vendorError) throw vendorError;

    // Fetch recent orders and analytics
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const { data: recentOrders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        total_amount,
        created_at,
        status,
        payment_status,
        order_items (
          quantity,
          menu_item:menu_items (
            name,
            category,
            price
          )
        )
      `)
      .eq('vendor_id', vendor_id)
      .gte('created_at', weekAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (ordersError) throw ordersError;

    // Fetch menu items
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('name, category, price, popular, available')
      .eq('menu_id', vendor_id); // Simplified - should join through menus table

    if (menuError) throw menuError;

    // Prepare data summary for AI
    const dataContext = {
      vendor: {
        name: vendor.name,
        business_name: vendor.business_name
      },
      recent_performance: {
        total_orders: recentOrders?.length || 0,
        total_revenue: recentOrders?.reduce((sum, order) => 
          sum + (order.payment_status === 'paid' ? order.total_amount : 0), 0) || 0,
        avg_order_value: recentOrders?.length ? 
          (recentOrders.reduce((sum, order) => sum + order.total_amount, 0) / recentOrders.length) : 0
      },
      menu_summary: {
        total_items: menuItems?.length || 0,
        categories: [...new Set(menuItems?.map(item => item.category) || [])],
        price_range: {
          min: Math.min(...(menuItems?.map(item => item.price) || [0])),
          max: Math.max(...(menuItems?.map(item => item.price) || [0]))
        }
      }
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI business consultant specializing in restaurant optimization. 
            Analyze the provided restaurant data and generate 2-3 actionable insights as JSON.
            
            Return format:
            {
              "insights": [
                {
                  "type": "menu|pricing|timing|promotion",
                  "title": "Brief insight title",
                  "description": "Specific actionable recommendation",
                  "priority": "high|medium|low"
                }
              ]
            }
            
            Focus on:
            - Revenue optimization opportunities
            - Menu performance analysis
            - Customer behavior patterns
            - Operational efficiency improvements
            - Seasonal/location-specific suggestions`
          },
          {
            role: 'user',
            content: `Analyze this restaurant data and provide actionable insights:
            
            ${JSON.stringify(dataContext, null, 2)}
            
            Generate specific, actionable recommendations that this restaurant can implement immediately.`
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No response from AI');
    }

    const content = data.choices[0].message.content;
    
    // Parse JSON response
    let insights;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(content);
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback insights
      insights = {
        insights: [
          {
            type: 'menu',
            title: 'Menu Analysis Needed',
            description: 'Collect more order data to generate personalized menu insights.',
            priority: 'medium'
          }
        ]
      };
    }

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-insights-generator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      insights: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
