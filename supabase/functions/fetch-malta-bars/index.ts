
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GooglePlace {
  name: string;
  place_id: string;
  vicinity?: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  photos?: { photo_reference: string; height: number; width: number }[];
  types?: string[];
}

interface MaltaBar {
  name: string;
  address: string | null;
  contact_number: string | null;
  rating: number | null;
  review_count: number | null;
  location_gps: string | null;
  google_place_id: string;
  website_url: string | null;
  photo_urls: string[] | null;
  is_active: boolean;
  data_quality_score: number;
}

// Malta bounds for comprehensive coverage
const MALTA_BOUNDS = {
  sw: { lat: 35.781, lng: 14.183 },
  ne: { lat: 36.089, lng: 14.576 }
};

const GRID_STEP = 0.04;
const SEARCH_RADIUS = 3000;
const RATE_LIMIT_DELAY = 300;
const PAGE_TOKEN_DELAY = 2000;

const ESTABLISHMENT_TYPES = [
  'restaurant',
  'bar',
  'cafe',
  'meal_takeaway',
  'food'
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function calculateDataQualityScore(place: GooglePlace): number {
  let score = 0;
  
  if (place.name && place.name.trim() !== '') score += 20;
  if (place.formatted_address || place.vicinity) score += 20;
  if (place.formatted_phone_number) score += 15;
  if (place.rating !== null && place.rating !== undefined) score += 15;
  if (place.user_ratings_total && place.user_ratings_total > 0) score += 15;
  if (place.geometry && place.geometry.location) score += 15;
  
  return score;
}

function isInMalta(lat: number, lng: number): boolean {
  return lat >= MALTA_BOUNDS.sw.lat && 
         lat <= MALTA_BOUNDS.ne.lat && 
         lng >= MALTA_BOUNDS.sw.lng && 
         lng <= MALTA_BOUNDS.ne.lng;
}

function isRelevantEstablishment(place: GooglePlace): boolean {
  if (!place.types) return true;
  
  const relevantTypes = [
    'restaurant', 'bar', 'cafe', 'meal_takeaway', 'food', 
    'night_club', 'bakery', 'meal_delivery', 'establishment'
  ];
  
  return place.types.some(type => relevantTypes.includes(type));
}

function getPhotoUrls(photos: GooglePlace['photos'], apiKey: string): string[] {
  if (!photos) return [];
  
  return photos.slice(0, 3).map(photo => 
    `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${apiKey}`
  );
}

async function searchPlacesInCell(
  lat: number, 
  lng: number, 
  type: string, 
  apiKey: string,
  processedPlaceIds: Set<string>
): Promise<GooglePlace[]> {
  const places: GooglePlace[] = [];
  let nextPageToken: string | null = null;
  let pageCount = 0;
  const maxPages = 2;

  do {
    try {
      await sleep(nextPageToken ? PAGE_TOKEN_DELAY : RATE_LIMIT_DELAY);
      
      let searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${SEARCH_RADIUS}&type=${type}&key=${apiKey}&fields=name,place_id,formatted_address,formatted_phone_number,geometry,rating,user_ratings_total,photos,types`;
      
      if (nextPageToken) {
        searchUrl += `&pagetoken=${nextPageToken}`;
      }

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error(`Google Places API error for ${type} at ${lat},${lng}:`, data.status, data.error_message);
        break;
      }

      if (data.results) {
        for (const place of data.results) {
          if (processedPlaceIds.has(place.place_id)) continue;
          if (!isInMalta(place.geometry.location.lat, place.geometry.location.lng)) continue;
          if (!isRelevantEstablishment(place)) continue;
          
          places.push(place);
          processedPlaceIds.add(place.place_id);
        }
      }

      nextPageToken = data.next_page_token || null;
      pageCount++;

    } catch (error) {
      console.error(`Error searching ${type} at ${lat},${lng}:`, error);
      break;
    }
  } while (nextPageToken && pageCount < maxPages);

  return places;
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

    console.log('🚀 Starting Malta establishments fetch...');

    let totalProcessed = 0;
    let newBarsAdded = 0;
    let barsUpdated = 0;
    let apiCallsMade = 0;
    let errorsCount = 0;
    
    const processedPlaceIds = new Set<string>();
    const allPlaces = new Map<string, GooglePlace>();

    console.log(`🗺️ Searching Malta grid (${GRID_STEP}° step, ${SEARCH_RADIUS}m radius)`);
    
    for (let lat = MALTA_BOUNDS.sw.lat; lat < MALTA_BOUNDS.ne.lat; lat += GRID_STEP) {
      for (let lng = MALTA_BOUNDS.sw.lng; lng < MALTA_BOUNDS.ne.lng; lng += GRID_STEP) {
        console.log(`📍 Searching grid cell: ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
        
        for (const type of ESTABLISHMENT_TYPES) {
          try {
            const places = await searchPlacesInCell(lat, lng, type, googleMapsApiKey, processedPlaceIds);
            apiCallsMade += Math.ceil(places.length / 20);
            
            places.forEach(place => {
              if (!allPlaces.has(place.place_id)) {
                allPlaces.set(place.place_id, place);
              }
            });
            
          } catch (error) {
            console.error(`❌ Error searching ${type} at ${lat},${lng}:`, error);
            errorsCount++;
          }
        }
      }
    }

    console.log(`🔍 Found ${allPlaces.size} unique establishments`);

    const barsData: MaltaBar[] = [];
    const places = Array.from(allPlaces.values());

    for (let i = 0; i < places.length; i++) {
      const place = places[i];
      
      try {
        const maltaBar: MaltaBar = {
          name: place.name,
          address: place.formatted_address || place.vicinity || null,
          contact_number: place.formatted_phone_number || null,
          rating: place.rating || null,
          review_count: place.user_ratings_total || null,
          location_gps: place.geometry?.location 
            ? `POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`
            : null,
          google_place_id: place.place_id,
          data_quality_score: calculateDataQualityScore(place),
          website_url: null,
          photo_urls: getPhotoUrls(place.photos, googleMapsApiKey),
          is_active: true
        };

        totalProcessed++;
        barsData.push(maltaBar);

        if (i % 50 === 0) {
          console.log(`📊 Processed ${i}/${places.length} establishments...`);
        }

      } catch (error) {
        console.error(`❌ Error processing place ${place.place_id}:`, error);
        errorsCount++;
      }
    }

    console.log(`💾 Saving ${barsData.length} establishments to database...`);

    if (barsData.length > 0) {
      const { data: existingBars } = await supabaseClient
        .from('bars')
        .select('google_place_id')
        .in('google_place_id', barsData.map(bar => bar.google_place_id));

      const existingPlaceIds = new Set(existingBars?.map(bar => bar.google_place_id) || []);

      newBarsAdded = barsData.filter(bar => !existingPlaceIds.has(bar.google_place_id)).length;
      barsUpdated = barsData.filter(bar => existingPlaceIds.has(bar.google_place_id)).length;

      const chunkSize = 50;
      for (let i = 0; i < barsData.length; i += chunkSize) {
        const chunk = barsData.slice(i, i + chunkSize);
        
        const { error: upsertError } = await supabaseClient
          .from('bars')
          .upsert(chunk, { 
            onConflict: 'google_place_id',
            ignoreDuplicates: false 
          });

        if (upsertError) {
          console.error(`❌ Upsert error for chunk ${i}-${i + chunkSize}:`, upsertError);
          errorsCount++;
        } else {
          console.log(`✅ Saved chunk ${i + 1}-${Math.min(i + chunkSize, barsData.length)}`);
        }
      }
    }

    const operationDuration = Date.now() - startTime;

    const response = {
      success: true,
      message: `✅ Successfully completed Malta establishments fetch`,
      summary: {
        total_processed: totalProcessed,
        new_bars_added: newBarsAdded,
        bars_updated: barsUpdated,
        api_calls_made: apiCallsMade,
        errors_count: errorsCount,
        duration_ms: operationDuration,
        cost_estimate_usd: (apiCallsMade * 0.017).toFixed(2)
      },
      data_quality: {
        establishments_found: barsData.length,
        avg_quality_score: barsData.length > 0 
          ? (barsData.reduce((sum, bar) => sum + bar.data_quality_score, 0) / barsData.length).toFixed(1)
          : 0,
        with_photos: barsData.filter(bar => bar.photo_urls && bar.photo_urls.length > 0).length,
        with_ratings: barsData.filter(bar => bar.rating !== null).length
      }
    };

    console.log('🎉 Operation completed successfully:', response.summary);

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Critical error in fetch-malta-bars function:', error);
    
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
