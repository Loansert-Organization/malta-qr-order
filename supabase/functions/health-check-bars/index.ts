
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

    // Get all bars without website URLs
    const { data: bars, error } = await supabaseClient
      .from('bars')
      .select('id, name, address, website_url')
      .order('name')

    if (error) {
      throw error
    }

    console.log(`📊 Found ${bars.length} bars to check`)

    let healthyBars = 0
    let barsWithWebsites = 0
    let barsNeedingWebsites = 0

    // Check each bar
    for (const bar of bars) {
      try {
        if (bar.website_url) {
          barsWithWebsites++
          
          // Check if website is accessible
          const response = await fetch(bar.website_url, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(5000) // 5 second timeout
          })
          
          if (response.ok) {
            healthyBars++
            console.log(`✅ ${bar.name} - Website healthy`)
          } else {
            console.log(`⚠️ ${bar.name} - Website responded with ${response.status}`)
          }
        } else {
          barsNeedingWebsites++
          console.log(`❌ ${bar.name} - No website URL`)
        }
      } catch (error) {
        console.log(`❌ ${bar.name} - Website check failed:`, error.message)
      }
    }

    const summary = {
      total_bars: bars.length,
      bars_with_websites: barsWithWebsites,
      healthy_websites: healthyBars,
      bars_needing_websites: barsNeedingWebsites,
      health_percentage: barsWithWebsites > 0 ? Math.round((healthyBars / barsWithWebsites) * 100) : 0
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
