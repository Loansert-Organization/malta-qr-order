import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

// Google Maps API Key
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

// Configuration
const RATE_LIMIT_DELAY_MS = 1500; // Increased delay between requests
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const MAX_PHOTOS_PER_BAR = 5;

// Helper function to delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry failed requests
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(`      Attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log(`      Retrying in ${RETRY_DELAY_MS/1000} seconds...`);
        await delay(RETRY_DELAY_MS);
      } else {
        throw error;
      }
    }
  }
}

// Helper function to get failed bars from previous run
async function getFailedBars() {
  // Get all bars that don't have photos in bar_photos table
  const { data: bars, error } = await supabase
    .from('bars')
    .select('id, name, address, google_place_id, website_url')
    .order('name');

  if (error) {
    console.error('❌ Error fetching bars:', error);
    return [];
  }

  // Filter bars that don't have photos
  const barsWithoutPhotos = [];
  
  for (const bar of bars) {
    const { data: photos } = await supabase
      .from('bar_photos')
      .select('id')
      .eq('bar_id', bar.id)
      .limit(1);
    
    if (!photos || photos.length === 0) {
      barsWithoutPhotos.push(bar);
    }
  }

  return barsWithoutPhotos;
}

async function populateBarPhotos(resumeMode = false) {
  console.log(`🚀 Starting bar photos population${resumeMode ? ' (Resume Mode)' : ''}...\n`);

  try {
    // Get bars to process
    let bars;
    if (resumeMode) {
      bars = await getFailedBars();
      console.log(`📊 Found ${bars.length} bars without photos to process\n`);
    } else {
      const { data, error: barsError } = await supabase
        .from('bars')
        .select('id, name, address, google_place_id, website_url')
        .order('name');

      if (barsError) {
        console.error('❌ Error fetching bars:', barsError);
        return;
      }
      bars = data;
      console.log(`📊 Found ${bars.length} total bars to process\n`);
    }

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let noPhotosCount = 0;
    const errors = [];

    for (let idx = 0; idx < bars.length; idx++) {
      const bar = bars[idx];
      const progress = `[${idx + 1}/${bars.length}]`;
      
      try {
        // Check if bar already has photos (for non-resume mode)
        if (!resumeMode) {
          const { data: existingPhotos } = await supabase
            .from('bar_photos')
            .select('id')
            .eq('bar_id', bar.id)
            .limit(1);

          if (existingPhotos && existingPhotos.length > 0) {
            console.log(`${progress} ⏭️  ${bar.name} - Already has photos, skipping`);
            skippedCount++;
            continue;
          }
        }

        console.log(`${progress} 🔍 Processing ${bar.name}...`);

        // Search for the bar on Google Maps
        const searchQuery = `${bar.name} ${bar.address || ''}`;
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`;
        
        console.log(`      🔍 Searching Google Maps...`);
        const searchData = await fetchWithRetry(searchUrl);

        if (searchData.status === 'OVER_QUERY_LIMIT') {
          console.log(`   ❌ API quota exceeded. Stopping...`);
          errors.push({ bar: bar.name, error: 'API quota exceeded' });
          break;
        }

        if (!searchData.results || searchData.results.length === 0) {
          console.log(`   ❌ Place not found on Google Maps`);
          errors.push({ bar: bar.name, error: 'Place not found' });
          errorCount++;
          await delay(RATE_LIMIT_DELAY_MS);
          continue;
        }

        const place = searchData.results[0];
        const placeId = place.place_id;

        // Get place details with photos
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,photos&key=${GOOGLE_MAPS_API_KEY}`;
        
        console.log(`      📷 Fetching photo details...`);
        const detailsData = await fetchWithRetry(detailsUrl);

        if (detailsData.status === 'OVER_QUERY_LIMIT') {
          console.log(`   ❌ API quota exceeded. Stopping...`);
          errors.push({ bar: bar.name, error: 'API quota exceeded' });
          break;
        }

        if (!detailsData.result?.photos || detailsData.result.photos.length === 0) {
          console.log(`   ⚠️  No photos found on Google Maps`);
          noPhotosCount++;
          await delay(RATE_LIMIT_DELAY_MS);
          continue;
        }

        const photos = detailsData.result.photos;
        console.log(`   📸 Found ${photos.length} photos`);

        // Insert photos into bar_photos table
        const maxPhotos = Math.min(photos.length, MAX_PHOTOS_PER_BAR);
        const photoRecords = [];

        for (let i = 0; i < maxPhotos; i++) {
          const photo = photos[i];
          const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1600&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`;
          
          photoRecords.push({
            bar_id: bar.id,
            original_url: photoUrl,
            supabase_url: photoUrl,
            enhanced_url: photoUrl,
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
          errors.push({ bar: bar.name, error: insertError.message });
          errorCount++;
        } else {
          console.log(`   ✅ Successfully added ${photoRecords.length} photos`);
          successCount++;

          // Update the website_url with the first photo if it's empty
          if (!bar.website_url) {
            await supabase
              .from('bars')
              .update({ website_url: photoRecords[0].original_url })
              .eq('id', bar.id);
          }
        }

        // Rate limiting delay
        await delay(RATE_LIMIT_DELAY_MS);

      } catch (error) {
        console.log(`   ❌ Error processing ${bar.name}:`, error.message);
        errors.push({ bar: bar.name, error: error.message });
        errorCount++;
        
        // Longer delay after errors
        await delay(RATE_LIMIT_DELAY_MS * 2);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Success: ${successCount} bars`);
    console.log(`   ❌ Errors: ${errorCount} bars`);
    console.log(`   ⚠️  No photos: ${noPhotosCount} bars`);
    console.log(`   ⏭️  Skipped: ${skippedCount} bars`);
    console.log(`   📸 Total bars processed: ${successCount + errorCount + noPhotosCount + skippedCount}`);

    if (errors.length > 0) {
      console.log('\n❌ Error Details:');
      errors.slice(0, 10).forEach(e => {
        console.log(`   - ${e.bar}: ${e.error}`);
      });
      if (errors.length > 10) {
        console.log(`   ... and ${errors.length - 10} more errors`);
      }
    }

    // Save error log for debugging
    if (errors.length > 0) {
      const errorLogPath = `bar_photos_errors_${new Date().toISOString().split('T')[0]}.json`;
      console.log(`\n💾 Saving error log to ${errorLogPath}`);
      const fs = await import('fs/promises');
      await fs.writeFile(errorLogPath, JSON.stringify(errors, null, 2));
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Check if running in resume mode
const args = process.argv.slice(2);
const resumeMode = args.includes('--resume') || args.includes('-r');

// Run the script
populateBarPhotos(resumeMode).catch(console.error); 