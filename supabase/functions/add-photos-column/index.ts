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

    console.log('🔧 ADDING PHOTOS COLUMN TO BARS TABLE')
    console.log('===================================')

    // Add photos column to bars table
    const { error: addColumnError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bars' AND column_name = 'photos') THEN
                ALTER TABLE bars ADD COLUMN photos JSONB DEFAULT '[]';
                CREATE INDEX IF NOT EXISTS idx_bars_photos ON bars USING GIN (photos);
            END IF;
        END $$;
      `
    })

    if (addColumnError) {
      console.error('❌ Error adding photos column:', addColumnError)
      return new Response(JSON.stringify({ 
        success: false,
        error: addColumnError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('✅ Photos column added successfully')

    // Test by checking the table structure
    const { data: tableInfo, error: checkError } = await supabaseClient
      .from('bars')
      .select('photos')
      .limit(1)

    if (checkError) {
      console.error('❌ Error checking table:', checkError)
    } else {
      console.log('✅ Table check successful, photos column exists')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Photos column added to bars table',
        columnAdded: !addColumnError,
        tableAccessible: !checkError
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