// Script to fetch photos for Il-Fortizza and Zion Bar & Restaurant
// Run with: node fetch_photos_for_bars.js

async function fetchPhotosForBars() {
  const SUPABASE_URL = 'https://nireplgrlwhwppjtfxbb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

  console.log('🔍 Fetching photos for Il-Fortizza and Zion Bar & Restaurant...\n');

  try {
    // Call the fetch-multiple-photos-enhanced function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-multiple-photos-enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        barNames: ['Il-Fortizza', 'Zion Bar & Restaurant']
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! Response:', JSON.stringify(result, null, 2));
      
      // Display summary
      if (result.summary) {
        console.log('\n📊 Summary:');
        console.log(`   Total bars processed: ${result.summary.totalProcessed}`);
        console.log(`   Successful: ${result.summary.successful}`);
        console.log(`   Failed: ${result.summary.failed}`);
        console.log(`   Photos added: ${result.summary.photosAdded}`);
      }
    } else {
      console.error(`❌ Error: ${response.status} - ${JSON.stringify(result)}`);
    }
  } catch (error) {
    console.error('❌ Exception:', error.message);
  }

  console.log('\n✨ Photo fetch complete!');
}

// Run the function
fetchPhotosForBars(); 