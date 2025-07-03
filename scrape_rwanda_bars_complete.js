import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

// All required Rwanda bars
const requiredRwandaBars = [
  'AFTER PARTY BAR & GRILL',
  'Agence Pub',
  'ALEX COME AGAIN BAR KICUKIRO BRANCH',
  'Amahumbezi Pub',
  'Antonov Bar',
  'Astro Bar & Restaurant',
  'B Flex Bar',
  'Bahamas Pub',
  'Bar Dolce',
  'Bar Filao',
  'Bar Nyenyeri',
  'Billy\'s Bistro & Bar',
  'Blackstone Lounge Kigali',
  'Bodega and Brew Kacyiru',
  'Burrows Bar & Restaurant',
  'Cafe Restaurant Olympiade',
  'Carpe Diem Bistro',
  'CARRINGTON Resto-Bar',
  'Chez Guiness Bar',
  'Chez John Restaurant',
  'Chez Kiruhura',
  'Cincinnati Bar & Grill',
  'CKYC Lounge',
  'Click Bar',
  'Cocobean',
  'Come Again Bar & Resto Giporoso',
  'Come Again, Kicukiro',
  'Continental restaurant',
  'Copenhagen Lounge',
  'CRYSTAL LOUNGE - Rooftop Restaurant & Bar',
  'Déjà Vu',
  'East 24 Bar & Grill',
  'Emerald Cafe and Restaurant, Remera',
  'Four Points by Sheraton Kigali',
  'Gorillas Golf Hotel',
  'Grand Legacy Hotel',
  'Great Wall Chinese Restaurant',
  'Green Corner',
  'H2O Lounge',
  'Happy Park',
  'HAVANA BAR AND RESTO',
  'Heroes Lounge',
  'Hôtel Chez Lando',
  'Hôtel des Mille Collines',
  'Hotel Villa Portofino Kigali',
  'HQ LOUNGE',
  'Inzozi Africa House B&B',
  'Jollof Kigali',
  'Juru Garden Bar',
  'Kari-Beau Restaurant',
  'Kigali Diplomat Hotel',
  'Kigali Marriott Hotel',
  'Kigali Serena Hotel',
  'Kigali Sport Bar',
  'Kiruhura Disque Orange',
  'La Sanitas',
  'Lemigo Hotel',
  'Maestro Kitchen',
  'Maison Noire Bar & Restaurant',
  'Maracana Rwanda',
  'Meze Fresh',
  'Missed Call Pub',
  'Nobleza Hotel',
  'Onomo Hotel',
  'Oyster Bar & Grill',
  'Paddock Bar',
  'Park Inn by Radisson Kigali',
  'Pili Pili',
  'Plus 250',
  'Quelque Part Resto Bar',
  'RELAX BAR & GRILL',
  'Repub Lounge',
  'Resto-Bar Chez John Maradona',
  'Riders Lounge Kigali',
  'Rio de Gikondo Sport Bar & Accomodation',
  'Roasters CHOMAZONE Restaurant',
  'Rosty Club',
  'Sky Lounge',
  'Suka Bar & Café',
  'Sundowner',
  'Ten to Two Bar Resto',
  'The B Lounge',
  'THE BELLO RESTAURANT',
  'The Green Lounge Bar & Restaurant',
  'The Grid Kigali',
  'The Manor Hotel',
  'The SkySports Lounge',
  'Torino Bar & Restaurant',
  'Tropical Bar-Restaurant-Rounge',
  'Ubumwe Grande Hotel',
  'Uncles Restaurant',
  'Urban by CityBlue, Kigali'
];

async function scrapeRwandaBarsComplete() {
  console.log('🚀 COMPREHENSIVE RWANDA BARS SCRAPING');
  console.log(`📋 Scraping ${requiredRwandaBars.length} specific Rwanda establishments...`);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < requiredRwandaBars.length; i++) {
    const barName = requiredRwandaBars[i];
    
    try {
      console.log(`\n🔍 [${i + 1}/${requiredRwandaBars.length}] Processing: ${barName}`);
      
      // Step 1: Search Google Places for this specific establishment
      const searchQuery = encodeURIComponent(`${barName} Kigali Rwanda restaurant bar`);
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${GOOGLE_MAPS_API_KEY}`;
      
      console.log(`   🔍 Searching Google Maps...`);
      const searchResponse = await fetch(searchUrl);
      const searchData = await searchResponse.json();
      
      if (searchData.results && searchData.results.length > 0) {
        const place = searchData.results[0];
        console.log(`   ✅ Found: ${place.name} (${place.place_id})`);
        
        // Step 2: Get detailed information
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,photos,geometry&key=${GOOGLE_MAPS_API_KEY}`;
        
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();
        
        if (detailsData.result) {
          const details = detailsData.result;
          console.log(`   📊 Rating: ${details.rating || 'N/A'}, Reviews: ${details.user_ratings_total || 'N/A'}`);
          
          // Step 3: Get photo URL if available
          let photoUrl = null;
          if (details.photos && details.photos.length > 0) {
            const photoRef = details.photos[0].photo_reference;
            photoUrl = `https://lh3.googleusercontent.com/p/${photoRef}=w800-h600-k-no`;
            console.log(`   📸 Photo available: YES`);
          } else {
            console.log(`   📸 Photo available: NO`);
          }
          
          // Step 4: Insert into database
          const barData = {
            name: details.name || barName,
            address: details.formatted_address || `Kigali, Rwanda`,
            contact_number: details.formatted_phone_number || null,
            rating: details.rating || null,
            review_count: details.user_ratings_total || null,
            google_place_id: place.place_id,
            website_url: photoUrl, // Using website_url to store photo temporarily
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`   💾 Inserting into database...`);
          const { data: insertData, error: insertError } = await supabase
            .from('bars')
            .insert([barData])
            .select();

          if (insertError) {
            console.error(`   ❌ Database error: ${insertError.message}`);
            errorCount++;
            results.push({ bar: barName, status: 'error', error: insertError.message });
          } else {
            console.log(`   ✅ SUCCESS: ${barName} added to database!`);
            successCount++;
            results.push({ 
              bar: barName, 
              status: 'success', 
              rating: details.rating,
              reviews: details.user_ratings_total,
              hasPhoto: !!photoUrl
            });
          }
        } else {
          console.log(`   ⚠️ No details found for ${barName}`);
          errorCount++;
          results.push({ bar: barName, status: 'no_details' });
        }
      } else {
        console.log(`   ⚠️ Not found on Google Maps: ${barName}`);
        errorCount++;
        results.push({ bar: barName, status: 'not_found' });
      }
      
      // Rate limiting - respect Google's API limits
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      console.error(`   ❌ Error processing ${barName}:`, error);
      errorCount++;
      results.push({ bar: barName, status: 'error', error: error.message });
    }
  }

  console.log(`\n🎉 RWANDA BARS SCRAPING COMPLETED!`);
  console.log(`   ✅ Successfully added: ${successCount} bars`);
  console.log(`   ❌ Errors: ${errorCount} bars`);
  console.log(`   📊 Total processed: ${requiredRwandaBars.length} bars`);

  // Show results summary
  const successful = results.filter(r => r.status === 'success');
  const withPhotos = successful.filter(r => r.hasPhoto);
  const withRatings = successful.filter(r => r.rating);

  console.log(`\n📈 Quality Summary:`);
  console.log(`   📸 Bars with photos: ${withPhotos.length}/${successful.length}`);
  console.log(`   ⭐ Bars with ratings: ${withRatings.length}/${successful.length}`);

  if (successful.length > 0) {
    console.log(`\n✅ Sample successful additions:`);
    successful.slice(0, 10).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.bar} - ${result.rating ? result.rating + '⭐' : 'No rating'} - ${result.hasPhoto ? '📸' : '❌'}`);
    });
  }

  return {
    total: requiredRwandaBars.length,
    successful: successCount,
    errors: errorCount,
    results: results
  };
}

scrapeRwandaBarsComplete();
