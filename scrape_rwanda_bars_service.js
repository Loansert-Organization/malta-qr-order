import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.Xe2rW-LVF2E0fxv46qs9Q1eKXnqNhI2jdyOzx9JNI5k'; // Service role key to bypass RLS

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

// Priority Rwanda bars to scrape first (famous ones)
const priorityRwandaBars = [
  'Kigali Marriott Hotel',
  'Kigali Serena Hotel', 
  'Four Points by Sheraton Kigali',
  'Hôtel des Mille Collines',
  'Park Inn by Radisson Kigali',
  'Repub Lounge',
  'Riders Lounge Kigali',
  'Sundowner',
  'Meze Fresh',
  'Pili Pili',
  'Billy\'s Bistro & Bar',
  'Blackstone Lounge Kigali',
  'Copenhagen Lounge',
  'CRYSTAL LOUNGE - Rooftop Restaurant & Bar',
  'The Green Lounge Bar & Restaurant',
  'Heroes Lounge',
  'Jollof Kigali',
  'Cincinnati Bar & Grill',
  'East 24 Bar & Grill',
  'Burrows Bar & Restaurant'
];

async function scrapeRwandaBarsWithService() {
  console.log('🚀 RWANDA BARS SCRAPING WITH SERVICE KEY');
  console.log(`📋 Scraping ${priorityRwandaBars.length} priority Rwanda establishments...`);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  for (let i = 0; i < priorityRwandaBars.length; i++) {
    const barName = priorityRwandaBars[i];
    
    try {
      console.log(`\n🔍 [${i + 1}/${priorityRwandaBars.length}] Processing: ${barName}`);
      
      // Step 1: Search Google Places
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
          
          // Step 3: Get photo URL
          let photoUrl = null;
          if (details.photos && details.photos.length > 0) {
            const photoRef = details.photos[0].photo_reference;
            photoUrl = `https://lh3.googleusercontent.com/p/${photoRef}=w800-h600-k-no`;
            console.log(`   📸 Photo: ${photoUrl.substring(0, 80)}...`);
          }
          
          // Step 4: Insert with SERVICE KEY (bypasses RLS)
          const barData = {
            name: details.name || barName,
            address: details.formatted_address || `Kigali, Rwanda`,
            contact_number: details.formatted_phone_number || null,
            rating: details.rating || null,
            review_count: details.user_ratings_total || null,
            google_place_id: place.place_id,
            website_url: photoUrl, // Real Google Maps photo
            country: 'Rwanda',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`   💾 Inserting with SERVICE KEY...`);
          const { data: insertData, error: insertError } = await supabase
            .from('bars')
            .insert([barData])
            .select();

          if (insertError) {
            console.error(`   ❌ Database error: ${insertError.message}`);
            errorCount++;
            results.push({ bar: barName, status: 'error', error: insertError.message });
          } else {
            console.log(`   ✅ SUCCESS: ${barName} added with photo and rating!`);
            successCount++;
            results.push({ 
              bar: barName, 
              status: 'success', 
              rating: details.rating,
              reviews: details.user_ratings_total,
              hasPhoto: !!photoUrl,
              id: insertData[0]?.id
            });
          }
        }
      } else {
        console.log(`   ⚠️ Not found: ${barName}`);
        errorCount++;
      }
      
      // Respectful rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log(`\n🎉 RWANDA PRIORITY BARS SCRAPING COMPLETED!`);
  console.log(`   ✅ Successfully added: ${successCount} bars`);
  console.log(`   ❌ Errors: ${errorCount} bars`);

  const successful = results.filter(r => r.status === 'success');
  const withPhotos = successful.filter(r => r.hasPhoto);
  const withRatings = successful.filter(r => r.rating);

  console.log(`\n📈 Quality Summary:`);
  console.log(`   📸 Bars with photos: ${withPhotos.length}/${successful.length}`);
  console.log(`   ⭐ Bars with ratings: ${withRatings.length}/${successful.length}`);

  if (successful.length > 0) {
    console.log(`\n✅ Successfully added:`);
    successful.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.bar} - ${result.rating ? result.rating + '⭐' : 'No rating'} - ${result.hasPhoto ? '📸' : '❌'}`);
    });
  }

  return successful.length;
}

scrapeRwandaBarsWithService();
