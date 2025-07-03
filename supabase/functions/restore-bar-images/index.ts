import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

    console.log('🔍 Starting bar image restoration...');

    // First, ensure the photo_url column exists
    const { error: alterError } = await supabaseClient.rpc('exec_sql', {
      sql: `
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS photo_url TEXT;
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS latitude NUMERIC;
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS longitude NUMERIC;
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS photo_ref TEXT;
      `
    });

    if (alterError) {
      console.log('⚠️ Column might already exist:', alterError);
    } else {
      console.log('✅ Added photo_url column to bars table');
    }

    // Get bars without images
    const { data: barsWithoutImages, error: fetchError } = await supabaseClient
      .from('bars')
      .select('*')
      .or('photo_url.is.null,photo_url.eq.')
      .limit(20);

    if (fetchError) throw fetchError;

    console.log(`📸 Found ${barsWithoutImages.length} bars without images`);

    let imagesRestored = 0;
    const results = [];

    for (const bar of barsWithoutImages) {
      try {
        console.log(`🔍 Processing: ${bar.name}`);
        
        // Search for the bar using Google Places Text Search
        const searchQuery = `${bar.name} ${bar.address}`.replace(/[^a-zA-Z0-9\s]/g, ' ');
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0];
          console.log(`   Found place: ${place.name}`);
          
          // Get place details with photos
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,photos,geometry&key=${GOOGLE_MAPS_API_KEY}`;
          
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          
          if (detailsData.result && detailsData.result.photos && detailsData.result.photos.length > 0) {
            const photoReference = detailsData.result.photos[0].photo_reference;
            
            // Generate Google Maps photo URL
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
            
            // Extract coordinates if available
            const geometry = detailsData.result.geometry;
            const latitude = geometry?.location?.lat;
            const longitude = geometry?.location?.lng;
            
            console.log(`   📸 Adding photo URL for ${bar.name}`);
            
            // Update the bar with the photo URL and coordinates
            const { error: updateError } = await supabaseClient
              .from('bars')
              .update({ 
                photo_url: photoUrl,
                photo_ref: photoReference,
                latitude: latitude,
                longitude: longitude,
                google_place_id: place.place_id,
                updated_at: new Date().toISOString()
              })
              .eq('id', bar.id);

            if (updateError) {
              console.error(`   ❌ Error updating ${bar.name}:`, updateError);
              results.push({ bar: bar.name, status: 'error', error: updateError.message });
            } else {
              console.log(`   ✅ Updated ${bar.name} with photo`);
              imagesRestored++;
              results.push({ bar: bar.name, status: 'success', photo_url: photoUrl });
            }
          } else {
            console.log(`   ⚠️ No photos found for ${bar.name}`);
            results.push({ bar: bar.name, status: 'no_photos' });
          }
        } else {
          console.log(`   ⚠️ Place not found: ${bar.name}`);
          results.push({ bar: bar.name, status: 'not_found' });
        }
        
        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`   ❌ Error processing ${bar.name}:`, error);
        results.push({ bar: bar.name, status: 'error', error: error.message });
      }
    }

    // Get final stats
    const { data: finalStats } = await supabaseClient
      .from('bars')
      .select('count', { count: 'exact' })
      .not('photo_url', 'is', null);

    const totalBarsWithImages = finalStats?.[0]?.count || 0;

    console.log(`🎉 Image restoration completed!`);
    console.log(`   📸 Images restored: ${imagesRestored}`);
    console.log(`   📊 Total bars with images: ${totalBarsWithImages}`);

    return new Response(
      JSON.stringify({
        success: true,
        images_restored: imagesRestored,
        total_processed: barsWithoutImages.length,
        total_bars_with_images: totalBarsWithImages,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error in restore-bar-images function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
