import { createClient } from '@supabase/supabase-js';

// SECURITY: Service role key must be provided via environment variable
const supabaseUrl = process.env.SUPABASE_URL || 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('❌ CRITICAL: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('   Set it with: export SUPABASE_SERVICE_ROLE_KEY=your_service_key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Bar data from the provided Google Maps URLs
const barsToFetch = [
  {
    name: 'Il-Fortizza',
    placeId: 'ChIJzSnWwzxFDhMRCcDdeYXnDcI', // Extracted from URL
    googleMapsUrl: 'https://www.google.com/maps/place/Il-Fortizza/@35.9142367,14.5046063,17z/data=!3m1!4b1!4m6!3m5!1s0x130e453cd36269cd:0xc2d0e785b7ddc009!8m2!3d35.9142324!4d14.5071812!16s%2Fg%2F1tfd9p4x'
  },
  {
    name: 'Zion Bar & Restaurant',
    placeId: 'ChIJlQztqH2xDhMRI2pSqM-mMtc', // Extracted from URL
    googleMapsUrl: 'https://www.google.com/maps/place/Zion+Bar+%26+Restaurant/@35.8540635,14.5606171,17z/data=!3m1!4b1!4m6!3m5!1s0x130e5b7da8ed0c95:0xd732a6cfa8526a23!8m2!3d35.8540592!4d14.563192!16s%2Fg%2F1tcvf981'
  }
];

async function fetchGooglePlaceDetails(placeId) {
  console.log(`\n🔍 Fetching details for place ID: ${placeId}`);
  
  try {
    // Call Supabase Edge Function to fetch Google Maps data
    const { data, error } = await supabase.functions.invoke('fetch-genuine-google-maps-photos', {
      body: { placeId }
    });

    if (error) {
      console.error('Error fetching place details:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Exception fetching place details:', err);
    return null;
  }
}

async function updateBarInDatabase(barData) {
  const { name, address, lat, lng, rating, review_count, photos, placeId } = barData;

  console.log(`\n💾 Updating database for: ${name}`);
  
  // First, check if the bar exists
  const { data: existingBar } = await supabase
    .from('bars')
    .select('id')
    .eq('name', name)
    .single();

  if (existingBar) {
    // Update existing bar
    const { error: updateError } = await supabase
      .from('bars')
      .update({
        address,
        lat,
        lng,
        google_rating: rating,
        review_count,
        google_place_id: placeId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingBar.id);

    if (updateError) {
      console.error(`Error updating bar ${name}:`, updateError);
      return null;
    }

    console.log(`✅ Updated bar: ${name}`);

    // Insert photos into bar_photos table
    if (photos && photos.length > 0) {
      const photoRecords = photos.map((photo, index) => ({
        bar_id: existingBar.id,
        photo_url: photo.url,
        photo_reference: photo.reference,
        width: photo.width,
        height: photo.height,
        display_order: index + 1,
        is_primary: index === 0
      }));

      const { error: photoError } = await supabase
        .from('bar_photos')
        .insert(photoRecords);

      if (photoError) {
        console.error(`Error inserting photos for ${name}:`, photoError);
      } else {
        console.log(`📸 Inserted ${photos.length} photos for ${name}`);
      }
    }

    return existingBar.id;
  } else {
    // Insert new bar
    const { data: newBar, error: insertError } = await supabase
      .from('bars')
      .insert({
        name,
        address,
        location: `POINT(${lng} ${lat})`,
        lat,
        lng,
        google_rating: rating,
        review_count,
        google_place_id: placeId,
        country: 'Malta',
        has_menu: false
      })
      .select()
      .single();

    if (insertError) {
      console.error(`Error inserting bar ${name}:`, insertError);
      return null;
    }

    console.log(`✅ Inserted new bar: ${name}`);

    // Insert photos
    if (photos && photos.length > 0 && newBar) {
      const photoRecords = photos.map((photo, index) => ({
        bar_id: newBar.id,
        photo_url: photo.url,
        photo_reference: photo.reference,
        width: photo.width,
        height: photo.height,
        display_order: index + 1,
        is_primary: index === 0
      }));

      const { error: photoError } = await supabase
        .from('bar_photos')
        .insert(photoRecords);

      if (photoError) {
        console.error(`Error inserting photos for ${name}:`, photoError);
      } else {
        console.log(`📸 Inserted ${photos.length} photos for ${name}`);
      }
    }

    return newBar?.id;
  }
}

async function main() {
  console.log('🚀 Starting Google Maps data fetch for missing bars...\n');

  for (const bar of barsToFetch) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`Processing: ${bar.name}`);
    console.log(`${'='.repeat(50)}`);

    // Fetch Google Place details
    const placeData = await fetchGooglePlaceDetails(bar.placeId);
    
    if (!placeData) {
      console.error(`❌ Failed to fetch data for ${bar.name}`);
      continue;
    }

    // Extract data
    const barData = {
      name: bar.name,
      address: placeData.formatted_address || placeData.vicinity || 'Address not available',
      lat: placeData.geometry?.location?.lat || null,
      lng: placeData.geometry?.location?.lng || null,
      rating: placeData.rating || null,
      review_count: placeData.user_ratings_total || 0,
      photos: placeData.photos?.slice(0, 5).map(photo => ({
        url: photo.url,
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height
      })) || [],
      placeId: bar.placeId
    };

    console.log(`\n📍 Found data:
    - Address: ${barData.address}
    - Location: ${barData.lat}, ${barData.lng}
    - Rating: ${barData.rating || 'N/A'} (${barData.review_count} reviews)
    - Photos: ${barData.photos.length} found`);

    // Update database
    await updateBarInDatabase(barData);
  }

  console.log('\n\n✨ Google Maps data fetch completed!');
}

// Run the script
main().catch(console.error); 