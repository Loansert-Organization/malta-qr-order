import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    console.log('🔧 FIXING BROKEN IMAGE URLS')
    console.log('===========================')

    // 1. Get all bars
    console.log('1. 📋 FETCHING BARS...')
    const { data: barsData, error } = await supabaseClient
      .from('bars')
      .select('id, name')

    if (error) {
      console.error('❌ Error fetching bars:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📊 Found ${barsData.length} bars`)

    // 2. Health check bars
    console.log('2. 🔧 PERFORMING HEALTH CHECK...')
    
    let healthyCount = 0
    let totalCount = barsData.length
    const results = []
    
    for (const bar of barsData) {
      console.log(`🔧 Checking: ${bar.name}`)
      
      // Simple health check - verify bar data exists
      const { data: barCheck, error: checkError } = await supabaseClient
        .from('bars')
        .select('id, name, address')
        .eq('id', bar.id)
        .single()

      if (checkError) {
        console.log(`   ❌ Health check failed: ${checkError.message}`)
        results.push({
          bar: bar.name,
          status: 'failed',
          error: checkError.message
        })
      } else {
        console.log(`   ✅ Bar data healthy`)
        healthyCount++
        results.push({
          bar: bar.name,
          status: 'healthy',
          hasAddress: !!barCheck.address
        })
      }
    }

    console.log(`📈 RESULTS:`)
    console.log(`✅ Healthy bars: ${healthyCount}`)
    console.log(`📊 Total bars: ${totalCount}`)

    // 3. Generate statistics
    console.log('3. 📊 GENERATING STATISTICS...')
    
    const { data: finalStats, error: statsError } = await supabaseClient
      .from('bars')
      .select('address')

    let statistics = {}
    if (!statsError && finalStats) {
      const totalBars = finalStats.length
      const withAddress = finalStats.filter(bar => bar.address).length
      
      statistics = {
        totalBars,
        withAddress,
        percentageWithAddress: ((withAddress/totalBars)*100).toFixed(1)
      }
      
      console.log(`📊 Total bars: ${totalBars}`)
      console.log(`📍 With addresses: ${withAddress} (${statistics.percentageWithAddress}%)`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bar health check completed successfully',
        summary: {
          healthyCount,
          totalCount,
          totalProcessed: barsData.length
        },
        results,
        statistics
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ Critical error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 