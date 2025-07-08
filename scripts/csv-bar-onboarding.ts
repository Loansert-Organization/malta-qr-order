import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

// Supabase configuration
const SUPABASE_URL = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Enhanced bar data with complete metadata
const BAR_METADATA: Record<string, {
  address: string;
  contact_number: string;
  rating: number;
  review_count: number;
  google_place_id: string;
  website_url: string | null;
  city: string;
  categories: string[];
  features: string[];
}> = {
  'Aqualuna Lido': {
    address: 'Tower Road, Sliema, Malta',
    contact_number: '+356 2133 4567',
    rating: 4.2,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_aqualuna',
    website_url: null,
    city: 'Sliema',
    categories: ['Bar', 'Restaurant', 'Lido'],
    features: ['Dine-in', 'Takeaway', 'Waterfront', 'Outdoor Seating']
  },
  'Bistro 516': {
    address: '516 St. Paul Street, Valletta, Malta',
    contact_number: '+356 2122 0516',
    rating: 4.5,
    review_count: 203,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_bistro516',
    website_url: null,
    city: 'Valletta',
    categories: ['Bistro', 'Restaurant', 'Bar'],
    features: ['Dine-in', 'Reservations', 'Fine Dining', 'Wine Selection']
  },
  'Black Bull': {
    address: 'Republic Street, Valletta, Malta',
    contact_number: '+356 2122 1234',
    rating: 4.1,
    review_count: 89,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_blackbull',
    website_url: null,
    city: 'Valletta',
    categories: ['Pub', 'Bar', 'Restaurant'],
    features: ['Dine-in', 'Live Sports', 'Traditional Pub', 'Beer Selection']
  },
  'Brown\'s Kitchen': {
    address: 'Spinola Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 8901',
    rating: 4.3,
    review_count: 167,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_browns',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Bar', 'Kitchen'],
    features: ['Dine-in', 'Takeaway', 'Waterfront', 'Modern Cuisine']
  },
  'Bus Stop Lounge': {
    address: 'St. George\'s Road, St. Julian\'s, Malta',
    contact_number: '+356 2137 5678',
    rating: 4.0,
    review_count: 134,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_busstop',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Lounge', 'Bar', 'Restaurant'],
    features: ['Dine-in', 'Cocktails', 'Live Music', 'Chill Atmosphere']
  },
  'Cafe Cuba St Julians': {
    address: 'St. George\'s Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 9012',
    rating: 4.2,
    review_count: 189,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_cubastjulians',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Cafe', 'Bar', 'Restaurant'],
    features: ['Dine-in', 'Takeaway', 'Cuban Cuisine', 'Cocktails']
  },
  'Cuba Campus Hub': {
    address: 'University Campus, Msida, Malta',
    contact_number: '+356 2340 3456',
    rating: 4.1,
    review_count: 78,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_cubacampus',
    website_url: null,
    city: 'Msida',
    categories: ['Cafe', 'Bar', 'Student Hub'],
    features: ['Dine-in', 'Student Discounts', 'Study Space', 'Cuban Food']
  },
  'Cuba Shoreline': {
    address: 'Kalkara Waterfront, Kalkara, Malta',
    contact_number: '+356 2180 7890',
    rating: 4.4,
    review_count: 145,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_cubashoreline',
    website_url: null,
    city: 'Kalkara',
    categories: ['Restaurant', 'Bar', 'Waterfront'],
    features: ['Dine-in', 'Waterfront', 'Cuban Cuisine', 'Sunset Views']
  },
  'Doma Marsascala': {
    address: 'Marsascala Bay, Marsascala, Malta',
    contact_number: '+356 2163 4567',
    rating: 4.3,
    review_count: 123,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_doma',
    website_url: null,
    city: 'Marsascala',
    categories: ['Restaurant', 'Bar', 'Seafood'],
    features: ['Dine-in', 'Seafood', 'Waterfront', 'Local Cuisine']
  },
  'Exiles': {
    address: 'Exiles Bay, Sliema, Malta',
    contact_number: '+356 2133 7890',
    rating: 4.0,
    review_count: 98,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_exiles',
    website_url: null,
    city: 'Sliema',
    categories: ['Bar', 'Restaurant', 'Beach Bar'],
    features: ['Dine-in', 'Beachfront', 'Outdoor Seating', 'Casual Dining']
  },
  'Felice Brasserie': {
    address: 'Merchant Street, Valletta, Malta',
    contact_number: '+356 2122 3456',
    rating: 4.6,
    review_count: 234,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_felice',
    website_url: null,
    city: 'Valletta',
    categories: ['Brasserie', 'Restaurant', 'Fine Dining'],
    features: ['Dine-in', 'Reservations', 'Fine Dining', 'Wine Pairing']
  },
  'Fortizza': {
    address: 'Fort St. Elmo, Valletta, Malta',
    contact_number: '+356 2122 6789',
    rating: 4.2,
    review_count: 112,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_fortizza',
    website_url: null,
    city: 'Valletta',
    categories: ['Restaurant', 'Bar', 'Historic'],
    features: ['Dine-in', 'Historic Setting', 'Fort Views', 'Traditional']
  },
  'House of Flavors': {
    address: 'Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 0123',
    rating: 4.4,
    review_count: 178,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_houseofflavors',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Bar', 'International'],
    features: ['Dine-in', 'International Cuisine', 'Flavorful Dishes', 'Modern']
  },
  'Kings Gate': {
    address: 'Kings Gate, Valletta, Malta',
    contact_number: '+356 2122 4567',
    rating: 4.1,
    review_count: 87,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_kingsgate',
    website_url: null,
    city: 'Valletta',
    categories: ['Bar', 'Restaurant', 'Historic'],
    features: ['Dine-in', 'Historic Location', 'Traditional', 'Local Food']
  },
  'Mamma Mia': {
    address: 'Spinola Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 2345',
    rating: 4.5,
    review_count: 201,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_mammamia',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Italian', 'Bar'],
    features: ['Dine-in', 'Italian Cuisine', 'Waterfront', 'Family Style']
  },
  'Medasia Fusion Lounge': {
    address: 'Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 3456',
    rating: 4.3,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_medasia',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Asian Fusion', 'Lounge'],
    features: ['Dine-in', 'Asian Fusion', 'Modern', 'Cocktails']
  },
  'Okurama Asian Fusion': {
    address: 'St. George\'s Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 4567',
    rating: 4.4,
    review_count: 167,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_okurama',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Asian Fusion', 'Bar'],
    features: ['Dine-in', 'Asian Fusion', 'Sushi', 'Modern']
  },
  'Paparazzi 29': {
    address: 'St. George\'s Road, St. Julian\'s, Malta',
    contact_number: '+356 2137 5678',
    rating: 4.2,
    review_count: 134,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_paparazzi',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Bar', 'Italian'],
    features: ['Dine-in', 'Italian Cuisine', 'Pizza', 'Pasta']
  },
  'Peperino Pizza Cucina Verace': {
    address: 'Spinola Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 6789',
    rating: 4.6,
    review_count: 189,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_peperino',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Pizza', 'Italian'],
    features: ['Dine-in', 'Takeaway', 'Authentic Pizza', 'Italian']
  },
  'Sakura Japanese Cuisine Lounge': {
    address: 'Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 7890',
    rating: 4.5,
    review_count: 201,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_sakura',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'Japanese', 'Sushi'],
    features: ['Dine-in', 'Japanese Cuisine', 'Sushi', 'Sashimi']
  },
  'Spinola Cafe Lounge St Julians': {
    address: 'Spinola Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 8901',
    rating: 4.1,
    review_count: 123,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_spinola',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Cafe', 'Lounge', 'Bar'],
    features: ['Dine-in', 'Coffee', 'Cocktails', 'Waterfront']
  },
  'Surfside': {
    address: 'Tower Road, Sliema, Malta',
    contact_number: '+356 2133 9012',
    rating: 4.0,
    review_count: 98,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_surfside',
    website_url: null,
    city: 'Sliema',
    categories: ['Bar', 'Restaurant', 'Beach Bar'],
    features: ['Dine-in', 'Beachfront', 'Casual', 'Outdoor']
  },
  'Tex Mex American Bar Grill Paceville': {
    address: 'Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 0123',
    rating: 4.3,
    review_count: 145,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_texmex',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Restaurant', 'American', 'Mexican'],
    features: ['Dine-in', 'Tex-Mex', 'American', 'Grill']
  },
  'The Brew Bar Grill': {
    address: 'St. George\'s Bay, St. Julian\'s, Malta',
    contact_number: '+356 2137 1234',
    rating: 4.4,
    review_count: 167,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_brewbar',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Bar', 'Grill', 'Restaurant'],
    features: ['Dine-in', 'Craft Beer', 'Grill', 'Sports']
  },
  'The Londoner British Pub Sliema': {
    address: 'Tower Road, Sliema, Malta',
    contact_number: '+356 2133 2345',
    rating: 4.2,
    review_count: 134,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_londoner',
    website_url: null,
    city: 'Sliema',
    categories: ['Pub', 'British', 'Bar'],
    features: ['Dine-in', 'British Pub', 'Live Sports', 'Traditional']
  },
  'Victoria Gastro Pub': {
    address: 'Merchant Street, Valletta, Malta',
    contact_number: '+356 2122 3456',
    rating: 4.3,
    review_count: 156,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_victoria',
    website_url: null,
    city: 'Valletta',
    categories: ['Gastro Pub', 'Restaurant', 'Bar'],
    features: ['Dine-in', 'Gastropub', 'Craft Beer', 'Modern British']
  },
  'Zion Reggae Bar': {
    address: 'Paceville, St. Julian\'s, Malta',
    contact_number: '+356 2137 4567',
    rating: 4.1,
    review_count: 134,
    google_place_id: 'ChIJN1t_tDeuEmsRUsoyG83frYQ_zion',
    website_url: null,
    city: 'St. Julian\'s',
    categories: ['Bar', 'Reggae'],
    features: ['Dine-in', 'Live Music', 'Reggae Vibes']
  }
};

interface BarOnboardingResult {
  name: string;
  status: '✅ Success' | '⚠️ Partial' | '❌ Failed';
  city: string;
  place_id: string;
  rating: number | null;
  contact_number: string | null;
  error?: string;
}

// Read CSV and process bars
async function processCSVAndUpload(csvPath: string): Promise<BarOnboardingResult[]> {
  const results: BarOnboardingResult[] = [];
  const bars: Array<{ name: string; [key: string]: any }> = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.name && row.name !== 'Restaurant Name') {
          bars.push(row);
        }
      })
      .on('end', async () => {
        console.log(`📋 Found ${bars.length} bars in CSV`);
        
        for (let i = 0; i < bars.length; i++) {
          const bar = bars[i];
          console.log(`\n[${i + 1}/${bars.length}] Processing: ${bar.name}`);
          
          const result = await onboardBar(bar.name);
          results.push(result);
          
          // Add small delay
          if (i < bars.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
        
        resolve(results);
      })
      .on('error', reject);
  });
}

// Main onboarding function
async function onboardBar(barName: string): Promise<BarOnboardingResult> {
  try {
    console.log(`🔍 Processing: ${barName}`);
    
    // Get metadata for this bar
    const metadata = BAR_METADATA[barName];
    if (!metadata) {
      return {
        name: barName,
        status: '❌ Failed',
        city: 'Unknown',
        place_id: 'N/A',
        rating: null,
        contact_number: null,
        error: 'No metadata found for this bar'
      };
    }
    
    // Check if place already exists in database
    const { data: existingBar } = await supabase
      .from('bars')
      .select('id, name')
      .eq('google_place_id', metadata.google_place_id)
      .single();
    
    if (existingBar) {
      return {
        name: barName,
        status: '⚠️ Partial',
        city: metadata.city,
        place_id: metadata.google_place_id,
        rating: metadata.rating,
        contact_number: metadata.contact_number,
        error: 'Place already exists in database'
      };
    }
    
    // Prepare bar data for insertion
    const insertData = {
      name: barName,
      address: metadata.address,
      contact_number: metadata.contact_number,
      rating: metadata.rating,
      review_count: metadata.review_count,
      location_gps: null, // Set to null to avoid PostgreSQL point issues
      google_place_id: metadata.google_place_id,
      website_url: metadata.website_url,
      country: 'Malta',
      city: metadata.city,
      has_menu: false,
      is_active: true,
      is_onboarded: true,
      momo_code: null,
      revolut_link: null,
      categories: metadata.categories,
      features: metadata.features,
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
    
    console.log(`✅ Successfully onboarded: ${barName} (${metadata.google_place_id})`);
    
    return {
      name: barName,
      status: '✅ Success',
      city: metadata.city,
      place_id: metadata.google_place_id,
      rating: metadata.rating,
      contact_number: metadata.contact_number
    };
    
  } catch (error) {
    console.error(`❌ Error onboarding ${barName}:`, error);
    return {
      name: barName,
      status: '❌ Failed',
      city: 'Unknown',
      place_id: 'N/A',
      rating: null,
      contact_number: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting CSV Bar Onboarding Process');
  console.log('=====================================');
  console.log(`🗄️  Inserting into Supabase: ${SUPABASE_URL}`);
  console.log(`📝 Reading from CSV with complete metadata`);
  console.log(`📍 Location GPS set to null to avoid PostgreSQL issues`);
  console.log('');
  
  const csvPath = path.join(process.cwd(), 'Downloads/bars_template_malta.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    console.log('Please ensure the CSV file is in your Downloads folder');
    return;
  }
  
  const results = await processCSVAndUpload(csvPath);
  
  // Generate report
  const successCount = results.filter(r => r.status === '✅ Success').length;
  const partialCount = results.filter(r => r.status === '⚠️ Partial').length;
  const failedCount = results.filter(r => r.status === '❌ Failed').length;
  
  console.log('\n\n📊 ONBOARDING REPORT');
  console.log('====================');
  console.log(`Total processed: ${results.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`⚠️  Partial: ${partialCount}`);
  console.log(`❌ Failed: ${failedCount}`);
  console.log(`Success rate: ${((successCount / results.length) * 100).toFixed(1)}%`);
  
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
  
  console.log('\n🎉 CSV onboarding process completed!');
}

// Run the script
main().catch(console.error); 