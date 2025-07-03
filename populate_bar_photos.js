import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

async function populateBarPhotos() {
  console.log('🚀 Starting bar photos population...\n');

  try {
    // Get all bars
    const { data: bars, error: barsError } = await supabase
      .from('bars')
      .select('id, name, address, google_place_id, website_url')
      .order('name');

    if (barsError) {
      console.error('❌ Error fetching bars:', barsError);
      return;
    }

    console.log(`📊 Found ${bars.length} bars to process\n`);

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const bar of bars) {
      try {
        // Check if bar already has photos in bar_photos table
        const { data: existingPhotos } = await supabase
          .from('bar_photos')
          .select('id')
          .eq('bar_id', bar.id)
          .limit(1);

        if (existingPhotos && existingPhotos.length > 0) {
          console.log(`⏭️  ${bar.name} - Already has photos, skipping`);
          skippedCount++;
          continue;
        }

        console.log(`🔍 Processing ${bar.name}...`);

        // Search for the bar on Google Maps
        const searchQuery = `${bar.name} ${bar.address || ''}`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`;
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();

        if (!searchData.results || searchData.results.length === 0) {
          console.log(`   ❌ Place not found on Google Maps`);
          errorCount++;
          continue;
        }

        const place = searchData.results[0];
        const placeId = place.place_id;

        // Get place details with photos
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,photos&key=${GOOGLE_MAPS_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        if (!detailsData.result?.photos || detailsData.result.photos.length === 0) {
          console.log(`   ❌ No photos found on Google Maps`);
          errorCount++;
          continue;
        }

        const photos = detailsData.result.photos;
        console.log(`   📸 Found ${photos.length} photos`);

        // Insert photos into bar_photos table (up to 5 photos per bar)
        const maxPhotos = Math.min(photos.length, 5);
        const photoRecords = [];

        for (let i = 0; i < maxPhotos; i++) {
          const photo = photos[i];
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
          
          photoRecords.push({
            bar_id: bar.id,
            original_url: photoUrl,
            supabase_url: photoUrl, // Using same URL for now
            enhanced_url: photoUrl, // Using same URL for now
            is_enhanced: false,
            photo_reference: photo.photo_reference,
            width: photo.width || 1600,
            height: photo.height || 1200,
            processing_status: 'completed',
            created_at: new Date().toISOString()
          });
        }

        // Insert all photos for this bar
        const { error: insertError } = await supabase
          .from('bar_photos')
          .insert(photoRecords);

        if (insertError) {
          console.log(`   ❌ Failed to insert photos: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`   ✅ Successfully added ${photoRecords.length} photos`);
          successCount++;

          // Also update the website_url with the first photo if it's empty
          if (!bar.website_url) {
            await supabase
              .from('bars')
              .update({ website_url: photoRecords[0].original_url })
              .eq('id', bar.id);
          }
        }

        // Small delay to avoid hitting API rate limits
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.log(`   ❌ Error processing ${bar.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Success: ${successCount} bars`);
    console.log(`   ❌ Errors: ${errorCount} bars`);
    console.log(`   ⏭️  Skipped: ${skippedCount} bars`);
    console.log(`   📸 Total bars processed: ${successCount + errorCount + skippedCount}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the script
populateBarPhotos().catch(console.error); 