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

    console.log('🚀 WORKING BARS FETCH FROM GOOGLE MAPS')
    console.log('======================================')

    // Get request body to see how many bars to process
    const body = await req.json().catch(() => ({}))
    const batchSize = body.batchSize || 10

    // Your complete bar list - processing in batches
    const allBars = [
      // Malta bars
      { name: "Crafty cat", country: "Malta" },
      { name: "Hoppy hare", country: "Malta" },
      { name: "Rabbit hole", country: "Malta" },
      { name: "The hatter", country: "Malta" },
      { name: "Tortuga", country: "Malta" },
      { name: "White tower lido", country: "Malta" },
      { name: "Brigantine lounge bar", country: "Malta" },
      { name: "Victoria bar", country: "Malta" },
      { name: "Munchies franchise", country: "Malta" },
      { name: "Agliolio", country: "Malta" },
      { name: "Singita restaurant", country: "Malta" },
      { name: "Gnejna kiosk", country: "Malta" },
      { name: "Paparazzi restaurants", country: "Malta" },
      { name: "Babel", country: "Malta" },
      { name: "La bitters", country: "Malta" },
      { name: "Cafe society", country: "Malta" },
      { name: "Blu Beach Club", country: "Malta" },
      { name: "kings pub", country: "Malta" },
      { name: "Mina's", country: "Malta" },
      { name: "Angela's Valletta", country: "Malta" },
      // Rwanda bars  
      { name: "Kigali Marriott Hotel", country: "Rwanda" },
      { name: "Heroes Lounge", country: "Rwanda" },
      { name: "CRYSTAL LOUNGE - Rooftop Restaurant & Bar", country: "Rwanda" },
      { name: "Park Inn by Radisson Kigali", country: "Rwanda" },
      { name: "Repub Lounge", country: "Rwanda" }
    ];

    // Process only the batch requested
    const barsToProcess = allBars.slice(0, batchSize);
    console.log(`📋 Processing batch of ${barsToProcess.length} bars (batch size: ${batchSize})`)
    
    const results = []
    let successCount = 0
    let failCount = 0

    for (const barInfo of barsToProcess) {
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
            
            // Create bar record with ONLY existing columns
            const barRecord = {
              name: details.name || barInfo.name,
              address: details.formatted_address || '',
              contact_number: phoneNumber || null,
              rating: details.rating || null,
              review_count: details.user_ratings_total || null,
              website_url: photoUrl, // Store photo URL here
              google_place_id: place.place_id,
              latitude: details.geometry?.location?.lat || null,
              longitude: details.geometry?.location?.lng || null,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            console.log(`   📝 Data: ${barRecord.name}, Rating: ${barRecord.rating}, Photo: ${photoUrl ? 'YES' : 'NO'}`)
            
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
              console.log(`   ✅ SUCCESS: Inserted!`)
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
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log('\n📊 BATCH RESULTS:')
    console.log(`✅ Successfully processed: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📈 Success rate: ${successCount > 0 ? ((successCount/(successCount+failCount))*100).toFixed(1) : '0'}%`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Batch processing completed (${barsToProcess.length}/${allBars.length})`,
        summary: {
          totalBarsInBatch: barsToProcess.length,
          totalBarsRemaining: allBars.length - barsToProcess.length,
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