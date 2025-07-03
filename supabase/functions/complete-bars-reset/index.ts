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

    console.log('🧹 COMPLETE BARS TABLE RESET')
    console.log('============================')

    // First get all bars to delete them properly
    const { data: allBars, error: fetchError } = await supabaseClient
      .from('bars')
      .select('id')

    if (fetchError) {
      console.error('❌ Error fetching bars:', fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📊 Found ${allBars?.length || 0} bars to delete`)

    if (allBars && allBars.length > 0) {
      // Delete all bars one by one
      let deletedCount = 0
      for (const bar of allBars) {
        const { error: deleteError } = await supabaseClient
          .from('bars')
          .delete()
          .eq('id', bar.id)

        if (deleteError) {
          console.error(`❌ Error deleting bar ${bar.id}:`, deleteError)
        } else {
          deletedCount++
        }
      }
      console.log(`🗑️ Deleted ${deletedCount} bars`)
    }

    // Verify table is empty
    const { data: remainingBars, error: verifyError } = await supabaseClient
      .from('bars')
      .select('*')

    if (verifyError) {
      console.error('❌ Error verifying empty table:', verifyError)
      return new Response(JSON.stringify({ error: verifyError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ BARS TABLE COMPLETELY CLEARED')
    console.log(`📊 Remaining bars: ${remainingBars?.length || 0}`)
    console.log('🎯 Ready for fresh bar list from user')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bars table completely cleared',
        deletedBars: allBars?.length || 0,
        remainingBars: remainingBars?.length || 0,
        status: 'EMPTY_AND_READY'
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