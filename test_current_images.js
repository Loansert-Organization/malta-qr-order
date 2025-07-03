import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCurrentImages() {
  console.log('🧪 TESTING CURRENT IMAGE DISPLAY LOGIC');
  console.log('=====================================\n');

  try {
    // Get sample bars from Malta and Rwanda
    const { data: maltaBars, error: maltaError } = await supabase
      .from('bars')
      .select('id, name, website_url')
      .ilike('address', '%Malta%')
      .limit(5);

    const { data: rwandaBars, error: rwandaError } = await supabase
      .from('bars')
      .select('id, name, website_url')
      .or('address.ilike.%Rwanda%,address.ilike.%Kigali%')
      .limit(5);

    if (maltaError || rwandaError) {
      console.error('❌ Query errors:', { maltaError, rwandaError });
      return;
    }

    // Test the getBarImage logic from ClientHome.tsx
    const getBarImage = (bar) => {
      // 1. First try: Use website_url if it contains a Google Maps photo
      if (bar.website_url && bar.website_url.includes('googleusercontent.com')) {
        return bar.website_url;
      }
      
      // 2. Second try: Use website_url if it's any valid image URL
      if (bar.website_url && bar.website_url.startsWith('http')) {
        return bar.website_url;
      }
      
      // 3. Final fallback: Professional restaurant placeholder
      return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
    };

    console.log('1. 🇲🇹 MALTA BARS - IMAGE LOGIC TEST');
    console.log('===================================');
    maltaBars?.forEach((bar, index) => {
      const imageUrl = getBarImage(bar);
      console.log(`\n${index + 1}. ${bar.name}`);
      console.log(`   📍 Has website_url: ${bar.website_url ? 'YES' : 'NO'}`);
      console.log(`   🗺️ Google Maps URL: ${bar.website_url?.includes('googleusercontent.com') ? 'YES' : 'NO'}`);
      console.log(`   🖼️ Final Image URL: ${imageUrl}`);
      console.log(`   📏 URL Length: ${imageUrl.length}`);
      
      if (imageUrl === 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center&auto=format&q=80') {
        console.log(`   ⚠️ USING FALLBACK IMAGE`);
      } else if (imageUrl.includes('googleusercontent.com')) {
        console.log(`   ✅ USING GOOGLE MAPS PHOTO`);
      }
    });

    console.log('\n2. 🇷🇼 RWANDA BARS - IMAGE LOGIC TEST');
    console.log('====================================');
    rwandaBars?.forEach((bar, index) => {
      const imageUrl = getBarImage(bar);
      console.log(`\n${index + 1}. ${bar.name}`);
      console.log(`   📍 Has website_url: ${bar.website_url ? 'YES' : 'NO'}`);
      console.log(`   🗺️ Google Maps URL: ${bar.website_url?.includes('googleusercontent.com') ? 'YES' : 'NO'}`);
      console.log(`   🖼️ Final Image URL: ${imageUrl}`);
      console.log(`   📏 URL Length: ${imageUrl.length}`);
      
      if (imageUrl === 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center&auto=format&q=80') {
        console.log(`   ⚠️ USING FALLBACK IMAGE`);
      } else if (imageUrl.includes('googleusercontent.com')) {
        console.log(`   ✅ USING GOOGLE MAPS PHOTO`);
      }
    });

    // 3. Test actual image accessibility with browser headers
    console.log('\n3. 🌐 TESTING IMAGE ACCESSIBILITY');
    console.log('=================================');
    
    const testBars = [...(maltaBars || []), ...(rwandaBars || [])].slice(0, 3);
    
    for (const bar of testBars) {
      const imageUrl = getBarImage(bar);
      console.log(`\n🔗 Testing: ${bar.name}`);
      console.log(`   URL: ${imageUrl.substring(0, 80)}...`);
      
      try {
        const response = await fetch(imageUrl, { 
          method: 'HEAD',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Referer': 'https://maps.google.com/',
            'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8'
          }
        });
        
        console.log(`   ✅ Status: ${response.status} ${response.statusText}`);
        console.log(`   📱 Content-Type: ${response.headers.get('content-type') || 'Unknown'}`);
        console.log(`   🎉 ACCESSIBLE: ${response.status === 200 ? 'YES' : 'NO'}`);
        
      } catch (error) {
        console.log(`   ❌ Fetch Error: ${error.message}`);
      }
    }

    // 4. Check fallback image
    console.log('\n4. ✅ TESTING FALLBACK IMAGE');
    console.log('============================');
    
    const fallbackUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center&auto=format&q=80';
    try {
      const response = await fetch(fallbackUrl, { method: 'HEAD' });
      console.log(`🔗 Fallback URL Status: ${response.status} ${response.statusText}`);
      console.log(`📱 Content-Type: ${response.headers.get('content-type') || 'Unknown'}`);
      console.log(`🎉 FALLBACK ACCESSIBLE: ${response.status === 200 ? 'YES' : 'NO'}`);
    } catch (error) {
      console.log(`❌ Fallback Error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Critical test error:', error);
  }
}

testCurrentImages();
