import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('🚀 Loading Malta establishments data from file...');
    
    // Read the scraped data file
    const fs = await import('fs');
    let maltaData;
    
    try {
      const fileContent = fs.readFileSync('/tmp/malta_establishments_data.json', 'utf8');
      maltaData = JSON.parse(fileContent);
    } catch (error) {
      // If file not found, use the API request body data
      const { establishments } = await req.json();
      maltaData = establishments;
    }
    
    if (!maltaData || maltaData.length === 0) {
      throw new Error('No Malta establishments data found');
    }

    console.log(`📊 Found ${maltaData.length} Malta establishments to insert`);

    // Process in batches to avoid timeout
    const batchSize = 25;
    let totalInserted = 0;
    const insertResults = [];

    for (let i = 0; i < maltaData.length; i += batchSize) {
      const batch = maltaData.slice(i, i + batchSize);
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(maltaData.length/batchSize)}`);
      
      const batchData = batch.map(bar => ({
        name: bar.name,
        address: bar.address,
        contact_number: bar.contact_number,
        rating: bar.rating,
        review_count: bar.review_count,
        google_place_id: bar.google_place_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase
        .from('bars')
        .insert(batchData)
        .select();

      if (error) {
        console.error(`❌ Batch ${Math.floor(i/batchSize) + 1} error:`, error);
        insertResults.push({ batch: Math.floor(i/batchSize) + 1, status: 'error', error: error.message });
      } else {
        console.log(`✅ Batch ${Math.floor(i/batchSize) + 1} success: ${data?.length || 0} establishments inserted`);
        totalInserted += data?.length || 0;
        insertResults.push({ 
          batch: Math.floor(i/batchSize) + 1, 
          status: 'success', 
          inserted: data?.length || 0 
        });
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`🎉 Malta establishments insertion completed!`);
    console.log(`   ✅ Total inserted: ${totalInserted} establishments`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added ${totalInserted} Malta establishments with Google Maps data`,
        total_processed: maltaData.length,
        total_inserted: totalInserted,
        batches: insertResults,
        sample_establishments: maltaData.slice(0, 10).map(bar => ({
          name: bar.name,
          rating: bar.rating,
          reviews: bar.review_count
        }))
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('❌ Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})
