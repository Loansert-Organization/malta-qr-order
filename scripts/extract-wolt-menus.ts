import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

// Malta bars list
const MALTA_BARS = [
  "Crafty cat",
  "Hoppy hare",
  "Rabbit hole",
  "The hatter",
  "Tortuga",
  "White tower lido",
  "Brigantine lounge bar",
  "Victoria bar",
  "Munchies franchise",
  "Agliolio",
  "Singita restaurant",
  "Gnejna kiosk",
  "Paparazzi restaurants",
  "Babel",
  "La bitters",
  "Cafe society",
  "Blu Beach Club",
  "kings pub",
  "Mina's",
  "Angela's Valletta",
  "Ħelu Manna Gluten Free Kafeterija Val",
  "Kaiseki",
  "White Bridge",
  "Suki Asian Snacks",
  "Focacceria Dal Pani",
  "La Sfoglia",
  "THE EVEREST /NEPALESE & INDIAN RE",
  "StrEat",
  "Soul Food",
  "MUŻA Restaurant",
  "La Pira Maltese Kitchen",
  "San Giovanni Valletta",
  "The Dragon Chinese restaurant",
  "AKI",
  "Paul's Bistro",
  "Zizka",
  "Beati Paoli Restaurant",
  "Osteria Tropea",
  "Mojitos Beach Terrace",
  "Piatto Nero Mediterranean Restaurant",
  "Victoria Bar",
  "Tanti Cafe Grill",
  "Vecchia Napoli Mellieha",
  "Munchies Mellieha Bay",
  "Sandy Waters",
  "Maxima Bar & Restaurant",
  "Ventuno Restaurant",
  "Great Dane Restaurant",
  "Salia Restaurant - Mellieha",
  "Jungle",
  "Blu Beach Club",
  "Tavio's Pepe Nero",
  "La Buona Trattoria del Nonno",
  "simenta restaurant",
  "Thalassalejn Boċċi Club",
  "LOA",
  "Ostrica",
  "The Sea Cloud I Cocktail & Wine Bar",
  "Xemxija Pitstop",
  "Shaukiwan",
  "Gandhi Tandoori",
  "Gourmet Bar & Grill",
  "Venus Restaurant Bugibba",
  "Malta Chocolate Factory",
  "Victoria Gastropub",
  "Bognor Bar & Restaurant",
  "Bayside Restaurant",
  "Vinnies",
  "Nine Lives",
  "The Watson's Pub & Diner",
  "9 Ball Cafe",
  "Woodhut Pub & Diner",
  "Ocean Basket",
  "Vecchia Napoli Qawra",
  "Seaside Kiosk",
  "Vecchia Napoli @ Salini Resort, Naxxar",
  "Giuseppi's Bar & Bistro",
  "Ivy House",
  "Sharma Ethnic Cuisines",
  "L'Aroma - Meltingpot",
  "The Bridge",
  "Le Bistro",
  "Caviar & Bull",
  "Don Royale",
  "Henry J. Bean's",
  "Acqua",
  "Tiffany Lounge Restaurant",
  "Marina Terrace",
  "Bayview Seafood House",
  "Gozitan Restaurant",
  "L' Ostricaio Paceville, St. Julians",
  "Dolce Sicilia Paceville",
  "Bellavia Ristorante Italiano",
  "Hammett's Mestizo",
  "Lubelli",
  "Paranga",
  "Intercontinental Beach Bar",
  "White Wine And Food",
  "Open Waters",
  "Hugo's Terrace & Rooftop",
  "The Long Hall Irish Pub",
  "Peppermint",
  "Burgers.Ink",
  "NOM NOM Paceville",
  "Hot Shot Bar",
  "Trattoria da Nennella",
  "Cork's",
  "Big G's Snack Bar",
  "The Game & Ale Pub ( by Crust )",
  "Wok to Walk",
  "The Dubliner",
  "The Crafty Cat Pub",
  "City of London Bar",
  "NAAR Restobar",
  "U Bistrot",
  "Barracuda Restaurant",
  "Barracuda Rooftop Lounge",
  "Era Ora Steakhouse",
  "Piccolo Padre",
  "Fresco's",
  "Peppi's Restaurant",
  "The Exiles Beach Club",
  "Paradise Exiles",
  "Little Argentina",
  "Il-Gabbana",
  "Ta' Kolina",
  "LA LUZ",
  "l-Fortizza",
  "Mason's Cafe",
  "The Road Devil Sea Front",
  "The Compass Lounge",
  "Lady Di",
  "Tigne Beach Club",
  "MedAsia Playa",
  "1926 La Plage",
  "Il Galeone",
  "The Chapels Gastrobrewpub",
  "King's Gate Gastropub",
  "Jungle Joy Bar - Restaurant",
  "Bus Stop Lounge",
  "Gourmet Fish & Grill",
  "Felice Brasserie",
  "Aqualuna",
  "Punto Bar & Dine",
  "Black Gold Saloon",
  "MedAsia Fusion Lounge",
  "The Londoner Pub Sliema",
  "The Brew Grill & Brewery",
  "The Black Sheep drink and dine",
  "Trattoria del Mare - Malta Restaurant",
  "Tiffany's Bistro",
  "Giorgio's",
  "Lou's Bistro",
  "Opa! Mediterranean Fusion",
  "Port 21 Restaurant",
  "The Black Pearl",
  "Mamma Mia Restaurant",
  "The Ordnance Pub & Restaurant",
  "Piadina Caffe",
  "The Capitol City Bar",
  "Tico Tico",
  "67 Kapitali",
  "Wild Honey Beer House & Bistro",
  "CUBA Restaurant, Shoreline Mall, Kalkara"
];

interface ExtractionResult {
  bar: string;
  status: 'matched' | 'not_found';
  matched_name?: string;
  items?: number;
  reason?: string;
}

async function runWoltExtraction() {
  console.log('🚀 Starting Wolt Malta menu extraction...');
  console.log(`📋 Processing ${MALTA_BARS.length} bars\n`);

  try {
    // First, ensure tables exist
    console.log('📊 Creating tables if they don\'t exist...');
    
    // Run the migration
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create restaurant_menus table if not exists
        CREATE TABLE IF NOT EXISTS restaurant_menus (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bar_name TEXT NOT NULL,
          matched_name TEXT NOT NULL,
          wolt_url TEXT NOT NULL,
          item_name TEXT NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          image_url TEXT,
          category TEXT,
          subcategory TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create unmatched_bars table if not exists
        CREATE TABLE IF NOT EXISTS unmatched_bars (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          bar_name TEXT NOT NULL,
          reason TEXT NOT NULL,
          attempted_at TIMESTAMP WITH TIME ZONE NOT NULL
        );

        -- Create indexes
        CREATE INDEX IF NOT EXISTS idx_restaurant_menus_bar_name ON restaurant_menus(bar_name);
        CREATE INDEX IF NOT EXISTS idx_unmatched_bars_bar_name ON unmatched_bars(bar_name);
      `
    });

    if (migrationError) {
      console.error('Migration error:', migrationError);
    }

    // Call the edge function in batches
    const batchSize = 10;
    const results = {
      totalBars: MALTA_BARS.length,
      matchedBars: 0,
      unmatchedBars: 0,
      totalMenuItems: 0,
      details: [] as ExtractionResult[]
    };

    for (let i = 0; i < MALTA_BARS.length; i += batchSize) {
      const batch = MALTA_BARS.slice(i, i + batchSize);
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(MALTA_BARS.length / batchSize)}`);
      
      const response = await fetch('https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1/wolt-menu-extractor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ inputBars: batch })
      });

      if (response.ok) {
        const batchResult = await response.json();
        results.matchedBars += batchResult.matchedBars;
        results.unmatchedBars += batchResult.unmatchedBars;
        results.totalMenuItems += batchResult.totalMenuItems;
        results.details.push(...batchResult.results);
        
        console.log(`✅ Batch complete: ${batchResult.matchedBars} matched, ${batchResult.unmatchedBars} unmatched`);
      } else {
        console.error(`❌ Batch failed: ${response.statusText}`);
      }
      
      // Add delay between batches
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 EXTRACTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total bars processed: ${results.totalBars}`);
    console.log(`Successfully matched: ${results.matchedBars}`);
    console.log(`Unmatched bars: ${results.unmatchedBars}`);
    console.log(`Total menu items extracted: ${results.totalMenuItems}`);
    console.log(`Success rate: ${((results.matchedBars / results.totalBars) * 100).toFixed(1)}%`);
    
    // Show matched bars
    console.log('\n✅ MATCHED BARS:');
    results.details
      .filter(r => r.status === 'matched')
      .forEach(r => {
        console.log(`  - ${r.bar} → ${r.matched_name} (${r.items} items)`);
      });
    
    // Show unmatched bars
    console.log('\n❌ UNMATCHED BARS:');
    results.details
      .filter(r => r.status === 'not_found')
      .forEach(r => {
        console.log(`  - ${r.bar}`);
      });

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run the extraction
runWoltExtraction(); 