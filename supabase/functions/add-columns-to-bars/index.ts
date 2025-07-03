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

    console.log('🔧 ADDING COLUMNS TO BARS TABLE')
    console.log('==============================')

    // Add country column
    const { error: countryError } = await supabaseClient.rpc('exec_sql', {
      sql: 'ALTER TABLE bars ADD COLUMN IF NOT EXISTS country TEXT;'
    })

    if (countryError) {
      console.error('❌ Error adding country column:', countryError)
    } else {
      console.log('✅ Country column added')
    }

    // Add photos column
    const { error: photosError } = await supabaseClient.rpc('exec_sql', {
      sql: 'ALTER TABLE bars ADD COLUMN IF NOT EXISTS photos JSONB;'
    })

    if (photosError) {
      console.error('❌ Error adding photos column:', photosError)
    } else {
      console.log('✅ Photos column added')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Columns added to bars table',
        countryColumnAdded: !countryError,
        photosColumnAdded: !photosError
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