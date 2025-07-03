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

    console.log('🧪 SIMPLE TEST WITH EXISTING COLUMNS')
    console.log('====================================')

    // Test with just 3 bars
    const testBars = [
      { name: "The Crafty Cat Pub", country: "Malta" },
      { name: "Hoppy hare", country: "Malta" },
      { name: "Heroes Lounge", country: "Rwanda" }
    ];

    console.log(`📋 Testing with ${testBars.length} bars`)
    
    const results = []
    let successCount = 0
    let failCount = 0

    for (const barInfo of testBars) {
      console.log(`\n🔍 Processing: ${barInfo.name} (${barInfo.country})`)
      
      try {
        // Build search query with country
        const searchQuery = `${barInfo.name} ${barInfo.country === 'Malta' ? 'Malta' : 'Kigali Rwanda'}`
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        
        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()
        
        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0]
          console.log(`   ✅ Found: ${place.name} (${place.place_id})`)
          
          // Get detailed place information
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,photos,geometry&key=${GOOGLE_MAPS_API_KEY}`
          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()
          
          if (detailsData.result) {
            const details = detailsData.result
            
            // Get photo URL
            let photoUrl = null
            if (details.photos && details.photos.length > 0) {
              photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${details.photos[0].photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
            }
            
            // Determine phone number with correct country code
            let phoneNumber = details.international_phone_number || details.formatted_phone_number
            if (phoneNumber && !phoneNumber.startsWith('+')) {
              const countryCode = barInfo.country === 'Malta' ? '+356' : '+250'
              phoneNumber = `${countryCode} ${phoneNumber}`
            }
            
            // Create bar record with only existing columns
            const barRecord = {
              name: details.name || barInfo.name,
              address: details.formatted_address || '',
              contact_number: phoneNumber || null,
              rating: details.rating || null,
              review_count: details.user_ratings_total || null,
              website_url: photoUrl, // Store main photo in website_url
              google_place_id: place.place_id,
              latitude: details.geometry?.location?.lat || null,
              longitude: details.geometry?.location?.lng || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            console.log(`   📝 Record data:`, {
              name: barRecord.name,
              hasPhoto: !!photoUrl,
              rating: barRecord.rating,
              reviews: barRecord.review_count,
              phone: barRecord.contact_number
            })
            
            // Insert into database
            const { error: insertError } = await supabaseClient
              .from('bars')
              .insert(barRecord)
            
            if (insertError) {
              console.log(`   ❌ Insert failed: ${insertError.message}`)
              failCount++
              results.push({
                bar: barInfo.name,
                country: barInfo.country,
                status: 'insert_failed',
                error: insertError.message
              })
            } else {
              console.log(`   ✅ SUCCESS: Inserted with photo: ${photoUrl ? 'YES' : 'NO'}`)
              successCount++
              results.push({
                bar: barInfo.name,
                country: barInfo.country,
                status: 'success',
                data: {
                  name: barRecord.name,
                  address: barRecord.address,
                  phone: barRecord.contact_number,
                  rating: barRecord.rating,
                  reviews: barRecord.review_count,
                  hasPhoto: !!photoUrl,
                  photoUrl: photoUrl
                }
              })
            }
          } else {
            console.log(`   ❌ No details found`)
            failCount++
            results.push({
              bar: barInfo.name,
              country: barInfo.country,
              status: 'no_details'
            })
          }
        } else {
          console.log(`   ❌ Not found in Google Maps`)
          failCount++
          results.push({
            bar: barInfo.name,
            country: barInfo.country,
            status: 'not_found'
          })
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        failCount++
        results.push({
          bar: barInfo.name,
          country: barInfo.country,
          status: 'error',
          error: error.message
        })
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('\n📊 SIMPLE TEST RESULTS:')
    console.log(`✅ Successfully processed: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📈 Success rate: ${((successCount/(successCount+failCount))*100).toFixed(1)}%`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Simple test completed',
        summary: {
          totalBars: testBars.length,
          successful: successCount,
          failed: failCount,
          successRate: successCount > 0 ? ((successCount/(successCount+failCount))*100).toFixed(1) : '0'
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