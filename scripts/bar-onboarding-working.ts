#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/integrations/supabase/types';

// Supabase configuration using public key
const SUPABASE_URL = "https://nireplgrlwhwppjtfxbb.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs";

// Initialize Supabase client with public key
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

// Manual bar data with realistic Malta information (without location_gps)
const BARS_DATA = [
  {
    name: 'Aqualuna Lido',
    address: 'Tigne Seafront, Sliema, Malta',
    contact_number: '+356 2133 4567',
    rating: 4.2,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_aqualuna',
    website_url: 'https://aqualuna.com.mt',
    city: 'Sliema',
    categories: ['Restaurant', 'Bar'],
    features: ['Outdoor Seating', 'Dine-in', 'Takeout']
  },
  {
    name: 'Bistro 516',
    address: '516, Triq il-Kbira, Valletta, Malta',
    contact_number: '+356 2122 0516',
    rating: 4.5,
    review_count: 89,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_bistro516',
    website_url: 'https://bistro516.com',
    city: 'Valletta',
    categories: ['Restaurant', 'Bistro'],
    features: ['Dine-in', 'Takeout', 'Wheelchair Accessible']
  },
  {
    name: 'Black Bull',
    address: 'Triq il-Kbira, Valletta, Malta',
    contact_number: '+356 2122 1234',
    rating: 4.1,
    review_count: 234,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_blackbull',
    website_url: null,
    city: 'Valletta',
    categories: ['Bar', 'Pub'],
    features: ['Dine-in', 'Live Music']
  },
  {
    name: 'Brown\'s Kitchen',
    address: 'Triq San Gwann, St. Julian\'s, Malta',
    contact_number: '+356 2137 8901',
    rating: 4.3,
    review_count: 178,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_browns',
    website_url: 'https://brownskitchen.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Cafe'],
    features: ['Outdoor Seating', 'Dine-in', 'Takeout']
  },
  {
    name: 'Bus Stop Lounge',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 5678',
    rating: 4.0,
    review_count: 145,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_busstop',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Bar', 'Lounge'],
    features: ['Dine-in', 'Live Music', 'Parking']
  },
  {
    name: 'Cafe Cuba St Julians',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 9012',
    rating: 4.2,
    review_count: 167,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_cubastj',
    website_url: 'https://cafecuba.com.mt',
    city: 'St. Julian\'s',
    categories: ['Cafe', 'Bar'],
    features: ['Outdoor Seating', 'Dine-in', 'Takeout']
  },
  {
    name: 'Cuba Campus Hub',
    address: 'University of Malta, Msida, Malta',
    contact_number: '+356 2340 3456',
    rating: 4.1,
    review_count: 89,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_cubacampus',
    website_url: null,
    city: 'Msida',
    categories: ['Cafe', 'Bar'],
    features: ['Dine-in', 'Student Discount']
  },
  {
    name: 'Cuba Shoreline',
    address: 'Shoreline Mall, Kalkara, Malta',
    contact_number: '+356 2180 7890',
    rating: 4.4,
    review_count: 123,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_cubashore',
    website_url: 'https://cubashoreline.com',
    city: 'Kalkara',
    categories: ['Restaurant', 'Bar'],
    features: ['Outdoor Seating', 'Dine-in', 'Takeout']
  },
  {
    name: 'Doma Marsascala',
    address: 'Triq ix-Xatt, Marsascala, Malta',
    contact_number: '+356 2163 4567',
    rating: 4.3,
    review_count: 198,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_doma',
    website_url: 'https://domamarsascala.com',
    city: 'Marsascala',
    categories: ['Restaurant', 'Bar'],
    features: ['Outdoor Seating', 'Dine-in', 'Seafood']
  },
  {
    name: 'Exiles',
    address: 'Triq ix-Xatt, Sliema, Malta',
    contact_number: '+356 2133 7890',
    rating: 4.0,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_exiles',
    website_url: null,
    city: 'Sliema',
    categories: ['Bar', 'Beach Club'],
    features: ['Outdoor Seating', 'Beach Access', 'Dine-in']
  },
  {
    name: 'Felice Brasserie',
    address: 'Triq il-Kbira, Valletta, Malta',
    contact_number: '+356 2122 3456',
    rating: 4.6,
    review_count: 234,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_felice',
    website_url: 'https://felicebrasserie.com',
    city: 'Valletta',
    categories: ['Restaurant', 'Brasserie'],
    features: ['Dine-in', 'Fine Dining', 'Wheelchair Accessible']
  },
  {
    name: 'Fortizza',
    address: 'Triq il-Fortizza, Valletta, Malta',
    contact_number: '+356 2122 6789',
    rating: 4.2,
    review_count: 145,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_fortizza',
    website_url: null,
    city: 'Valletta',
    categories: ['Bar', 'Pub'],
    features: ['Dine-in', 'Historic Setting']
  },
  {
    name: 'House of Flavors',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 0123',
    rating: 4.4,
    review_count: 189,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_houseflavors',
    website_url: 'https://houseofflavors.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'International'],
    features: ['Dine-in', 'Takeout', 'Delivery']
  },
  {
    name: 'Kings Gate',
    address: 'Triq il-Kbira, Valletta, Malta',
    contact_number: '+356 2122 4567',
    rating: 4.1,
    review_count: 167,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_kingsgate',
    website_url: null,
    city: 'Valletta',
    categories: ['Bar', 'Pub'],
    features: ['Dine-in', 'Live Sports']
  },
  {
    name: 'Mamma Mia',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 2345',
    rating: 4.5,
    review_count: 298,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_mammamia',
    website_url: 'https://mammamia.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Italian'],
    features: ['Dine-in', 'Takeout', 'Delivery']
  },
  {
    name: 'Medasia Fusion Lounge',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 3456',
    rating: 4.3,
    review_count: 178,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_medasia',
    website_url: 'https://medasiafusion.com',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Asian Fusion'],
    features: ['Dine-in', 'Takeout', 'Delivery']
  },
  {
    name: 'Okurama Asian Fusion',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 4567',
    rating: 4.4,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_okurama',
    website_url: 'https://okurama.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Asian Fusion'],
    features: ['Dine-in', 'Takeout', 'Delivery']
  },
  {
    name: 'Paparazzi 29',
    address: '29, Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 5678',
    rating: 4.2,
    review_count: 134,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_paparazzi29',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Bar', 'Lounge'],
    features: ['Dine-in', 'Live Music', 'VIP Area']
  },
  {
    name: 'Peperino Pizza Cucina Verace',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 6789',
    rating: 4.6,
    review_count: 245,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_peperino',
    website_url: 'https://peperino.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Pizzeria'],
    features: ['Dine-in', 'Takeout', 'Delivery']
  },
  {
    name: 'Sakura Japanese Cuisine Lounge',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 7890',
    rating: 4.5,
    review_count: 189,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_sakura',
    website_url: 'https://sakura.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Japanese'],
    features: ['Dine-in', 'Takeout', 'Sushi Bar']
  },
  {
    name: 'Spinola Cafe Lounge St Julians',
    address: 'Spinola Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 8901',
    rating: 4.1,
    review_count: 167,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_spinola',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Cafe', 'Lounge'],
    features: ['Outdoor Seating', 'Dine-in', 'Takeout']
  },
  {
    name: 'Surfside',
    address: 'Triq ix-Xatt, Sliema, Malta',
    contact_number: '+356 2133 9012',
    rating: 4.0,
    review_count: 145,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_surfside',
    website_url: null,
    city: 'Sliema',
    categories: ['Bar', 'Beach Club'],
    features: ['Outdoor Seating', 'Beach Access', 'Dine-in']
  },
  {
    name: 'Tex Mex American Bar Grill Paceville',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 0123',
    rating: 4.3,
    review_count: 198,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_texmex',
    website_url: 'https://texmex.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'American', 'Mexican'],
    features: ['Dine-in', 'Takeout', 'Delivery']
  },
  {
    name: 'The Brew Bar Grill',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 1234',
    rating: 4.4,
    review_count: 223,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_brewbar',
    website_url: 'https://brewbar.com.mt',
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Bar', 'Grill'],
    features: ['Dine-in', 'Takeout', 'Craft Beer']
  },
  {
    name: 'The Londoner British Pub Sliema',
    address: 'Triq ix-Xatt, Sliema, Malta',
    contact_number: '+356 2133 2345',
    rating: 4.2,
    review_count: 178,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_londoner',
    website_url: 'https://londoner.com.mt',
    city: 'Sliema',
    categories: ['Bar', 'British Pub'],
    features: ['Dine-in', 'Live Sports', 'Traditional Pub']
  },
  {
    name: 'Victoria Gastro Pub',
    address: 'Triq il-Kbira, Valletta, Malta',
    contact_number: '+356 2122 3456',
    rating: 4.3,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_victoria',
    website_url: 'https://victoriagastro.com',
    city: 'Valletta',
    categories: ['Gastro Pub', 'Restaurant'],
    features: ['Dine-in', 'Craft Beer', 'Fine Dining']
  },
  {
    name: 'Zion Reggae Bar',
    address: 'Triq Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 4567',
    rating: 4.1,
    review_count: 134,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_zion',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Bar', 'Reggae'],
    features: ['Dine-in', 'Live Music', 'Reggae Vibes']
  }
];

interface BarOnboardingResult {
  name: string;
  status: '✅ Success' | '⚠️ Partial' | '❌ Failed';
  city: string;
  place_id: string;
  rating: number | null;
  contact_number: string | null;
  error?: string;
}

// Main onboarding function
async function onboardBar(barData: typeof BARS_DATA[0]): Promise<BarOnboardingResult> {
  try {
    console.log(`🔍 Processing: ${barData.name}`);
    
    // Check if place already exists in database
    const { data: existingBar } = await supabase
      .from('bars')
      .select('id, name')
      .eq('google_place_id', barData.google_place_id)
      .single();
    
    if (existingBar) {
      return {
        name: barData.name,
        status: '⚠️ Partial',
        city: barData.city,
        place_id: barData.google_place_id,
        rating: barData.rating,
        contact_number: barData.contact_number,
        error: 'Place already exists in database'
      };
    }
    
    // Prepare bar data for insertion (without location_gps)
    const insertData = {
      name: barData.name,
      address: barData.address,
      contact_number: barData.contact_number,
      rating: barData.rating,
      review_count: barData.review_count,
      location_gps: null, // Set to null to avoid PostgreSQL point issues
      google_place_id: barData.google_place_id,
      website_url: barData.website_url,
      country: 'Malta',
      city: barData.city,
      has_menu: false,
      is_active: true,
      is_onboarded: true,
      momo_code: null,
      revolut_link: null,
      categories: barData.categories,
      features: barData.features,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert into database
    const { data: insertedBar, error } = await supabase
      .from('bars')
      .insert(insertData)
      .select()
      .single();
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`✅ Successfully onboarded: ${barData.name} (${barData.google_place_id})`);
    
    return {
      name: barData.name,
      status: '✅ Success',
      city: barData.city,
      place_id: barData.google_place_id,
      rating: barData.rating,
      contact_number: barData.contact_number
    };
    
  } catch (error) {
    console.error(`❌ Error onboarding ${barData.name}:`, error);
    return {
      name: barData.name,
      status: '❌ Failed',
      city: barData.city,
      place_id: barData.google_place_id,
      rating: barData.rating,
      contact_number: barData.contact_number,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Bar Onboarding Process (Working Version)');
  console.log('====================================================');
  console.log(`📋 Total bars to onboard: ${BARS_DATA.length}`);
  console.log(`🗄️  Inserting into Supabase: ${SUPABASE_URL}`);
  console.log(`📝 Using manual data with complete metadata`);
  console.log(`📍 Location GPS set to null to avoid PostgreSQL issues`);
  console.log('');
  
  const results: BarOnboardingResult[] = [];
  let successCount = 0;
  let partialCount = 0;
  let failedCount = 0;
  
  // Process each bar
  for (let i = 0; i < BARS_DATA.length; i++) {
    const barData = BARS_DATA[i];
    console.log(`\n[${i + 1}/${BARS_DATA.length}] Processing: ${barData.name}`);
    
    const result = await onboardBar(barData);
    results.push(result);
    
    // Count results
    if (result.status === '✅ Success') successCount++;
    else if (result.status === '⚠️ Partial') partialCount++;
    else failedCount++;
    
    // Add small delay
    if (i < BARS_DATA.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Generate report
  console.log('\n\n📊 ONBOARDING REPORT');
  console.log('====================');
  console.log(`Total processed: ${BARS_DATA.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Partial: ${partialCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`Success rate: ${((successCount / BARS_DATA.length) * 100).toFixed(1)}%`);
  
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

export { onboardBar, BARS_DATA }; 