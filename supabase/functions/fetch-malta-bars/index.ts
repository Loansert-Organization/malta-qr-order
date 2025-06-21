
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Enhanced interface for Malta bar data
interface MaltaBar {
  name: string;
  address: string | null;
  contact_number: string | null;
  rating: number | null;
  review_count: number | null;
  location_gps: string | null; // POINT(lng lat) format
  google_place_id: string;
  data_quality_score: number;
}

interface FetchOperation {
  operation_type: string;
  total_bars_processed: number;
  new_bars_added: number;
  bars_updated: number;
  errors_count: number;
  api_calls_made: number;
  operation_duration_ms: number;
  error_details: any;
  status: string;
}

// Rate limiting and retry configuration
const RATE_LIMIT_DELAY = 200; // ms between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

// Sleep function for rate limiting
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Exponential backoff retry function
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying in ${delay}ms... (${retries} retries left)`);
      await sleep(delay);
      return retryWithBackoff(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

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

// Validate Malta location using bounding box
function isInMalta(lat: number, lng: number): boolean {
  // Malta bounding box coordinates
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
  let logId: string | null = null;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!googleMapsApiKey) {
      throw new Error('Google Maps API key not configured')
    }

    // Initialize operation log
    const { data: logData, error: logError } = await supabaseClient
      .from('bar_fetch_logs')
      .insert({
        operation_type: 'fetch',
        status: 'in_progress'
      })
      .select()
      .single();

    if (logError) {
      console.error('Failed to create operation log:', logError);
    } else {
      logId = logData.id;
    }

    const operation: FetchOperation = {
      operation_type: 'fetch',
      total_bars_processed: 0,
      new_bars_added: 0,
      bars_updated: 0,
      errors_count: 0,
      api_calls_made: 0,
      operation_duration_ms: 0,
      error_details: [],
      status: 'in_progress'
    };

    console.log('Starting Malta bars fetch operation...');

    // Step 1: Search for bars in Malta with multiple search terms for comprehensive coverage
    const searchQueries = [
      'bars in Malta',
      'pubs in Malta',
      'nightlife Malta',
      'cocktail bars Malta',
      'wine bars Malta'
    ];

    const allPlaces = new Map<string, any>(); // Use Map to avoid duplicates by place_id

    for (const query of searchQueries) {
      console.log(`Searching for: ${query}`);
      
      let nextPageToken: string | null = null;
      let pageCount = 0;
      const maxPages = 3; // Limit to prevent excessive API calls

      do {
        try {
          await sleep(RATE_LIMIT_DELAY); // Rate limiting
          
          let searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${googleMapsApiKey}`;
          
          if (nextPageToken) {
            searchUrl += `&pagetoken=${nextPageToken}`;
            await sleep(2000); // Google requires 2-second delay for pagination
          }

          const searchResponse = await retryWithBackoff(() => fetch(searchUrl));
          const searchData = await searchResponse.json();
          operation.api_calls_made++;

          if (searchData.status !== 'OK' && searchData.status !== 'ZERO_RESULTS') {
            console.error(`Google Places API error for query "${query}":`, searchData.status);
            operation.errors_count++;
            operation.error_details.push({
              query,
              error: searchData.status,
              message: searchData.error_message
            });
            break;
          }

          if (searchData.results) {
            // Filter and add results
            for (const place of searchData.results) {
              // Basic filtering for bar-like establishments
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
          console.error(`Error fetching search results for "${query}":`, error);
          operation.errors_count++;
          operation.error_details.push({
            query,
            error: error.message
          });
          break;
        }
      } while (nextPageToken && pageCount < maxPages);
    }

    console.log(`Found ${allPlaces.size} unique places to process`);

    // Step 2: Process places in batches to get detailed information
    const barsData: MaltaBar[] = [];
    const places = Array.from(allPlaces.values());
    const batchSize = 5; // Process 5 places concurrently

    for (let i = 0; i < places.length; i += batchSize) {
      const batch = places.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (place) => {
        try {
          await sleep(RATE_LIMIT_DELAY);
          
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,geometry,types&key=${googleMapsApiKey}`;
          
          const detailsResponse = await retryWithBackoff(() => fetch(detailsUrl));
          const detailsData = await detailsResponse.json();
          operation.api_calls_made++;

          if (detailsData.status === 'OK' && detailsData.result) {
            const bar = detailsData.result;
            
            // Validate location is in Malta
            if (bar.geometry?.location) {
              const { lat, lng } = bar.geometry.location;
              
              if (!isInMalta(lat, lng)) {
                console.log(`Skipping ${bar.name} - not in Malta (${lat}, ${lng})`);
                return null;
              }
            }

            // Further filter by establishment type
            const types = bar.types || [];
            const isRelevantBar = types.some(type => 
              ['bar', 'night_club', 'restaurant', 'food', 'establishment'].includes(type)
            );

            if (!isRelevantBar) {
              console.log(`Skipping ${bar.name} - not a bar/restaurant`);
              return null;
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

            operation.total_bars_processed++;
            return maltaBar;
          }
        } catch (error) {
          console.error(`Error fetching details for place ${place.place_id}:`, error);
          operation.errors_count++;
          operation.error_details.push({
            place_id: place.place_id,
            error: error.message
          });
          return null;
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled' && result.value) {
          barsData.push(result.value);
        }
      }

      // Progress logging
      console.log(`Processed batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(places.length/batchSize)}, found ${barsData.length} valid bars so far`);
    }

    console.log(`Final processing: ${barsData.length} bars to upsert`);

    // Step 3: Upsert bars into Supabase with conflict resolution
    if (barsData.length > 0) {
      // First, get existing bars to determine updates vs inserts
      const { data: existingBars } = await supabaseClient
        .from('bars')
        .select('google_place_id')
        .in('google_place_id', barsData.map(bar => bar.google_place_id));

      const existingPlaceIds = new Set(existingBars?.map(bar => bar.google_place_id) || []);

      const newBars = barsData.filter(bar => !existingPlaceIds.has(bar.google_place_id));
      const updatedBars = barsData.filter(bar => existingPlaceIds.has(bar.google_place_id));

      // Upsert all bars
      const { data: upsertedBars, error: upsertError } = await supabaseClient
        .from('bars')
        .upsert(barsData, { 
          onConflict: 'google_place_id',
          ignoreDuplicates: false 
        })
        .select();

      if (upsertError) {
        throw upsertError;
      }

      operation.new_bars_added = newBars.length;
      operation.bars_updated = updatedBars.length;

      console.log(`Successfully upserted ${barsData.length} bars (${newBars.length} new, ${updatedBars.length} updated)`);
    }

    // Update scheduled job status
    await supabaseClient
      .from('scheduled_jobs')
      .update({
        last_run: new Date().toISOString(),
        run_count: 1, // This would need to be incremented properly in a real system
        success_count: 1,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('job_name', 'fetch-malta-bars');

    operation.operation_duration_ms = Date.now() - startTime;
    operation.status = 'completed';

    // Update operation log
    if (logId) {
      await supabaseClient
        .from('bar_fetch_logs')
        .update({
          ...operation,
          error_details: operation.error_details.length > 0 ? operation.error_details : null
        })
        .eq('id', logId);
    }

    const response = {
      success: true,
      message: `Successfully processed ${operation.total_bars_processed} bars from Malta`,
      summary: {
        total_processed: operation.total_bars_processed,
        new_bars_added: operation.new_bars_added,
        bars_updated: operation.bars_updated,
        api_calls_made: operation.api_calls_made,
        errors_count: operation.errors_count,
        duration_ms: operation.operation_duration_ms
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
    
    const operation_duration_ms = Date.now() - startTime;
    
    // Update operation log with error
    if (logId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabaseClient
          .from('bar_fetch_logs')
          .update({
            status: 'failed',
            operation_duration_ms,
            error_details: [{ error: error.message, stack: error.stack }],
            errors_count: 1
          })
          .eq('id', logId);
      } catch (logError) {
        console.error('Failed to update error log:', logError);
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duration_ms: operation_duration_ms
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
