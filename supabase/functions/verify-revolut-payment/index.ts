import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface VerifyPaymentRequest {
  orderId: string;
  paymentReference: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, paymentReference }: VerifyPaymentRequest = await req.json();
    
    console.log(`Verifying Revolut payment for order: ${orderId}`);
    
    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, vendor:vendors(id, name, revolut_payment_link)')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error('Order not found');
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('payment_method', 'revolut')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (paymentError || !payment) {
      throw new Error('Payment record not found');
    }

    // In production, this would:
    // 1. Call Revolut Business API to verify payment
    // 2. Check transaction reference matches
    // 3. Verify amount matches order total
    
    // For now, we'll simulate verification with a simple check
    const isPaymentValid = payment.status === 'pending' && 
                          payment.amount === order.total_amount;

    if (isPaymentValid) {
      // Update payment status
      await supabase
        .from('payments')
        .update({ 
          status: 'completed',
          processed_at: new Date().toISOString(),
          revolut_transaction_id: paymentReference
        })
        .eq('id', payment.id);

      // Update order status
      await supabase
        .from('orders')
        .update({ 
          payment_status: 'completed',
          status: 'confirmed'
        })
        .eq('id', orderId);

      // Create vendor notification
      await supabase
        .from('vendor_notifications')
        .insert({
          vendor_id: order.vendor_id,
          order_id: orderId,
          notification_type: 'new_order',
          message: `New order #${orderId.slice(-8)} received - €${order.total_amount.toFixed(2)}`
        });

      // Log successful payment
      console.log(`✅ Payment verified for order ${orderId}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Payment verified successfully',
          order: {
            id: orderId,
            status: 'confirmed',
            payment_status: 'completed'
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      throw new Error('Payment verification failed');
    }

  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 