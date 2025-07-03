import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔧 ADDING COLUMNS DIRECTLY')
    console.log('==========================')

    const dbUrl = `${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/exec_sql`
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Add country column
    const countryResponse = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey!
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE bars ADD COLUMN IF NOT EXISTS country TEXT;'
      })
    })

    const countryResult = await countryResponse.text()
    console.log('Country column result:', countryResult)

    // Add photos column  
    const photosResponse = await fetch(dbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey!
      },
      body: JSON.stringify({
        sql: 'ALTER TABLE bars ADD COLUMN IF NOT EXISTS photos JSONB;'
      })
    })

    const photosResult = await photosResponse.text()
    console.log('Photos column result:', photosResult)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Attempted to add columns',
        countryResponse: countryResult,
        photosResponse: photosResult
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