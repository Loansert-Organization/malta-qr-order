import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);

// Complete list of required Rwanda bars
const requiredRwandaBars = [
  'AFTER PARTY BAR & GRILL',
  'Agence Pub',
  'ALEX COME AGAIN BAR KICUKIRO BRANCH',
  'Amahumbezi Pub',
  'Antonov Bar',
  'Astro Bar & Restaurant',
  'B Flex Bar',
  'Bahamas Pub',
  'Bar Dolce',
  'Bar Filao',
  'Bar Nyenyeri',
  'Billy\'s Bistro & Bar',
  'Blackstone Lounge Kigali',
  'Bodega and Brew Kacyiru',
  'Burrows Bar & Restaurant',
  'Cafe Restaurant Olympiade',
  'Carpe Diem Bistro',
  'CARRINGTON Resto-Bar',
  'Chez Guiness Bar',
  'Chez John Restaurant',
  'Chez Kiruhura',
  'Cincinnati Bar & Grill',
  'CKYC Lounge',
  'Click Bar',
  'Cocobean',
  'Come Again Bar & Resto Giporoso',
  'Come Again, Kicukiro',
  'Continental restaurant',
  'Copenhagen Lounge',
  'CRYSTAL LOUNGE - Rooftop Restaurant & Bar',
  'Déjà Vu',
  'East 24 Bar & Grill',
  'Emerald Cafe and Restaurant, Remera',
  'Four Points by Sheraton Kigali',
  'Gorillas Golf Hotel',
  'Grand Legacy Hotel',
  'Great Wall Chinese Restaurant',
  'Green Corner',
  'H2O Lounge',
  'Happy Park',
  'HAVANA BAR AND RESTO',
  'Heroes Lounge',
  'Hôtel Chez Lando',
  'Hôtel des Mille Collines',
  'Hotel Villa Portofino Kigali',
  'HQ LOUNGE',
  'Inzozi Africa House B&B',
  'Jollof Kigali',
  'Juru Garden Bar',
  'Kari-Beau Restaurant',
  'Kigali Diplomat Hotel',
  'Kigali Marriott Hotel',
  'Kigali Serena Hotel',
  'Kigali Sport Bar',
  'Kiruhura Disque Orange',
  'La Sanitas',
  'Lemigo Hotel',
  'Maestro Kitchen',
  'Maison Noire Bar & Restaurant',
  'Maracana Rwanda',
  'Meze Fresh',
  'Missed Call Pub',
  'Nobleza Hotel',
  'Onomo Hotel',
  'Oyster Bar & Grill',
  'Paddock Bar',
  'Park Inn by Radisson Kigali',
  'Pili Pili',
  'Plus 250',
  'Quelque Part Resto Bar',
  'RELAX BAR & GRILL',
  'Repub Lounge',
  'Resto-Bar Chez John Maradona',
  'Riders Lounge Kigali',
  'Rio de Gikondo Sport Bar & Accomodation',
  'Roasters CHOMAZONE Restaurant',
  'Rosty Club',
  'Sky Lounge',
  'Suka Bar & Café',
  'Sundowner',
  'Ten to Two Bar Resto',
  'The B Lounge',
  'THE BELLO RESTAURANT',
  'The Green Lounge Bar & Restaurant',
  'The Grid Kigali',
  'The Manor Hotel',
  'The SkySports Lounge',
  'Torino Bar & Restaurant',
  'Tropical Bar-Restaurant-Rounge',
  'Ubumwe Grande Hotel',
  'Uncles Restaurant',
  'Urban by CityBlue, Kigali'
];

async function checkRwandaBars() {
  console.log('🔍 Checking Rwanda bars in database...');
  console.log(`📋 Total required bars: ${requiredRwandaBars.length}`);

  try {
    // Get all current Rwanda bars from database
    const { data: currentBars, error } = await supabase
      .from('bars')
      .select('name, address, rating, review_count, contact_number, website_url')
      .or('address.ilike.%Rwanda%,address.ilike.%Kigali%');

    if (error) throw error;

    console.log(`📊 Current Rwanda bars in database: ${currentBars.length}`);

    // Find which bars are missing
    const currentBarNames = currentBars.map(bar => bar.name.trim().toLowerCase());
    const missingBars = [];
    const foundBars = [];

    for (const requiredBar of requiredRwandaBars) {
      const isFound = currentBarNames.some(name => 
        name.includes(requiredBar.toLowerCase()) || 
        requiredBar.toLowerCase().includes(name)
      );
      
      if (isFound) {
        foundBars.push(requiredBar);
      } else {
        missingBars.push(requiredBar);
      }
    }

    console.log(`\n✅ Found bars: ${foundBars.length}`);
    console.log(`❌ Missing bars: ${missingBars.length}`);

    if (foundBars.length > 0) {
      console.log(`\n📍 Some found bars:`);
      foundBars.slice(0, 10).forEach((bar, index) => {
        console.log(`   ${index + 1}. ${bar}`);
      });
      if (foundBars.length > 10) {
        console.log(`   ... and ${foundBars.length - 10} more`);
      }
    }

    if (missingBars.length > 0) {
      console.log(`\n⚠️ Missing bars that need to be scraped:`);
      missingBars.forEach((bar, index) => {
        console.log(`   ${index + 1}. ${bar}`);
      });
    }

    // Check data quality of existing Rwanda bars
    console.log(`\n📊 Data quality check:`);
    const barsWithImages = currentBars.filter(bar => bar.website_url && bar.website_url.includes('googleusercontent'));
    const barsWithRatings = currentBars.filter(bar => bar.rating);
    const barsWithReviews = currentBars.filter(bar => bar.review_count);
    const barsWithPhone = currentBars.filter(bar => bar.contact_number);

    console.log(`   📸 Bars with Google images: ${barsWithImages.length}/${currentBars.length}`);
    console.log(`   ⭐ Bars with ratings: ${barsWithRatings.length}/${currentBars.length}`);
    console.log(`   💬 Bars with review counts: ${barsWithReviews.length}/${currentBars.length}`);
    console.log(`   📞 Bars with phone numbers: ${barsWithPhone.length}/${currentBars.length}`);

    return {
      total: requiredRwandaBars.length,
      found: foundBars.length,
      missing: missingBars.length,
      missingBars: missingBars,
      currentBars: currentBars.length
    };

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkRwandaBars();
