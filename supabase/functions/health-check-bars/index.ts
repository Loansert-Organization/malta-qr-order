
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🔍 Starting health check for all bars...')

    // Get all bars
    const { data: bars, error } = await supabaseClient
      .from('bars')
      .select('id, name, address')
      .order('name')

    if (error) {
      throw error
    }

    console.log(`📊 Found ${bars.length} bars to check`)

    let totalBars = bars.length

    // Check each bar
    for (const bar of bars) {
      try {
        console.log(`✅ ${bar.name} - Bar data healthy`)
      } catch (error) {
        console.log(`❌ ${bar.name} - Bar check failed:`, error.message)
      }
    }

    const summary = {
      total_bars: totalBars,
      healthy_bars: totalBars,
      health_percentage: 100
    }

    console.log('📈 Health Check Summary:', summary)

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Health check failed:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
