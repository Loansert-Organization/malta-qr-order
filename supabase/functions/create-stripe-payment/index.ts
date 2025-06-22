
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Processing Stripe payment request...');
    
    const { amount, currency = 'eur', order_id, customer_email } = await req.json();
    
    if (!amount || !order_id) {
      throw new Error('Missing required fields: amount or order_id');
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured');
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    console.log('💳 Creating Stripe checkout session...');

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: 'ICUPA Malta Order',
              description: `Order #${order_id.substring(0, 8)}...`,
            },
            unit_amount: amount, // Amount should be in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${order_id}`,
      cancel_url: `${req.headers.get("origin")}/restaurants`,
      customer_email: customer_email,
      metadata: {
        order_id: order_id,
      },
    });

    console.log('✅ Stripe session created:', session.id);

    // Update order with Stripe session ID
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await supabase
      .from('orders')
      .update({ 
        payment_status: 'processing',
        // Store stripe session ID in notes or create a new field
        notes: `Stripe session: ${session.id}` 
      })
      .eq('id', order_id);

    return new Response(
      JSON.stringify({ 
        url: session.url,
        session_id: session.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('❌ Stripe payment error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Payment processing failed',
        details: 'Please try again or contact support'
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
