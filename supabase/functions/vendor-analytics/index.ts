
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AnalyticsRequest {
  vendorId: string;
  dateRange: {
    start: string;
    end: string;
  };
  analysisType: 'sales' | 'menu' | 'customer' | 'comprehensive';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📊 Vendor Analytics request received');
    
    const { vendorId, dateRange, analysisType }: AnalyticsRequest = await req.json();
    
    console.log(`Generating ${analysisType} analytics for vendor: ${vendorId}`);
    
    // Fetch vendor data
    const { data: vendor } = await supabase
      .from('vendors')
      .select('business_name, category')
      .eq('id', vendorId)
      .single();

    // Fetch orders data
    const { data: orders } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        status,
        created_at,
        payment_status,
        order_items (
          quantity,
          unit_price,
          menu_item_id,
          menu_items (
            name,
            category,
            price
          )
        )
      `)
      .eq('vendor_id', vendorId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .eq('payment_status', 'paid');

    // Fetch menu items
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', vendorId); // Assuming menu_id links to vendor

    // Generate analytics based on type
    let analyticsData;
    
    switch (analysisType) {
      case 'sales':
        analyticsData = await generateSalesAnalytics(orders || [], vendor);
        break;
      case 'menu':
        analyticsData = await generateMenuAnalytics(orders || [], menuItems || []);
        break;
      case 'customer':
        analyticsData = await generateCustomerAnalytics(orders || []);
        break;
      case 'comprehensive':
        analyticsData = await generateComprehensiveAnalytics(orders || [], menuItems || [], vendor);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    // Generate AI insights
    const aiInsights = await generateAIInsights(analyticsData, analysisType, vendor);

    // Store analytics in database
    await supabase
      .from('analytics')
      .insert({
        vendor_id: vendorId,
        date: new Date().toISOString().split('T')[0],
        metric_type: `${analysisType}_analytics`,
        metric_value: orders?.length || 0,
        metadata: {
          analytics_data: analyticsData,
          ai_insights: aiInsights,
          date_range: dateRange
        }
      });

    console.log('✅ Analytics generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        vendor: vendor,
        analytics: analyticsData,
        ai_insights: aiInsights,
        period: dateRange,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in vendor-analytics:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback_data: {
          total_revenue: 0,
          total_orders: 0,
          insights: ['Unable to generate insights at this time']
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function generateSalesAnalytics(orders: any[], vendor: any) {
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group by day
  const dailySales: { [key: string]: { revenue: number; orders: number } } = {};
  orders.forEach(order => {
    const date = order.created_at.split('T')[0];
    if (!dailySales[date]) {
      dailySales[date] = { revenue: 0, orders: 0 };
    }
    dailySales[date].revenue += Number(order.total_amount);
    dailySales[date].orders += 1;
  });

  // Group by hour
  const hourlySales: { [key: string]: number } = {};
  orders.forEach(order => {
    const hour = new Date(order.created_at).getHours();
    hourlySales[hour] = (hourlySales[hour] || 0) + Number(order.total_amount);
  });

  return {
    summary: {
      total_revenue: totalRevenue,
      total_orders: totalOrders,
      average_order_value: averageOrderValue,
      completed_orders: orders.filter(o => o.status === 'completed').length
    },
    daily_breakdown: Object.entries(dailySales).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    })),
    hourly_breakdown: Object.entries(hourlySales).map(([hour, revenue]) => ({
      hour: parseInt(hour),
      revenue
    })),
    business_info: vendor
  };
}

async function generateMenuAnalytics(orders: any[], menuItems: any[]) {
  // Calculate item popularity
  const itemSales: { [key: string]: { quantity: number; revenue: number; item: any } } = {};
  
  orders.forEach(order => {
    order.order_items?.forEach((orderItem: any) => {
      const itemId = orderItem.menu_item_id;
      if (!itemSales[itemId]) {
        itemSales[itemId] = {
          quantity: 0,
          revenue: 0,
          item: orderItem.menu_items
        };
      }
      itemSales[itemId].quantity += orderItem.quantity;
      itemSales[itemId].revenue += orderItem.quantity * Number(orderItem.unit_price);
    });
  });

  // Top selling items
  const topItems = Object.values(itemSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  // Category performance
  const categoryPerformance: { [key: string]: { quantity: number; revenue: number } } = {};
  Object.values(itemSales).forEach(sale => {
    const category = sale.item?.category || 'Unknown';
    if (!categoryPerformance[category]) {
      categoryPerformance[category] = { quantity: 0, revenue: 0 };
    }
    categoryPerformance[category].quantity += sale.quantity;
    categoryPerformance[category].revenue += sale.revenue;
  });

  return {
    top_selling_items: topItems.map(item => ({
      name: item.item?.name,
      quantity_sold: item.quantity,
      revenue: item.revenue,
      category: item.item?.category
    })),
    category_performance: Object.entries(categoryPerformance).map(([category, data]) => ({
      category,
      quantity_sold: data.quantity,
      revenue: data.revenue
    })),
    menu_insights: {
      total_menu_items: menuItems.length,
      items_sold: Object.keys(itemSales).length,
      conversion_rate: (Object.keys(itemSales).length / menuItems.length) * 100
    }
  };
}

async function generateCustomerAnalytics(orders: any[]) {
  // Order timing analysis
  const hourlyOrders: { [key: string]: number } = {};
  const dayOfWeekOrders: { [key: string]: number } = {};
  
  orders.forEach(order => {
    const date = new Date(order.created_at);
    const hour = date.getHours();
    const dayOfWeek = date.getDay();
    
    hourlyOrders[hour] = (hourlyOrders[hour] || 0) + 1;
    dayOfWeekOrders[dayOfWeek] = (dayOfWeekOrders[dayOfWeek] || 0) + 1;
  });

  const peakHour = Object.entries(hourlyOrders).reduce((a, b) => 
    hourlyOrders[a[0]] > hourlyOrders[b[0]] ? a : b
  )[0];

  const peakDay = Object.entries(dayOfWeekOrders).reduce((a, b) => 
    dayOfWeekOrders[a[0]] > dayOfWeekOrders[b[0]] ? a : b
  )[0];

  return {
    timing_patterns: {
      peak_hour: parseInt(peakHour),
      peak_day: parseInt(peakDay),
      hourly_distribution: Object.entries(hourlyOrders).map(([hour, count]) => ({
        hour: parseInt(hour),
        orders: count
      })),
      daily_distribution: Object.entries(dayOfWeekOrders).map(([day, count]) => ({
        day: parseInt(day),
        orders: count
      }))
    },
    customer_behavior: {
      average_items_per_order: orders.reduce((sum, order) => 
        sum + (order.order_items?.length || 0), 0) / orders.length,
      total_unique_sessions: new Set(orders.map(o => o.guest_session_id)).size
    }
  };
}

async function generateComprehensiveAnalytics(orders: any[], menuItems: any[], vendor: any) {
  const salesData = await generateSalesAnalytics(orders, vendor);
  const menuData = await generateMenuAnalytics(orders, menuItems);
  const customerData = await generateCustomerAnalytics(orders);

  return {
    sales: salesData,
    menu: menuData,
    customer: customerData,
    overview: {
      health_score: calculateBusinessHealthScore(salesData, menuData, customerData),
      key_metrics: {
        revenue_trend: calculateRevenueTrend(salesData.daily_breakdown),
        menu_efficiency: menuData.menu_insights.conversion_rate,
        customer_satisfaction: calculateSatisfactionScore(orders)
      }
    }
  };
}

async function generateAIInsights(analyticsData: any, analysisType: string, vendor: any): Promise<string[]> {
  if (!openaiApiKey) {
    return ['AI insights are currently unavailable'];
  }

  try {
    const prompt = `Analyze this ${analysisType} analytics data for ${vendor?.business_name || 'a restaurant'} in Malta and provide 3-5 actionable business insights:

${JSON.stringify(analyticsData, null, 2)}

Focus on:
- Key trends and patterns
- Opportunities for improvement
- Specific actionable recommendations
- Malta market context

Provide insights as a JSON array of strings, each insight should be concise and actionable.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const insights = JSON.parse(data.choices[0].message.content);
    
    return Array.isArray(insights) ? insights : [data.choices[0].message.content];
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [
      'Revenue analysis shows opportunities for growth',
      'Menu optimization could improve profitability',
      'Customer timing patterns suggest peak hour strategies'
    ];
  }
}

function calculateBusinessHealthScore(salesData: any, menuData: any, customerData: any): number {
  let score = 0;
  
  // Revenue factor (40%)
  if (salesData.summary.total_revenue > 1000) score += 40;
  else if (salesData.summary.total_revenue > 500) score += 30;
  else if (salesData.summary.total_revenue > 100) score += 20;
  
  // Menu efficiency factor (30%)
  if (menuData.menu_insights.conversion_rate > 80) score += 30;
  else if (menuData.menu_insights.conversion_rate > 60) score += 25;
  else if (menuData.menu_insights.conversion_rate > 40) score += 15;
  
  // Order consistency factor (30%)
  if (salesData.summary.total_orders > 50) score += 30;
  else if (salesData.summary.total_orders > 20) score += 20;
  else if (salesData.summary.total_orders > 5) score += 10;
  
  return Math.min(score, 100);
}

function calculateRevenueTrend(dailyBreakdown: any[]): string {
  if (dailyBreakdown.length < 2) return 'insufficient_data';
  
  const recent = dailyBreakdown.slice(-3).reduce((sum, day) => sum + day.revenue, 0);
  const previous = dailyBreakdown.slice(-6, -3).reduce((sum, day) => sum + day.revenue, 0);
  
  if (recent > previous * 1.1) return 'growing';
  if (recent < previous * 0.9) return 'declining';
  return 'stable';
}

function calculateSatisfactionScore(orders: any[]): number {
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  return orders.length > 0 ? (completedOrders / orders.length) * 100 : 0;
}
