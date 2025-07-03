// Simple script to fetch Google Maps data for specific bars
// Run with: node fetch_bars_from_google.js

async function fetchBarsFromGoogle() {
  const SUPABASE_URL = 'https://nireplgrlwhwppjtfxbb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

  const bars = [
    {
      name: 'Il-Fortizza',
      searchQuery: 'Il-Fortizza Is-Swieqi Malta',
      placeId: 'ChIJzSnWwzxFDhMRCcDdeYXnDcI'
    },
    {
      name: 'Zion Bar & Restaurant', 
      searchQuery: 'Zion Bar Restaurant St Thomas Bay Marsaskala Malta',
      placeId: 'ChIJlQztqH2xDhMRI2pSqM-mMtc'
    }
  ];

  for (const bar of bars) {
    console.log(`\n🔍 Fetching data for: ${bar.name}`);
    console.log(`   Search query: ${bar.searchQuery}`);
    console.log(`   Place ID: ${bar.placeId}`);

    try {
      // Call the Supabase function
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-malta-bars`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
        },
        body: JSON.stringify({
          searchQuery: bar.searchQuery,
          specificBarName: bar.name
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success! Response:`, JSON.stringify(result, null, 2));
      } else {
        console.error(`❌ Error: ${response.status} - ${JSON.stringify(result)}`);
      }
    } catch (error) {
      console.error(`❌ Exception for ${bar.name}:`, error.message);
    }
  }

  console.log('\n✨ Fetch complete!');
}

// Run the function
fetchBarsFromGoogle(); 