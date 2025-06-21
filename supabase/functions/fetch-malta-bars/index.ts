
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured')
    }

    // Step 1: Search for bars in Malta
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=bars+in+Malta&key=${googleMapsApiKey}`
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    if (searchData.status !== 'OK') {
      throw new Error(`Google Places API error: ${searchData.status}`)
    }

    const barsData = []
    
    // Step 2: Get detailed information for each bar
    for (const place of searchData.results) {
      try {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,geometry&key=${googleMapsApiKey}`
        const detailsResponse = await fetch(detailsUrl)
        const detailsData = await detailsResponse.json()

        if (detailsData.status === 'OK' && detailsData.result) {
          const bar = detailsData.result
          
          barsData.push({
            name: bar.name,
            address: bar.formatted_address,
            contact_number: bar.formatted_phone_number || null,
            rating: bar.rating || null,
            review_count: bar.user_ratings_total || null,
            location_gps: bar.geometry?.location 
              ? `(${bar.geometry.location.lng},${bar.geometry.location.lat})`
              : null,
            google_place_id: place.place_id
          })
        }
      } catch (error) {
        console.error(`Error fetching details for place ${place.place_id}:`, error)
        continue
      }
    }

    // Step 3: Insert bars into Supabase
    const { data, error } = await supabaseClient
      .from('bars')
      .upsert(barsData, { 
        onConflict: 'google_place_id',
        ignoreDuplicates: false 
      })

    if (error) {
      throw error
    }

    // Handle pagination if there are more results
    let nextPageToken = searchData.next_page_token
    let totalBars = barsData.length

    while (nextPageToken) {
      // Wait a bit before making the next request (Google's requirement)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const nextPageUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${googleMapsApiKey}`
      const nextResponse = await fetch(nextPageUrl)
      const nextData = await nextResponse.json()

      if (nextData.status === 'OK' && nextData.results) {
        const nextBarsData = []
        
        for (const place of nextData.results) {
          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,geometry&key=${googleMapsApiKey}`
            const detailsResponse = await fetch(detailsUrl)
            const detailsData = await detailsResponse.json()

            if (detailsData.status === 'OK' && detailsData.result) {
              const bar = detailsData.result
              
              nextBarsData.push({
                name: bar.name,
                address: bar.formatted_address,
                contact_number: bar.formatted_phone_number || null,
                rating: bar.rating || null,
                review_count: bar.user_ratings_total || null,
                location_gps: bar.geometry?.location 
                  ? `(${bar.geometry.location.lng},${bar.geometry.location.lat})`
                  : null,
                google_place_id: place.place_id
              })
            }
          } catch (error) {
            console.error(`Error fetching details for place ${place.place_id}:`, error)
            continue
          }
        }

        if (nextBarsData.length > 0) {
          const { error: insertError } = await supabaseClient
            .from('bars')
            .upsert(nextBarsData, { 
              onConflict: 'google_place_id',
              ignoreDuplicates: false 
            })

          if (insertError) {
            console.error('Error inserting next page data:', insertError)
          } else {
            totalBars += nextBarsData.length
          }
        }
      }

      nextPageToken = nextData.next_page_token
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${totalBars} bars in Malta`,
        barsProcessed: totalBars
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in fetch-malta-bars function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
