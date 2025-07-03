import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🌍 Adding country field to bars table...');

    // Add country column if it doesn't exist
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bars' AND column_name = 'country') THEN
                ALTER TABLE bars ADD COLUMN country text DEFAULT 'Malta';
            END IF;
        END $$;
      `
    });

    if (alterError) {
      console.log('Column might already exist or using direct UPDATE approach');
    }

    // Update Malta bars (address contains "Malta")
    const { data: maltaUpdate, error: maltaError } = await supabase
      .from('bars')
      .update({ country: 'Malta' })
      .ilike('address', '%Malta%')
      .select('id');

    let maltaCount = 0;
    if (!maltaError && maltaUpdate) {
      maltaCount = maltaUpdate.length;
    }

    // Update Rwanda bars (address contains "Rwanda" or "Kigali")
    const { data: rwandaUpdate, error: rwandaError } = await supabase
      .from('bars')
      .update({ country: 'Rwanda' })
      .or('address.ilike.%Rwanda%,address.ilike.%Kigali%')
      .select('id');

    let rwandaCount = 0;
    if (!rwandaError && rwandaUpdate) {
      rwandaCount = rwandaUpdate.length;
    }

    // Get total count by country
    const { data: countryStats } = await supabase
      .from('bars')
      .select('country')
      .not('country', 'is', null);

    const statsMap = countryStats?.reduce((acc: any, bar: any) => {
      acc[bar.country] = (acc[bar.country] || 0) + 1;
      return acc;
    }, {}) || {};

    return new Response(JSON.stringify({
      success: true,
      message: 'Country field added and populated successfully',
      data: {
        malta_updated: maltaCount,
        rwanda_updated: rwandaCount,
        country_distribution: statsMap,
        total_bars: countryStats?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Error adding country field:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 