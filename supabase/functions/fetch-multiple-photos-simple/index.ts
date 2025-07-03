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

    const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw'

    console.log('📸 FETCHING MULTIPLE PHOTOS (SIMPLE VERSION)')
    console.log('============================================')

    const body = await req.json().catch(() => ({}))
    const { maxPhotos = 6, batchSize = 10 } = body

    // Get Malta bars that don't have multiple photos yet
    const { data: bars } = await supabaseClient
      .from('bars')
      .select('*')
      .ilike('address', '%Malta%')
      .limit(batchSize)

    if (!bars || bars.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No bars to process',
        results: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📋 Processing ${bars.length} Malta bars`)

    const results = []

    for (const bar of bars) {
      console.log(`\n🔍 Processing: ${bar.name}`)
      
      try {
        // Search for the place to get photos
        const searchQuery = `${bar.name} Malta`
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        
        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()
        
        if (!searchData.results || searchData.results.length === 0) {
          console.log(`   ❌ Place not found`)
          results.push({
            barId: bar.id,
            barName: bar.name,
            status: 'place_not_found',
            photoCount: 0
          })
          continue
        }

        const place = searchData.results[0]
        console.log(`   ✅ Found place: ${place.name}`)

        // Get detailed place information with photos
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,photos&key=${GOOGLE_MAPS_API_KEY}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()
        
        if (!detailsData.result?.photos) {
          console.log(`   ❌ No photos found`)
          results.push({
            barId: bar.id,
            barName: bar.name,
            status: 'no_photos',
            photoCount: 0
          })
          continue
        }

        const photos = detailsData.result.photos.slice(0, maxPhotos)
        console.log(`   📸 Found ${photos.length} photos`)

        // Create array of photo URLs
        const photoUrls = photos.map(photo => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1024&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
        )

        // Store photos array in the existing photos column (JSON)
        const { error: updateError } = await supabaseClient
          .from('bars')
          .update({
            photos: photoUrls,
            updated_at: new Date().toISOString()
          })
          .eq('id', bar.id)

        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`)
          results.push({
            barId: bar.id,
            barName: bar.name,
            status: 'update_failed',
            error: updateError.message,
            photoCount: 0
          })
        } else {
          console.log(`   ✅ SUCCESS: Updated with ${photoUrls.length} photos`)
          results.push({
            barId: bar.id,
            barName: bar.name,
            status: 'completed',
            photoCount: photoUrls.length,
            photos: photoUrls
          })
        }

      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        results.push({
          barId: bar.id,
          barName: bar.name,
          status: 'error',
          error: error.message,
          photoCount: 0
        })
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const totalPhotos = results.reduce((sum, r) => sum + (r.photoCount || 0), 0)
    const successfulBars = results.filter(r => r.status === 'completed').length

    console.log('\n📊 PROCESSING SUMMARY:')
    console.log(`✅ Bars processed: ${successfulBars}/${bars.length}`)
    console.log(`📸 Total photos processed: ${totalPhotos}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Multiple photos fetching completed',
        summary: {
          barsProcessed: bars.length,
          successfulBars,
          totalPhotos,
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
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 