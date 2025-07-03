import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// Initialize Supabase
const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2VfX3JvbGUiLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.IKlHTQ_PwZ0WxOh4_HgNhSrV9EGxJC_YF0OYCPIo-HA'
);

// Google Maps API Key
const GOOGLE_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

// Bars to update
const barsToUpdate = [
  {
    name: 'Il-Fortizza',
    placeId: 'ChIJzSnWwzxFDhMRCcDdeYXnDcI'
  },
  {
    name: 'Zion Bar & Restaurant',
    placeId: 'ChIJlQztqH2xDhMRI2pSqM-mMtc'
  }
];

async function getGooglePlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,photos,geometry&key=${GOOGLE_API_KEY}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error(`Error fetching place details: ${error.message}`);
    return null;
  }
}

async function updateBarInSupabase(barData) {
  const { name, address, lat, lng, rating, reviewCount, placeId, photos } = barData;
  
  // First, check if bar exists
  const { data: existingBar } = await supabase
    .from('bars')
    .select('id')
    .eq('name', name)
    .single();

  const barRecord = {
    name,
    address,
    lat,
    lng,
    google_rating: rating,
    review_count: reviewCount,
    google_place_id: placeId,
    country: 'Malta',
    has_menu: false
  };

  if (existingBar) {
    // Update existing bar
    const { error } = await supabase
      .from('bars')
      .update(barRecord)
      .eq('id', existingBar.id);
    
    if (error) {
      console.error(`❌ Error updating ${name}:`, error.message);
      return null;
    }
    
    console.log(`✅ Updated ${name}`);
    return existingBar.id;
  } else {
    // Insert new bar
    const { data, error } = await supabase
      .from('bars')
      .insert(barRecord)
      .select()
      .single();
    
    if (error) {
      console.error(`❌ Error inserting ${name}:`, error.message);
      return null;
    }
    
    console.log(`✅ Inserted ${name}`);
    return data.id;
  }
}

async function updateBarPhotos(barId, barName, photos) {
  if (!photos || photos.length === 0) return;
  
  // Delete existing photos
  await supabase
    .from('bar_photos')
    .delete()
    .eq('bar_id', barId);
  
  // Insert new photos
  const photoRecords = photos.slice(0, 5).map((photo, index) => ({
    bar_id: barId,
    photo_url: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_API_KEY}`,
    photo_reference: photo.photo_reference,
    width: photo.width,
    height: photo.height,
    display_order: index + 1,
    is_primary: index === 0
  }));
  
  const { error } = await supabase
    .from('bar_photos')
    .insert(photoRecords);
  
  if (error) {
    console.error(`❌ Error inserting photos for ${barName}:`, error.message);
  } else {
    console.log(`📸 Added ${photoRecords.length} photos for ${barName}`);
  }
}

async function main() {
  console.log('🚀 Starting simple Google Maps data update...\n');
  
  for (const bar of barsToUpdate) {
    console.log(`\n📍 Processing: ${bar.name}`);
    console.log(`${'='.repeat(40)}`);
    
    // 1. Get Google data
    const placeDetails = await getGooglePlaceDetails(bar.placeId);
    
    if (!placeDetails) {
      console.error(`❌ Could not fetch Google data for ${bar.name}`);
      continue;
    }
    
    // 2. Prepare bar data
    const barData = {
      name: bar.name,
      address: placeDetails.formatted_address || 'Address not available',
      lat: placeDetails.geometry?.location?.lat || null,
      lng: placeDetails.geometry?.location?.lng || null,
      rating: placeDetails.rating || null,
      reviewCount: placeDetails.user_ratings_total || 0,
      placeId: bar.placeId,
      photos: placeDetails.photos || []
    };
    
    console.log(`📊 Found: ${barData.address}`);
    console.log(`⭐ Rating: ${barData.rating || 'N/A'} (${barData.reviewCount} reviews)`);
    console.log(`📸 Photos: ${barData.photos.length} available`);
    
    // 3. Update bar in Supabase
    const barId = await updateBarInSupabase(barData);
    
    if (barId) {
      // 4. Update photos
      await updateBarPhotos(barId, bar.name, barData.photos);
    }
  }
  
  console.log('\n\n✨ Update complete!');
  console.log('The bars should now have their Google Maps data and photos.');
}

// Run the script
main().catch(console.error); 