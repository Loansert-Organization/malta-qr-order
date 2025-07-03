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

    console.log('🍺 Adding Malta bars to database...')

    // Malta bars list from user request
    const maltaBars = [
      'Aqualuna Lido',
      'Bistro 516',
      'Black Bull',
      'Brown\'s Kitchen',
      'Bus Stop Lounge',
      'Cafe Cuba St Julians',
      'Cuba Campus Hub',
      'Cuba Shoreline',
      'Doma Marsascala',
      'Exiles',
      'Felice Brasserie',
      'Fortizza',
      'House of Flavors',
      'Kings Gate',
      'Mamma Mia',
      'Medasia Fusion Lounge',
      'Okurama Asian Fusion',
      'Paparazzi 29',
      'Peperino Pizza Cucina Verace',
      'Sakura Japanese Cuisine Lounge',
      'Spinola Cafe Lounge St Julians',
      'Surfside',
      'Tex Mex American Bar Grill Paceville',
      'The Brew Bar Grill',
      'The Londoner British Pub Sliema',
      'Victoria Gastro Pub',
      'Zion Reggae Bar'
    ];

    let addedCount = 0;
    let skippedCount = 0;
    const results = [];

    for (const barName of maltaBars) {
      console.log(`🔍 Processing: ${barName}`);

      // Check if bar already exists
      const { data: existingBar, error: checkError } = await supabaseClient
        .from('bars')
        .select('id, name')
        .eq('name', barName)
        .maybeSingle();

      if (checkError) {
        console.error(`❌ Error checking ${barName}:`, checkError);
        results.push({
          name: barName,
          status: 'error',
          message: checkError.message
        });
        continue;
      }

      if (existingBar) {
        console.log(`⏭️ Bar already exists: ${barName}`);
        skippedCount++;
        results.push({
          name: barName,
          status: 'skipped',
          message: 'Already exists'
        });
        continue;
      }

      // Insert new bar
      const { data: newBar, error: insertError } = await supabaseClient
        .from('bars')
        .insert({
          name: barName,
          address: 'Malta', // Generic address for now
          has_menu: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error(`❌ Error inserting ${barName}:`, insertError);
        results.push({
          name: barName,
          status: 'error',
          message: insertError.message
        });
      } else {
        console.log(`✅ Added: ${barName}`);
        addedCount++;
        results.push({
          name: barName,
          status: 'added',
          id: newBar.id
        });
      }
    }

    console.log(`📊 Summary: ${addedCount} added, ${skippedCount} skipped`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Malta bars processing completed',
        summary: {
          total_processed: maltaBars.length,
          added: addedCount,
          skipped: skippedCount,
          errors: results.filter(r => r.status === 'error').length
        },
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ Critical error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})