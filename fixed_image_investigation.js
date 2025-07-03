import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixedImageInvestigation() {
  console.log('🔍 CRITICAL IMAGE ISSUE ANALYSIS');
  console.log('================================\n');

  try {
    // 1. Check actual schema without photo_url
    console.log('1. 📋 CHECKING ACTUAL DATABASE SCHEMA...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('bars')
      .select('*')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema error:', schemaError);
      return;
    }

    console.log('✅ Actual columns in bars table:');
    Object.keys(schemaData[0]).forEach((column, index) => {
      console.log(`   ${index + 1}. ${column} (${typeof schemaData[0][column]})`);
    });

    // 2. Check Malta bars with only existing columns
    console.log('\n2. 📊 MALTA BARS - ACTUAL IMAGE DATA...');
    const { data: maltaBars, error: maltaError } = await supabase
      .from('bars')
      .select('id, name, address, website_url')
      .ilike('address', '%Malta%')
      .limit(15);

    if (maltaError) {
      console.error('❌ Malta query error:', maltaError);
    } else {
      console.log(`📍 Found ${maltaBars.length} Malta bars:`);
      maltaBars.forEach((bar, index) => {
        console.log(`\n   ${index + 1}. ${bar.name}`);
        console.log(`      🌐 website_url: ${bar.website_url || 'NULL'}`);
        
        if (bar.website_url) {
          const isGoogleMaps = bar.website_url.includes('googleusercontent.com') || 
                              bar.website_url.includes('googleapis.com') ||
                              bar.website_url.includes('maps.googleapis');
          const isValidUrl = bar.website_url.startsWith('http');
          console.log(`      ✅ Valid URL: ${isValidUrl ? 'YES' : 'NO'}`);
          console.log(`      🗺️ Google Maps: ${isGoogleMaps ? 'YES' : 'NO'}`);
        }
      });
    }

    // 3. Check Rwanda bars
    console.log('\n3. 📊 RWANDA BARS - ACTUAL IMAGE DATA...');
    const { data: rwandaBars, error: rwandaError } = await supabase
      .from('bars')
      .select('id, name, address, website_url')
      .or('address.ilike.%Rwanda%,address.ilike.%Kigali%')
      .limit(15);

    if (rwandaError) {
      console.error('❌ Rwanda query error:', rwandaError);
    } else {
      console.log(`📍 Found ${rwandaBars.length} Rwanda bars:`);
      rwandaBars.forEach((bar, index) => {
        console.log(`\n   ${index + 1}. ${bar.name}`);
        console.log(`      🌐 website_url: ${bar.website_url || 'NULL'}`);
        
        if (bar.website_url) {
          const isGoogleMaps = bar.website_url.includes('googleusercontent.com') || 
                              bar.website_url.includes('googleapis.com') ||
                              bar.website_url.includes('maps.googleapis');
          const isValidUrl = bar.website_url.startsWith('http');
          console.log(`      ✅ Valid URL: ${isValidUrl ? 'YES' : 'NO'}`);
          console.log(`      🗺️ Google Maps: ${isGoogleMaps ? 'YES' : 'NO'}`);
        }
      });
    }

    // 4. Test sample URLs
    console.log('\n4. 🌐 TESTING ACTUAL IMAGE URLS...');
    const allBars = [...(maltaBars || []), ...(rwandaBars || [])];
    const barsWithUrls = allBars.filter(bar => bar.website_url && bar.website_url.startsWith('http'));
    
    console.log(`🔗 Found ${barsWithUrls.length} bars with valid URLs to test:`);
    
    for (let i = 0; i < Math.min(5, barsWithUrls.length); i++) {
      const bar = barsWithUrls[i];
      console.log(`\n🧪 Testing: ${bar.name}`);
      console.log(`   URL: ${bar.website_url}`);
      
      try {
        const response = await fetch(bar.website_url, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
          }
        });
        console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
        console.log(`   📱 Content-Type: ${response.headers.get('content-type') || 'Unknown'}`);
      } catch (error) {
        console.log(`   ❌ Fetch Error: ${error.message}`);
      }
    }

    // 5. Statistics
    console.log('\n5. 📈 CRITICAL STATISTICS...');
    const { data: allBarsStats, error: statsError } = await supabase
      .from('bars')
      .select('website_url, address');

    if (!statsError && allBarsStats) {
      const totalBars = allBarsStats.length;
      const withWebsiteUrl = allBarsStats.filter(bar => bar.website_url).length;
      const withValidUrls = allBarsStats.filter(bar => 
        bar.website_url && bar.website_url.startsWith('http')
      ).length;
      const withGoogleMapsUrls = allBarsStats.filter(bar => 
        bar.website_url && (
          bar.website_url.includes('googleusercontent.com') ||
          bar.website_url.includes('googleapis.com')
        )
      ).length;
      
      console.log(`📊 TOTAL BARS: ${totalBars}`);
      console.log(`🌐 WITH website_url: ${withWebsiteUrl} (${((withWebsiteUrl/totalBars)*100).toFixed(1)}%)`);
      console.log(`✅ WITH VALID URLs: ${withValidUrls} (${((withValidUrls/totalBars)*100).toFixed(1)}%)`);
      console.log(`��️ WITH GOOGLE MAPS URLs: ${withGoogleMapsUrls} (${((withGoogleMapsUrls/totalBars)*100).toFixed(1)}%)`);
    }

    // 6. Critical Issues Found
    console.log('\n6. 🚨 CRITICAL ISSUES IDENTIFIED...');
    console.log('❌ ISSUE 1: photo_url column does NOT exist in database');
    console.log('❌ ISSUE 2: Only website_url column exists for images');
    console.log('❌ ISSUE 3: Frontend may be looking for wrong column name');
    
  } catch (error) {
    console.error('❌ Critical investigation error:', error);
  }
}

fixedImageInvestigation();
