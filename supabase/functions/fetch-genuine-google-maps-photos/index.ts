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

    console.log('📸 FETCH GENUINE GOOGLE MAPS PHOTOS')
    console.log('===================================')

    // Get ALL remaining bars from cleaned database
    const { data: allBars, error } = await supabaseClient
      .from('bars')
      .select('id, name, address, website_url')

    if (error) {
      console.error('❌ Error fetching bars:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📊 Found ${allBars.length} bars to process`)

    const results = []
    let successCount = 0
    let alreadyHasPhotoCount = 0
    let failCount = 0

    for (const bar of allBars) {
      console.log(`\n🔍 Processing: ${bar.name}`)
      
      // Skip if already has Google Maps photo
      if (bar.website_url && bar.website_url.includes('googleusercontent.com')) {
        console.log(`   ✅ Already has Google Maps photo`)
        alreadyHasPhotoCount++
        results.push({
          bar: bar.name,
          status: 'already_has_photo',
          existingUrl: bar.website_url
        })
        continue
      }
      
      try {
        // Search for the place using Google Places API
        const searchQuery = `${bar.name} ${bar.address}`
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        
        console.log(`   🔍 Searching: ${searchQuery}`)
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
            
            console.log(`   📸 Found photo: ${photoUrl.substring(0, 80)}...`)
            
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
                  error: updateError.message,
                  photoUrl: photoUrl
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
              console.log(`   ❌ Photo URL not accessible (${photoTestResponse.status})`)
              failCount++
              results.push({
                bar: bar.name,
                status: 'photo_not_accessible',
                photoUrl: photoUrl,
                httpStatus: photoTestResponse.status
              })
            }
          } else {
            console.log(`   ❌ No photos found for this place`)
            failCount++
            results.push({
              bar: bar.name,
              status: 'no_photos_found'
            })
          }
        } else {
          console.log(`   ❌ Place not found in Google Maps`)
          failCount++
          results.push({
            bar: bar.name,
            status: 'place_not_found'
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

      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log('\n📊 FINAL RESULTS:')
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`📸 Already had photos: ${alreadyHasPhotoCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📈 Success rate: ${((successCount/(successCount+failCount))*100).toFixed(1)}%`)
    console.log(`🎯 Total with photos: ${successCount + alreadyHasPhotoCount}/${allBars.length} (${(((successCount + alreadyHasPhotoCount)/allBars.length)*100).toFixed(1)}%)`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Maps photo fetching completed',
        summary: {
          totalBars: allBars.length,
          newPhotosAdded: successCount,
          alreadyHadPhotos: alreadyHasPhotoCount,
          failed: failCount,
          totalWithPhotos: successCount + alreadyHasPhotoCount,
          successRate: ((successCount/(successCount+failCount))*100).toFixed(1),
          photosCoverage: (((successCount + alreadyHasPhotoCount)/allBars.length)*100).toFixed(1)
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