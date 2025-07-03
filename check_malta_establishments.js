import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

// Malta establishments that should be added if missing
const maltaEstablishments = [
  'Trabuxu Bistro',
  'Bridge Bar',
  'Hugo\'s Lounge',
  'Sky Club Malta',
  'Medina Restaurant & Bar',
  'Ta\' Kris Restaurant',
  'Rubino Restaurant',
  'Noni Restaurant',
  'Palazzo Preca Restaurant',
  'The Chophouse',
  'Guze Bistro',
  'Tal-Petut Restaurant',
  'Bacchus Restaurant',
  'Zest Restaurant',
  'Caviar & Bull',
  'Fumia Restaurant',
  'Legligin Wine Bar & Restaurant',
  'De Mondion Restaurant',
  'Il-Forn Restaurant',
  'Palazzo Parisio Restaurant',
  'Mgarr ix-Xini Beach Club',
  'Ta\' Mena Estate',
  'Il-Kantra Restaurant',
  'Gozo Kitchen',
  'Sammy\'s Restaurant',
  'Maldonado Bistro',
  'Ta\' Rikardu Restaurant',
  'It-Tokk Restaurant',
  'Oleander Restaurant',
  'Tal-Massar Winery'
];

async function checkMaltaEstablishments() {
  console.log('🔍 Checking Malta establishments in database...');
  console.log(`📋 Target Malta establishments: ${maltaEstablishments.length}`);

  try {
    // Get current Malta establishments
    const { data: currentBars, error } = await supabase
      .from('bars')
      .select('name, address, rating, review_count, contact_number, website_url')
      .ilike('address', '%Malta%');

    if (error) throw error;

    console.log(`📊 Current Malta bars in database: ${currentBars.length}`);

    // Check which ones are missing
    const currentBarNames = currentBars.map(bar => bar.name.trim().toLowerCase());
    const missingBars = [];
    const foundBars = [];

    for (const targetBar of maltaEstablishments) {
      const isFound = currentBarNames.some(name => 
        name.includes(targetBar.toLowerCase()) || 
        targetBar.toLowerCase().includes(name)
      );
      
      if (isFound) {
        foundBars.push(targetBar);
      } else {
        missingBars.push(targetBar);
      }
    }

    console.log(`\n✅ Found Malta bars: ${foundBars.length}`);
    console.log(`❌ Missing Malta bars: ${missingBars.length}`);

    if (foundBars.length > 0) {
      console.log(`\n📍 Some found Malta bars:`);
      foundBars.slice(0, 10).forEach((bar, index) => {
        console.log(`   ${index + 1}. ${bar}`);
      });
    }

    if (missingBars.length > 0) {
      console.log(`\n⚠️ Missing Malta bars that should be added:`);
      missingBars.forEach((bar, index) => {
        console.log(`   ${index + 1}. ${bar}`);
      });
    }

    // Data quality check
    console.log(`\n📊 Malta data quality:`);
    const barsWithImages = currentBars.filter(bar => bar.website_url && bar.website_url.includes('googleusercontent'));
    const barsWithRatings = currentBars.filter(bar => bar.rating);
    const barsWithReviews = currentBars.filter(bar => bar.review_count);
    const barsWithPhone = currentBars.filter(bar => bar.contact_number);

    console.log(`   📸 Malta bars with Google images: ${barsWithImages.length}/${currentBars.length}`);
    console.log(`   ⭐ Malta bars with ratings: ${barsWithRatings.length}/${currentBars.length}`);
    console.log(`   💬 Malta bars with review counts: ${barsWithReviews.length}/${currentBars.length}`);
    console.log(`   📞 Malta bars with phone numbers: ${barsWithPhone.length}/${currentBars.length}`);

    return {
      total: maltaEstablishments.length,
      found: foundBars.length,
      missing: missingBars.length,
      missingBars: missingBars,
      currentBars: currentBars.length
    };

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkMaltaEstablishments();
