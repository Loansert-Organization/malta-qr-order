
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentIntentId, orderId } = await req.json();

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    let paymentStatus = 'pending';
    
    if (paymentIntentId) {
      // Check Stripe payment status
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paymentStatus = paymentIntent.status;
      
      // Update payment record
      await supabase
        .from('payments')
        .update({
          status: paymentStatus === 'succeeded' ? 'paid' : paymentStatus,
          processed_at: paymentStatus === 'succeeded' ? new Date().toISOString() : null
        })
        .eq('order_id', orderId);
    }

    // Get current order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status, payment_status')
      .eq('id', orderId)
      .single();

    if (orderError) throw orderError;

    // Update order payment status if payment succeeded
    if (paymentStatus === 'succeeded' && order.payment_status !== 'paid') {
      await supabase
        .from('orders')
        .update({
          payment_status: 'paid'
        })
        .eq('id', orderId);
    }

    return new Response(
      JSON.stringify({
        paymentStatus,
        orderStatus: order.status,
        paymentRecordStatus: order.payment_status
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Payment verification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
