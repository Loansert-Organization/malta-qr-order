import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  name: string;
  image_url?: string;
}

interface OrderRequest {
  vendor_id: string;
  guest_session_id: string;
  items: OrderItem[];
  total_amount: number;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: string;
  special_instructions?: string;
  payment_method?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const orderData: OrderRequest = await req.json();

    console.log('Processing order:', { 
      vendor_id: orderData.vendor_id,
      items_count: orderData.items.length,
      total: orderData.total_amount 
    });

    // Validate order data
    if (!orderData.vendor_id || !orderData.items.length) {
      throw new Error('Invalid order data: vendor_id and items are required');
    }

    // Validate items exist and prices match
    const itemIds = orderData.items.map(item => item.menu_item_id);
    const { data: menuItems, error: menuError } = await supabase
      .from('menu_items')
      .select('id, name, price, available')
      .in('id', itemIds)
      .eq('available', true);

    if (menuError) throw menuError;

    // Verify all items exist and are available
    for (const orderItem of orderData.items) {
      const menuItem = menuItems?.find(mi => mi.id === orderItem.menu_item_id);
      if (!menuItem) {
        throw new Error(`Menu item ${orderItem.menu_item_id} not found or unavailable`);
      }
      
      // Verify price matches (within small tolerance for floating point)
      if (Math.abs(menuItem.price - orderItem.unit_price) > 0.01) {
        console.warn(`Price mismatch for ${menuItem.name}: expected ${menuItem.price}, got ${orderItem.unit_price}`);
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        vendor_id: orderData.vendor_id,
        guest_session_id: orderData.guest_session_id,
        total_amount: orderData.total_amount,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        table_number: orderData.table_number,
        special_instructions: orderData.special_instructions,
        payment_method: orderData.payment_method || 'pending',
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Create order items
    const orderItemsData = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData);

    if (itemsError) throw itemsError;

    // Get vendor details for WhatsApp
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('name, contact_number, whatsapp_number')
      .eq('id', orderData.vendor_id)
      .single();

    if (vendorError) {
      console.warn('Could not fetch vendor details:', vendorError);
    }

    // Send WhatsApp notification if vendor has WhatsApp number
    const whatsappNumber = vendor?.whatsapp_number || vendor?.contact_number;
    if (whatsappNumber) {
      try {
        await sendWhatsAppNotification(order, orderData.items, vendor.name, whatsappNumber);
      } catch (whatsappError) {
        console.error('Failed to send WhatsApp notification:', whatsappError);
        // Don't fail the order if WhatsApp fails
      }
    }

    // Log order creation
    console.log('Order created successfully:', {
      order_id: order.id,
      vendor_id: orderData.vendor_id,
      total_amount: orderData.total_amount,
      items_count: orderData.items.length
    });

    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.id,
        order,
        estimated_ready_time: new Date(Date.now() + 20 * 60 * 1000).toISOString() // 20 minutes from now
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

async function sendWhatsAppNotification(
  order: any, 
  items: OrderItem[], 
  vendorName: string, 
  whatsappNumber: string
) {
  const orderSummary = `🍽️ NEW ORDER #${order.id.slice(0, 8).toUpperCase()}

📍 ${vendorName}
━━━━━━━━━━━━━━━━━━━━

${items.map(item => `${item.quantity}x ${item.name}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━
💰 Total: ${order.total_amount.toFixed(2)}
${order.customer_phone ? `📱 Customer: ${order.customer_phone}` : ''}
${order.table_number ? `🪑 Table: ${order.table_number}` : ''}
${order.special_instructions ? `📝 Notes: ${order.special_instructions}` : ''}

⏰ Received: ${new Date().toLocaleTimeString()}

Reply with CONFIRM to accept this order.`;

  // Here you would integrate with your WhatsApp API
  // For now, we'll just log the message
  console.log('WhatsApp notification would be sent to:', whatsappNumber);
  console.log('Message:', orderSummary);
  
  // If you have WhatsApp Business API integration, implement it here
  // Example: await whatsappAPI.sendMessage(whatsappNumber, orderSummary);
}