import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateImageIssues() {
  console.log('🔍 DEEP ANALYSIS: Image Display Issues Investigation');
  console.log('======================================================\n');

  try {
    // 1. Check actual database schema
    console.log('1. 📋 CHECKING DATABASE SCHEMA...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('bars')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema check error:', schemaError);
      return;
    }

    if (schemaData && schemaData.length > 0) {
      console.log('✅ Available columns in bars table:');
      Object.keys(schemaData[0]).forEach((column, index) => {
        console.log(`   ${index + 1}. ${column}: ${typeof schemaData[0][column]}`);
      });
    }

    // 2. Check for image-related columns
    console.log('\n2. 🖼️ CHECKING IMAGE-RELATED COLUMNS...');
    const imageColumns = Object.keys(schemaData[0]).filter(col => 
      col.toLowerCase().includes('image') || 
      col.toLowerCase().includes('photo') || 
      col.toLowerCase().includes('url') ||
      col.toLowerCase().includes('website')
    );
    
    console.log('🔍 Image-related columns found:');
    imageColumns.forEach(col => {
      console.log(`   - ${col}`);
    });

    // 3. Sample data analysis - Malta bars
    console.log('\n3. 📊 MALTA BARS IMAGE DATA ANALYSIS...');
    const { data: maltaBars, error: maltaError } = await supabase
      .from('bars')
      .select('id, name, address, website_url, photo_url')
      .ilike('address', '%Malta%')
      .limit(10);

    if (maltaError) {
      console.error('❌ Malta bars query error:', maltaError);
    } else {
      console.log(`📍 Analyzing ${maltaBars.length} Malta bars:`);
      maltaBars.forEach((bar, index) => {
        console.log(`\n   ${index + 1}. ${bar.name}`);
        console.log(`      📧 Address: ${bar.address}`);
        console.log(`      🌐 website_url: ${bar.website_url || 'NULL'}`);
        console.log(`      📸 photo_url: ${bar.photo_url || 'NULL'}`);
        
        // Check if URLs are valid Google Maps URLs
        if (bar.website_url) {
          const isGoogleMaps = bar.website_url.includes('googleusercontent.com') || 
                              bar.website_url.includes('googleapis.com');
          console.log(`      ✅ Google Maps URL: ${isGoogleMaps ? 'YES' : 'NO'}`);
        }
      });
    }

    // 4. Sample data analysis - Rwanda bars
    console.log('\n4. 📊 RWANDA BARS IMAGE DATA ANALYSIS...');
    const { data: rwandaBars, error: rwandaError } = await supabase
      .from('bars')
      .select('id, name, address, website_url, photo_url')
      .or('address.ilike.%Rwanda%,address.ilike.%Kigali%')
      .limit(10);

    if (rwandaError) {
      console.error('❌ Rwanda bars query error:', rwandaError);
    } else {
      console.log(`📍 Analyzing ${rwandaBars.length} Rwanda bars:`);
      rwandaBars.forEach((bar, index) => {
        console.log(`\n   ${index + 1}. ${bar.name}`);
        console.log(`      📧 Address: ${bar.address}`);
        console.log(`      �� website_url: ${bar.website_url || 'NULL'}`);
        console.log(`      📸 photo_url: ${bar.photo_url || 'NULL'}`);
        
        // Check if URLs are valid Google Maps URLs
        if (bar.website_url) {
          const isGoogleMaps = bar.website_url.includes('googleusercontent.com') || 
                              bar.website_url.includes('googleapis.com');
          console.log(`      ✅ Google Maps URL: ${isGoogleMaps ? 'YES' : 'NO'}`);
        }
      });
    }

    // 5. Test actual image URLs
    console.log('\n5. 🌐 TESTING IMAGE URL ACCESSIBILITY...');
    const barsWithImages = [...maltaBars, ...rwandaBars].filter(bar => bar.website_url);
    
    for (let i = 0; i < Math.min(5, barsWithImages.length); i++) {
      const bar = barsWithImages[i];
      console.log(`\n🔗 Testing: ${bar.name}`);
      console.log(`   URL: ${bar.website_url}`);
      
      try {
        const response = await fetch(bar.website_url, { method: 'HEAD' });
        console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
        console.log(`   📱 Content-Type: ${response.headers.get('content-type') || 'Unknown'}`);
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
      }
    }

    // 6. Statistics Summary
    console.log('\n6. 📈 IMAGE DATA STATISTICS...');
    const { data: allBars, error: statsError } = await supabase
      .from('bars')
      .select('website_url, photo_url, address');

    if (!statsError && allBars) {
      const totalBars = allBars.length;
      const websiteUrls = allBars.filter(bar => bar.website_url).length;
      const photoUrls = allBars.filter(bar => bar.photo_url).length;
      const googleMapsUrls = allBars.filter(bar => 
        bar.website_url && (
          bar.website_url.includes('googleusercontent.com') ||
          bar.website_url.includes('googleapis.com')
        )
      ).length;
      
      console.log(`📊 Total bars: ${totalBars}`);
      console.log(`🌐 Bars with website_url: ${websiteUrls} (${((websiteUrls/totalBars)*100).toFixed(1)}%)`);
      console.log(`📸 Bars with photo_url: ${photoUrls} (${((photoUrls/totalBars)*100).toFixed(1)}%)`);
      console.log(`🗺️ Bars with Google Maps URLs: ${googleMapsUrls} (${((googleMapsUrls/totalBars)*100).toFixed(1)}%)`);
    }

  } catch (error) {
    console.error('❌ Investigation error:', error);
  }
}

investigateImageIssues();
