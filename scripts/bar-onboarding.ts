#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

// Supabase configuration
const SUPABASE_URL = "https://nireplgrlwhwppjtfxbb.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8";

// Google Places API configuration
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || "AIzaSyBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs";

// Initialize Supabase client with service role
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Bar list to onboard
const BARS_TO_ONBOARD = [
  'Aqualuna Lido',
  'Bistro 516',
  'Black Bull',
  'Brown\'s Kitchen',
  'Bus Stop Lounge',
  'Cafe Cuba St Julians',
  'Cuba Campus Hub',
  'Cuba Shoreline',
  'Doma Marsascala',
  'Exiles',
  'Felice Brasserie',
  'Fortizza',
  'House of Flavors',
  'Kings Gate',
  'Mamma Mia',
  'Medasia Fusion Lounge',
  'Okurama Asian Fusion',
  'Paparazzi 29',
  'Peperino Pizza Cucina Verace',
  'Restaurant Name',
  'Sakura Japanese Cuisine Lounge',
  'Spinola Cafe Lounge St Julians',
  'Surfside',
  'Tex Mex American Bar Grill Paceville',
  'The Brew Bar Grill',
  'The Londoner British Pub Sliema',
  'Victoria Gastro Pub',
  'Zion Reggae Bar'
];

// Types for Google Places API responses
interface GooglePlaceResult {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  rating?: number;
  user_ratings_total?: number;
  types: string[];
  formatted_phone_number?: string;
  website?: string;
  opening_hours?: {
    open_now: boolean;
  };
}

interface BarOnboardingResult {
  name: string;
  status: '✅ Success' | '⚠️ Partial' | '❌ Failed';
  city: string;
  place_id: string;
  rating: number | null;
  contact_number: string | null;
  error?: string;
}

// Google Places API functions
async function searchPlace(query: string): Promise<GooglePlaceResult | null> {
  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' Malta')}&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(searchUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      const place = data.results[0];
      
      // Get additional details
      const details = await getPlaceDetails(place.place_id);
      
      return {
        place_id: place.place_id,
        name: place.name,
        formatted_address: place.formatted_address,
        geometry: place.geometry,
        rating: place.rating,
        user_ratings_total: place.user_ratings_total,
        types: place.types,
        formatted_phone_number: details?.formatted_phone_number,
        website: details?.website,
        opening_hours: details?.opening_hours
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error searching for place "${query}":`, error);
    return null;
  }
}

async function getPlaceDetails(placeId: string): Promise<Partial<GooglePlaceResult> | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=formatted_phone_number,website,opening_hours&key=${GOOGLE_PLACES_API_KEY}`;
    
    const response = await fetch(detailsUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      return {
        formatted_phone_number: data.result.formatted_phone_number,
        website: data.result.website,
        opening_hours: data.result.opening_hours
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error getting details for place ${placeId}:`, error);
    return null;
  }
}

// Helper functions
function extractCityFromAddress(address: string): string {
  const cityPatterns = [
    /St\. Julian's?/i,
    /Sliema/i,
    /Valletta/i,
    /Paceville/i,
    /Marsascala/i,
    /Bugibba/i,
    /Qawra/i,
    /Mellieha/i,
    /Gozo/i
  ];
  
  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      return match[0];
    }
  }
  
  // Default to first part of address if no city found
  return address.split(',')[0]?.trim() || 'Malta';
}

function categorizePlace(types: string[]): string[] {
  const categories: string[] = [];
  
  if (types.includes('restaurant')) categories.push('Restaurant');
  if (types.includes('bar')) categories.push('Bar');
  if (types.includes('cafe')) categories.push('Cafe');
  if (types.includes('food')) categories.push('Food');
  if (types.includes('night_club')) categories.push('Nightclub');
  if (types.includes('liquor_store')) categories.push('Liquor Store');
  
  return categories.length > 0 ? categories : ['Bar'];
}

function extractFeatures(types: string[]): string[] {
  const features: string[] = [];
  
  if (types.includes('outdoor_seating')) features.push('Outdoor Seating');
  if (types.includes('delivery')) features.push('Delivery');
  if (types.includes('takeout')) features.push('Takeout');
  if (types.includes('dine_in')) features.push('Dine-in');
  if (types.includes('wheelchair_accessible_entrance')) features.push('Wheelchair Accessible');
  if (types.includes('parking')) features.push('Parking');
  
  return features;
}

// Main onboarding function
async function onboardBar(barName: string): Promise<BarOnboardingResult> {
  try {
    console.log(`🔍 Searching for: ${barName}`);
    
    // Search for the place
    const place = await searchPlace(barName);
    
    if (!place) {
      return {
        name: barName,
        status: '❌ Failed',
        city: 'Unknown',
        place_id: '',
        rating: null,
        contact_number: null,
        error: 'Place not found'
      };
    }
    
    // Check if place already exists in database
    const { data: existingBar } = await supabase
      .from('bars')
      .select('id, name')
      .eq('google_place_id', place.place_id)
      .single();
    
    if (existingBar) {
      return {
        name: barName,
        status: '⚠️ Partial',
        city: extractCityFromAddress(place.formatted_address),
        place_id: place.place_id,
        rating: place.rating || null,
        contact_number: place.formatted_phone_number || null,
        error: 'Place already exists in database'
      };
    }
    
    // Prepare bar data
    const city = extractCityFromAddress(place.formatted_address);
    const categories = categorizePlace(place.types);
    const features = extractFeatures(place.types);
    
    const barData = {
      name: place.name,
      address: place.formatted_address,
      contact_number: place.formatted_phone_number || null,
      rating: place.rating || null,
      review_count: place.user_ratings_total || null,
      location_gps: `POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`,
      google_place_id: place.place_id,
      website_url: place.website || null,
      country: 'Malta',
      city: city,
      has_menu: false,
      is_active: true,
      is_onboarded: true,
      momo_code: null,
      revolut_link: null,
      categories: categories,
      features: features,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert into database
    const { data: insertedBar, error } = await supabase
      .from('bars')
      .insert(barData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`✅ Successfully onboarded: ${place.name} (${place.place_id})`);
    
    return {
      name: barName,
      status: '✅ Success',
      city: city,
      place_id: place.place_id,
      rating: place.rating || null,
      contact_number: place.formatted_phone_number || null
    };
    
  } catch (error) {
    console.error(`❌ Error onboarding ${barName}:`, error);
    return {
      name: barName,
      status: '❌ Failed',
      city: 'Unknown',
      place_id: '',
      rating: null,
      contact_number: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Bar Onboarding Process');
  console.log('=====================================');
  console.log(`📋 Total bars to onboard: ${BARS_TO_ONBOARD.length}`);
  console.log(`🌍 Using Google Places API for enrichment`);
  console.log(`🗄️  Inserting into Supabase: ${SUPABASE_URL}`);
  console.log('');
  
  const results: BarOnboardingResult[] = [];
  let successCount = 0;
  let partialCount = 0;
  let failedCount = 0;
  
  // Process each bar
  for (let i = 0; i < BARS_TO_ONBOARD.length; i++) {
    const barName = BARS_TO_ONBOARD[i];
    console.log(`\n[${i + 1}/${BARS_TO_ONBOARD.length}] Processing: ${barName}`);
    
    const result = await onboardBar(barName);
    results.push(result);
    
    // Count results
    if (result.status === '✅ Success') successCount++;
    else if (result.status === '⚠️ Partial') partialCount++;
    else failedCount++;
    
    // Add delay to avoid rate limiting
    if (i < BARS_TO_ONBOARD.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Generate report
  console.log('\n\n📊 ONBOARDING REPORT');
  console.log('====================');
  console.log(`Total processed: ${BARS_TO_ONBOARD.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Partial: ${partialCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`Success rate: ${((successCount / BARS_TO_ONBOARD.length) * 100).toFixed(1)}%`);
  
  // Results table
  console.log('\n📋 DETAILED RESULTS');
  console.log('==================');
  console.log('| Name | Status | City | Place ID | Rating | Contact |');
  console.log('|------|--------|------|----------|--------|---------|');
  
  results.forEach(result => {
    const name = result.name.padEnd(30).substring(0, 30);
    const status = result.status;
    const city = (result.city || 'Unknown').padEnd(15).substring(0, 15);
    const placeId = (result.place_id || 'N/A').padEnd(20).substring(0, 20);
    const rating = result.rating ? result.rating.toString() : 'N/A';
    const contact = (result.contact_number || 'N/A').padEnd(15).substring(0, 15);
    
    console.log(`| ${name} | ${status} | ${city} | ${placeId} | ${rating} | ${contact} |`);
  });
  
  // Failed bars
  const failedBars = results.filter(r => r.status === '❌ Failed');
  if (failedBars.length > 0) {
    console.log('\n❌ FAILED BARS (Require Manual Review)');
    console.log('=====================================');
    failedBars.forEach(bar => {
      console.log(`- ${bar.name}: ${bar.error}`);
    });
  }
  
  // Sample JSON payloads for QA
  console.log('\n🔍 SAMPLE JSON PAYLOADS (for QA)');
  console.log('=================================');
  
  const successfulBars = results.filter(r => r.status === '✅ Success');
  const sampleBars = successfulBars.slice(0, 3);
  
  sampleBars.forEach((bar, index) => {
    console.log(`\nSample ${index + 1}: ${bar.name}`);
    console.log(JSON.stringify({
      name: bar.name,
      status: bar.status,
      city: bar.city,
      place_id: bar.place_id,
      rating: bar.rating,
      contact_number: bar.contact_number
    }, null, 2));
  });
  
  console.log('\n🎉 Onboarding process completed!');
}

// Run the script
main().catch(console.error);

export { onboardBar, BARS_TO_ONBOARD }; 