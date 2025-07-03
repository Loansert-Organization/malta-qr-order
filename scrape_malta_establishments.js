import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(supabaseUrl, supabaseKey);
const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw';

// All required Malta and Gozo establishments
const maltaEstablishments = [
  'Crafty cat',
  'Hoppy hare', 
  'Rabbit hole',
  'The hatter',
  'Tortuga',
  'White tower lido',
  'Brigantine lounge bar',
  'Victoria bar',
  'Munchies franchise',
  'Agliolio',
  'Singita restaurant',
  'Gnejna kiosk',
  'Paparazzi restaurants',
  'Babel',
  'La bitters',
  'Cafe society',
  'Blu Beach Club',
  'kings pub',
  'Mina\'s',
  'Angela\'s Valletta',
  'Ħelu Manna Gluten Free Kafeterija Val',
  'Kaiseki',
  'White Bridge',
  'Suki Asian Snacks',
  'Focacceria Dal Pani',
  'La Sfoglia',
  'THE EVEREST /NEPALESE & INDIAN RE',
  'StrEat',
  'Soul Food',
  'MUŻA Restaurant',
  'La Pira Maltese Kitchen',
  'San Giovanni Valletta',
  'The Dragon Chinese restaurant',
  'AKI',
  'Paul\'s Bistro',
  'Zizka',
  'Beati Paoli Restaurant',
  'Osteria Tropea',
  'Mojitos Beach Terrace',
  'Piatto Nero Mediterranean Restaurant',
  'Tanti Cafe Grill',
  'Vecchia Napoli Mellieha',
  'Munchies Mellieha Bay',
  'Sandy Waters',
  'Maxima Bar & Restaurant',
  'Ventuno Restaurant',
  'Great Dane Restaurant',
  'Salia Restaurant - Mellieha',
  'Jungle',
  'Tavio\'s Pepe Nero',
  'La Buona Trattoria del Nonno',
  'simenta restaurant',
  'Thalassalejn Boċċi Club',
  'LOA',
  'Ostrica',
  'The Sea Cloud I Cocktail & Wine Bar',
  'Xemxija Pitstop',
  'Shaukiwan',
  'Gandhi Tandoori',
  'Gourmet Bar & Grill',
  'Venus Restaurant Bugibba',
  'Malta Chocolate Factory',
  'Victoria Gastropub',
  'Bognor Bar & Restaurant',
  'Bayside Restaurant',
  'Vinnies',
  'Nine Lives',
  'The Watson\'s Pub & Diner',
  '9 Ball Cafe',
  'Woodhut Pub & Diner',
  'Ocean Basket',
  'Vecchia Napoli Qawra',
  'Seaside Kiosk',
  'Vecchia Napoli @ Salini Resort, Naxxar',
  'Giuseppi\'s Bar & Bistro',
  'Ivy House',
  'Sharma Ethnic Cuisines',
  'L\'Aroma - Meltingpot',
  'The Bridge',
  'Le Bistro',
  'Caviar & Bull',
  'Don Royale',
  'Henry J. Bean\'s',
  'Acqua',
  'Tiffany Lounge Restaurant',
  'Marina Terrace',
  'Bayview Seafood House',
  'Gozitan Restaurant',
  'L\' Ostricaio Paceville, St. Julians',
  'Dolce Sicilia Paceville',
  'Bellavia Ristorante Italiano',
  'Hammett\'s Mestizo',
  'Lubelli',
  'Paranga',
  'Intercontinental Beach Bar',
  'White Wine And Food',
  'Open Waters',
  'Hugo\'s Terrace & Rooftop',
  'The Long Hall Irish Pub',
  'Peppermint',
  'Burgers.Ink',
  'NOM NOM Paceville',
  'Hot Shot Bar',
  'Trattoria da Nennella',
  'Cork\'s',
  'Big G\'s Snack Bar',
  'The Game & Ale Pub ( by Crust )',
  'Wok to Walk',
  'The Dubliner',
  'The Crafty Cat Pub',
  'City of London Bar',
  'NAAR Restobar',
  'U Bistrot',
  'Barracuda Restaurant',
  'Barracuda Rooftop Lounge',
  'Era Ora Steakhouse',
  'Piccolo Padre',
  'Fresco\'s',
  'Peppi\'s Restaurant',
  'The Exiles Beach Club',
  'Paradise Exiles',
  'Little Argentina',
  'Il-Gabbana',
  'Ta\' Kolina',
  'LA LUZ',
  'l-Fortizza',
  'Mason\'s Cafe',
  'The Road Devil Sea Front',
  'The Compass Lounge',
  'Lady Di',
  'Tigne Beach Club',
  'MedAsia Playa',
  '1926 La Plage',
  'Il Galeone',
  'The Chapels Gastrobrewpub',
  'King\'s Gate Gastropub',
  'Jungle Joy Bar - Restaurant',
  'Bus Stop Lounge',
  'Gourmet Fish & Grill',
  'Felice Brasserie',
  'Aqualuna',
  'Punto Bar & Dine',
  'Black Gold Saloon',
  'MedAsia Fusion Lounge',
  'The Londoner Pub Sliema',
  'The Brew Grill & Brewery',
  'The Black Sheep drink and dine',
  'Trattoria del Mare - Malta Restaurant',
  'Tiffany\'s Bistro',
  'Giorgio\'s',
  'Lou\'s Bistro',
  'Opa! Mediterranean Fusion',
  'Port 21 Restaurant',
  'The Black Pearl',
  'Mamma Mia Restaurant',
  'The Ordnance Pub & Restaurant',
  'Piadina Caffe',
  'The Capitol City Bar',
  'Tico Tico',
  '67 Kapitali',
  'Wild Honey Beer House & Bistro',
  'CUBA Restaurant, Shoreline Mall, Kalkara'
];

async function scrapeMaltaEstablishments() {
  console.log('🚀 COMPREHENSIVE MALTA/GOZO ESTABLISHMENTS SCRAPING');
  console.log(`📋 Scraping ${maltaEstablishments.length} Malta/Gozo establishments...`);

  let successCount = 0;
  let errorCount = 0;
  const results = [];

  // Process in batches to respect API limits
  const batchSize = 10;
  
  for (let i = 0; i < maltaEstablishments.length; i += batchSize) {
    const batch = maltaEstablishments.slice(i, i + batchSize);
    console.log(`\n📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(maltaEstablishments.length/batchSize)}`);
    
    for (let j = 0; j < batch.length; j++) {
      const barName = batch[j];
      const overallIndex = i + j;
      
      try {
        console.log(`\n🔍 [${overallIndex + 1}/${maltaEstablishments.length}] Processing: ${barName}`);
        
        // Step 1: Search Google Places for this Malta establishment
        const searchQuery = encodeURIComponent(`${barName} Malta restaurant bar`);
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${searchQuery}&key=${GOOGLE_MAPS_API_KEY}`;
        
        console.log(`   🔍 Searching Google Maps...`);
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0];
          console.log(`   ✅ Found: ${place.name} (${place.place_id})`);
          
          // Step 2: Get detailed information
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,rating,user_ratings_total,photos,geometry&key=${GOOGLE_MAPS_API_KEY}`;
          
          const detailsResponse = await fetch(detailsUrl);
          const detailsData = await detailsResponse.json();
          
          if (detailsData.result) {
            const details = detailsData.result;
            console.log(`   📊 Rating: ${details.rating || 'N/A'}, Reviews: ${details.user_ratings_total || 'N/A'}`);
            
            // Step 3: Get photo URL if available
            let photoUrl = null;
            if (details.photos && details.photos.length > 0) {
              const photoRef = details.photos[0].photo_reference;
              photoUrl = `https://lh3.googleusercontent.com/p/${photoRef}=w800-h600-k-no`;
              console.log(`   📸 Photo available: YES`);
            } else {
              console.log(`   �� Photo available: NO`);
            }
            
            // Store result for batch insertion
            results.push({
              name: details.name || barName,
              address: details.formatted_address || `Malta`,
              contact_number: details.formatted_phone_number || null,
              rating: details.rating || null,
              review_count: details.user_ratings_total || null,
              google_place_id: place.place_id,
              website_url: photoUrl,
              status: 'ready'
            });
            
            console.log(`   ✅ SUCCESS: ${barName} data collected!`);
            successCount++;
          } else {
            console.log(`   ⚠️ No details found for ${barName}`);
            errorCount++;
            results.push({ name: barName, status: 'no_details' });
          }
        } else {
          console.log(`   ⚠️ Not found on Google Maps: ${barName}`);
          errorCount++;
          results.push({ name: barName, status: 'not_found' });
        }
        
        // Rate limiting - respect Google's API limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (error) {
        console.error(`   ❌ Error processing ${barName}:`, error);
        errorCount++;
        results.push({ name: barName, status: 'error', error: error.message });
      }
    }
    
    console.log(`   ⏸️ Batch completed. Waiting 2 seconds before next batch...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n🎉 MALTA/GOZO ESTABLISHMENTS SCRAPING COMPLETED!`);
  console.log(`   ✅ Successfully processed: ${successCount} establishments`);
  console.log(`   ❌ Errors: ${errorCount} establishments`);
  console.log(`   �� Total processed: ${maltaEstablishments.length} establishments`);

  // Show results summary
  const successful = results.filter(r => r.status === 'ready');
  const withPhotos = successful.filter(r => r.website_url);
  const withRatings = successful.filter(r => r.rating);

  console.log(`\n📈 Quality Summary:`);
  console.log(`   📸 Establishments with photos: ${withPhotos.length}/${successful.length}`);
  console.log(`   ⭐ Establishments with ratings: ${withRatings.length}/${successful.length}`);

  if (successful.length > 0) {
    console.log(`\n✅ Sample successful data collection:`);
    successful.slice(0, 10).forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name} - ${result.rating ? result.rating + '⭐' : 'No rating'} - ${result.website_url ? '📸' : '❌'}`);
    });
    
    if (successful.length > 10) {
      console.log(`   ... and ${successful.length - 10} more establishments ready for database insertion`);
    }
  }

  // Save collected data for database insertion
  console.log(`\n💾 Saving collected data to malta_establishments_data.json...`);
  const fs = await import('fs');
  fs.writeFileSync('malta_establishments_data.json', JSON.stringify(successful, null, 2));
  console.log(`✅ Data saved! Ready for database insertion.`);

  return {
    total: maltaEstablishments.length,
    successful: successCount,
    errors: errorCount,
    results: results,
    readyForDB: successful.length
  };
}

scrapeMaltaEstablishments();
