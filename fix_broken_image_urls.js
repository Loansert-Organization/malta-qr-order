import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUyNjMzMywiZXhwIjoyMDY2MTAyMzMzfQ.6CwbhEa8B7l7-Pab7VKx_Zh6uKOwYEOcGHFH2E_NRxI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBrokenImageUrls() {
  console.log('🔧 FIXING BROKEN IMAGE URLS');
  console.log('===========================\n');

  try {
    // 1. Get all bars with broken URLs
    console.log('1. 📋 FETCHING BARS WITH BROKEN URLS...');
    const { data: barsData, error } = await supabase
      .from('bars')
      .select('id, name, website_url')
      .not('website_url', 'is', null);

    if (error) {
      console.error('❌ Error fetching bars:', error);
      return;
    }

    console.log(`📊 Found ${barsData.length} bars with website_urls`);

    // 2. Fix malformed URLs
    console.log('\n2. 🔧 FIXING MALFORMED URLS...');
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const bar of barsData) {
      if (!bar.website_url) continue;
      
      // Clean the URL by removing line breaks and extra spaces
      const originalUrl = bar.website_url;
      const cleanedUrl = originalUrl
        .replace(/\s+/g, '') // Remove all whitespace including line breaks
        .replace(/\n/g, '')  // Remove newlines specifically
        .replace(/\r/g, '')  // Remove carriage returns
        .trim();

      // Check if URL was malformed
      if (originalUrl !== cleanedUrl) {
        console.log(`\n🔧 Fixing: ${bar.name}`);
        console.log(`   Original length: ${originalUrl.length}`);
        console.log(`   Cleaned length: ${cleanedUrl.length}`);
        console.log(`   Contains breaks: ${originalUrl.includes('\n') || originalUrl.includes('\r')}`);
        
        // Update the bar with cleaned URL
        const { error: updateError } = await supabase
          .from('bars')
          .update({ website_url: cleanedUrl })
          .eq('id', bar.id);

        if (updateError) {
          console.log(`   ❌ Update failed: ${updateError.message}`);
        } else {
          console.log(`   ✅ Fixed successfully`);
          fixedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`\n📈 RESULTS:`);
    console.log(`✅ Fixed URLs: ${fixedCount}`);
    console.log(`⏭️ Already clean: ${skippedCount}`);

    // 3. Test fixed URLs
    console.log('\n3. 🧪 TESTING FIXED URLS...');
    
    const { data: testBars, error: testError } = await supabase
      .from('bars')
      .select('id, name, website_url')
      .not('website_url', 'is', null)
      .limit(5);

    if (!testError && testBars) {
      for (const bar of testBars) {
        console.log(`\n🔗 Testing: ${bar.name}`);
        console.log(`   URL: ${bar.website_url}`);
        
        try {
          const response = await fetch(bar.website_url, { 
            method: 'HEAD',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
          });
          console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
          
          if (response.status === 200) {
            console.log(`   🎉 IMAGE ACCESSIBLE!`);
          } else {
            console.log(`   ⚠️ Non-200 status`);
          }
        } catch (error) {
          console.log(`   ❌ Fetch Error: ${error.message}`);
        }
      }
    }

    // 4. Generate statistics
    console.log('\n4. 📊 FINAL STATISTICS...');
    const { data: finalStats, error: statsError } = await supabase
      .from('bars')
      .select('website_url, address');

    if (!statsError && finalStats) {
      const totalBars = finalStats.length;
      const withUrls = finalStats.filter(bar => bar.website_url).length;
      const googleUrls = finalStats.filter(bar => 
        bar.website_url && bar.website_url.includes('googleusercontent.com')
      ).length;
      
      console.log(`📊 Total bars: ${totalBars}`);
      console.log(`🌐 With image URLs: ${withUrls} (${((withUrls/totalBars)*100).toFixed(1)}%)`);
      console.log(`🗺️ Google Maps photos: ${googleUrls} (${((googleUrls/totalBars)*100).toFixed(1)}%)`);
    }

  } catch (error) {
    console.error('❌ Critical error:', error);
  }
}

fixBrokenImageUrls();
