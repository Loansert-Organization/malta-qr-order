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

    console.log('🚀 FORCE MALTA IMAGES - STRONGEST SOLUTION')
    console.log('==========================================')

    // Get Malta bars WITHOUT images
    const { data: maltaBars, error } = await supabaseClient
      .from('bars')
      .select('id, name, address, website_url')
      .ilike('address', '%Malta%')
      .is('website_url', null)

    if (error) {
      console.error('❌ Error fetching Malta bars:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📊 Found ${maltaBars.length} Malta bars without images`)

    const results = []
    let successCount = 0
    let failCount = 0

    for (const bar of maltaBars) {
      console.log(`\n🔍 Processing: ${bar.name}`)
      
      try {
        // Search for the place using Google Places API
        const searchQuery = `${bar.name} ${bar.address}`
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        
        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()
        
        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0]
          console.log(`   ✅ Found place: ${place.name} (${place.place_id})`)
          
          // Get place details with photos
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=photos&key=${GOOGLE_MAPS_API_KEY}`
          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()
          
          if (detailsData.result && detailsData.result.photos && detailsData.result.photos.length > 0) {
            const photo = detailsData.result.photos[0]
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
            
            console.log(`   📸 Found photo: ${photoUrl}`)
            
            // Test the photo URL
            const photoTestResponse = await fetch(photoUrl, { method: 'HEAD' })
            console.log(`   🔗 Photo test status: ${photoTestResponse.status}`)
            
            if (photoTestResponse.status === 200) {
              // Update the bar with the photo URL
              const { error: updateError } = await supabaseClient
                .from('bars')
                .update({ website_url: photoUrl })
                .eq('id', bar.id)

              if (updateError) {
                console.log(`   ❌ Update failed: ${updateError.message}`)
                failCount++
                results.push({
                  bar: bar.name,
                  status: 'update_failed',
                  error: updateError.message
                })
              } else {
                console.log(`   ✅ SUCCESS: Photo URL updated`)
                successCount++
                results.push({
                  bar: bar.name,
                  status: 'success',
                  photoUrl: photoUrl
                })
              }
            } else {
              console.log(`   ❌ Photo URL not accessible`)
              failCount++
              results.push({
                bar: bar.name,
                status: 'photo_not_accessible',
                photoUrl: photoUrl
              })
            }
          } else {
            console.log(`   ❌ No photos found for this place`)
            failCount++
            results.push({
              bar: bar.name,
              status: 'no_photos'
            })
          }
        } else {
          console.log(`   ❌ Place not found in Google Maps`)
          failCount++
          results.push({
            bar: bar.name,
            status: 'not_found'
          })
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${bar.name}: ${error.message}`)
        failCount++
        results.push({
          bar: bar.name,
          status: 'error',
          error: error.message
        })
      }
    }

    console.log('\n📊 FINAL RESULTS:')
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📈 Success rate: ${((successCount/(successCount+failCount))*100).toFixed(1)}%`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Malta bars image update completed',
        summary: {
          processed: maltaBars.length,
          successful: successCount,
          failed: failCount,
          successRate: ((successCount/(successCount+failCount))*100).toFixed(1)
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