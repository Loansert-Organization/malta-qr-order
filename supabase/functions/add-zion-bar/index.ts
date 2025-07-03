import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🏪 Adding Zion Bar & Restaurant to the database...')

    // Insert Zion Bar & Restaurant
    const { data, error } = await supabaseClient
      .from('bars')
      .upsert({
        name: 'Zion Bar & Restaurant',
        address: 'St Thomas Bay, Marsaskala, Malta',
        google_place_id: '0x130e5b7da8ed0c95:0xd732a6cfa8526a23'
      }, {
        onConflict: 'google_place_id'
      })

    if (error) {
      console.error('❌ Error inserting bar:', error)
      throw error
    }

    console.log('✅ Successfully added Zion Bar & Restaurant')

    return new Response(JSON.stringify({
      success: true,
      message: 'Zion Bar & Restaurant added successfully',
      data: data
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('💥 Fatal error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
}) 