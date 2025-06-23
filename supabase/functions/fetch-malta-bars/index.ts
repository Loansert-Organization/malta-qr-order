
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MaltaBar {
  name: string;
  address: string | null;
  contact_number: string | null;
  rating: number | null;
  review_count: number | null;
  location_gps: string | null;
  google_place_id: string;
  data_quality_score: number;
}

// Simplified rate limiting
const RATE_LIMIT_DELAY = 500; // ms between requests
const MAX_RETRIES = 2;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Calculate data quality score
function calculateDataQualityScore(bar: any): number {
  let score = 0;
  
  if (bar.name && bar.name.trim() !== '') score += 20;
  if (bar.formatted_address && bar.formatted_address.trim() !== '') score += 20;
  if (bar.formatted_phone_number && bar.formatted_phone_number.trim() !== '') score += 15;
  if (bar.rating !== null && bar.rating !== undefined) score += 15;
  if (bar.user_ratings_total && bar.user_ratings_total > 0) score += 15;
  if (bar.geometry && bar.geometry.location) score += 15;
  
  return score;
}

// Validate Malta location
function isInMalta(lat: number, lng: number): boolean {
  const MALTA_BOUNDS = {
    north: 36.082,
    south: 35.806,
    east: 14.576,
    west: 14.184
  };
  
  return lat >= MALTA_BOUNDS.south && 
         lat <= MALTA_BOUNDS.north && 
         lng >= MALTA_BOUNDS.west && 
         lng <= MALTA_BOUNDS.east;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now();

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured. Please add GOOGLE_MAPS_API_KEY to Supabase secrets.')
    }

    console.log('Starting Malta bars fetch operation...');

    let totalProcessed = 0;
    let newBarsAdded = 0;
    let barsUpdated = 0;
    let apiCallsMade = 0;
    let errorsCount = 0;

    // Simplified search - just one comprehensive query
    const searchQuery = 'bars restaurants pubs Malta';
    const allPlaces = new Map<string, any>();

    console.log(`Searching for: ${searchQuery}`);
    
    let nextPageToken: string | null = null;
    let pageCount = 0;
    const maxPages = 2; // Limit to prevent excessive API calls

    do {
      try {
        await sleep(RATE_LIMIT_DELAY);
        
        let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${googleMapsApiKey}`;
        
        if (nextPageToken) {
          searchUrl += `&pagetoken=${nextPageToken}`;
          await sleep(2000); // Google requires 2-second delay for pagination
        }

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        apiCallsMade++;

        console.log(`API Response status: ${searchData.status}`);

        if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
          console.error(`Google Places API error:`, searchData.status, searchData.error_message);
          errorsCount++;
          break;
        }

        if (searchData.results) {
          for (const place of searchData.results) {
            const types = place.types || [];
            const isBarLike = types.some(type => 
              type.includes('bar') || 
              type.includes('night_club') || 
              type.includes('restaurant') ||
              type.includes('establishment')
            );

            if (isBarLike && !allPlaces.has(place.place_id)) {
              allPlaces.set(place.place_id, place);
            }
          }
        }

        nextPageToken = searchData.next_page_token || null;
        pageCount++;

      } catch (error) {
        console.error(`Error fetching search results:`, error);
        errorsCount++;
        break;
      }
    } while (nextPageToken && pageCount < maxPages);

    console.log(`Found ${allPlaces.size} unique places to process`);

    // Process places to get detailed information
    const barsData: MaltaBar[] = [];
    const places = Array.from(allPlaces.values());

    for (let i = 0; i < Math.min(places.length, 50); i++) { // Limit to 50 places for now
      const place = places[i];
      
      try {
        await sleep(RATE_LIMIT_DELAY);
        
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,geometry,types&key=${googleMapsApiKey}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        apiCallsMade++;

        if (detailsData.status === 'OK' && detailsData.result) {
          const bar = detailsData.result;
          
          // Validate location is in Malta
          if (bar.geometry?.location) {
            const { lat, lng } = bar.geometry.location;
            
            if (!isInMalta(lat, lng)) {
              console.log(`Skipping ${bar.name} - not in Malta`);
              continue;
            }
          }

          const maltaBar: MaltaBar = {
            name: bar.name,
            address: bar.formatted_address || null,
            contact_number: bar.formatted_phone_number || null,
            rating: bar.rating || null,
            review_count: bar.user_ratings_total || null,
            location_gps: bar.geometry?.location 
              ? `POINT(${bar.geometry.location.lng} ${bar.geometry.location.lat})`
              : null,
            google_place_id: place.place_id,
            data_quality_score: calculateDataQualityScore(bar)
          };

          totalProcessed++;
          barsData.push(maltaBar);
        }
      } catch (error) {
        console.error(`Error fetching details for place ${place.place_id}:`, error);
        errorsCount++;
      }
    }

    console.log(`Processing ${barsData.length} bars for database upsert`);

    // Upsert bars into Supabase
    if (barsData.length > 0) {
      // Get existing bars to determine updates vs inserts
      const { data: existingBars } = await supabaseClient
        .from('bars')
        .select('google_place_id')
        .in('google_place_id', barsData.map(bar => bar.google_place_id));

      const existingPlaceIds = new Set(existingBars?.map(bar => bar.google_place_id) || []);

      newBarsAdded = barsData.filter(bar => !existingPlaceIds.has(bar.google_place_id)).length;
      barsUpdated = barsData.filter(bar => existingPlaceIds.has(bar.google_place_id)).length;

      // Upsert all bars
      const { error: upsertError } = await supabaseClient
        .from('bars')
        .upsert(barsData, { 
          onConflict: 'google_place_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error('Upsert error:', upsertError);
        throw upsertError;
      }

      console.log(`Successfully upserted ${barsData.length} bars (${newBarsAdded} new, ${barsUpdated} updated)`);
    }

    const operationDuration = Date.now() - startTime;

    const response = {
      success: true,
      message: `Successfully processed ${totalProcessed} bars from Malta`,
      summary: {
        total_processed: totalProcessed,
        new_bars_added: newBarsAdded,
        bars_updated: barsUpdated,
        api_calls_made: apiCallsMade,
        errors_count: errorsCount,
        duration_ms: operationDuration
      },
      bars_processed: barsData.length
    };

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in fetch-malta-bars function:', error);
    
    const operationDuration = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duration_ms: operationDuration
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
