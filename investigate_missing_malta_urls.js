import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateMissingMaltaUrls() {
  console.log('🔍 INVESTIGATING MISSING MALTA IMAGE URLS');
  console.log('========================================\n');

  try {
    // Check ALL Malta bars
    const { data: allMaltaBars, error } = await supabase
      .from('bars')
      .select('id, name, website_url, created_at, updated_at')
      .ilike('address', '%Malta%')
      .order('name');

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Found ${allMaltaBars.length} Malta bars total`);

    // Count bars with and without URLs
    const withUrls = allMaltaBars.filter(bar => bar.website_url);
    const withoutUrls = allMaltaBars.filter(bar => !bar.website_url);

    console.log(`✅ WITH website_url: ${withUrls.length}`);
    console.log(`❌ WITHOUT website_url: ${withoutUrls.length}`);

    // Show the bars that DO have URLs
    if (withUrls.length > 0) {
      console.log('\n🔗 MALTA BARS WITH URLS:');
      withUrls.forEach((bar, index) => {
        console.log(`${index + 1}. ${bar.name}`);
        console.log(`   URL: ${bar.website_url?.substring(0, 60)}...`);
        console.log(`   Created: ${bar.created_at}`);
        console.log(`   Updated: ${bar.updated_at}\n`);
      });
    }

    // Show first 10 bars WITHOUT URLs
    console.log('\n❌ FIRST 10 MALTA BARS WITHOUT URLS:');
    withoutUrls.slice(0, 10).forEach((bar, index) => {
      console.log(`${index + 1}. ${bar.name}`);
      console.log(`   website_url: ${bar.website_url}`);
      console.log(`   Created: ${bar.created_at}`);
      console.log(`   Updated: ${bar.updated_at}\n`);
    });

    // Check the bars we specifically know should have images
    const expectedBarsWithImages = [
      'The Crafty Cat Pub',
      'The Hoppy Hare Pub', 
      'Down the Rabbit Hole',
      'The Hatter Irish Pub',
      'Tortuga Malta',
      'White Tower Lido',
      'The Brigantine Lounge Bar',
      'Victoria Bar',
      'Munchies Snack Bar',
      'Agliolio Restaurant'
    ];

    console.log('\n🎯 CHECKING EXPECTED BARS WITH IMAGES:');
    for (const barName of expectedBarsWithImages) {
      const bar = allMaltaBars.find(b => b.name === barName);
      if (bar) {
        console.log(`✅ Found: ${bar.name}`);
        console.log(`   URL: ${bar.website_url || 'NULL'}`);
        console.log(`   Has URL: ${bar.website_url ? 'YES' : 'NO'}\n`);
      } else {
        console.log(`❌ NOT FOUND: ${barName}\n`);
      }
    }

    // Check recent updates
    console.log('\n📅 CHECKING RECENT UPDATES:');
    const recentlyUpdated = allMaltaBars
      .filter(bar => new Date(bar.updated_at) > new Date('2025-01-20'))
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    console.log(`📊 ${recentlyUpdated.length} bars updated since Jan 20, 2025:`);
    recentlyUpdated.slice(0, 5).forEach((bar, index) => {
      console.log(`${index + 1}. ${bar.name}`);
      console.log(`   Updated: ${bar.updated_at}`);
      console.log(`   Has URL: ${bar.website_url ? 'YES' : 'NO'}\n`);
    });

  } catch (error) {
    console.error('❌ Investigation error:', error);
  }
}

investigateMissingMaltaUrls();
