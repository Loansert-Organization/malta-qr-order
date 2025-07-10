import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const GOOGLE_MAPS_API_KEY = 'AIzaSyCVbVWLFl5O2TdL7zDAjM08ws9D6IxPEFw'

    console.log('🗺️ FETCHING BARS FROM GOOGLE MAPS')
    console.log('=================================')

    // The exact list of bars provided by user
    const barsList = [
      // Malta bars
      { name: "Crafty cat", country: "Malta" },
      { name: "Hoppy hare", country: "Malta" },
      { name: "Rabbit hole", country: "Malta" },
      { name: "The hatter", country: "Malta" },
      { name: "Tortuga", country: "Malta" },
      { name: "White tower lido", country: "Malta" },
      { name: "Brigantine lounge bar", country: "Malta" },
      { name: "Victoria bar", country: "Malta" },
      { name: "Munchies franchise", country: "Malta" },
      { name: "Agliolio", country: "Malta" },
      { name: "Singita restaurant", country: "Malta" },
      { name: "Gnejna kiosk", country: "Malta" },
      { name: "Paparazzi restaurants", country: "Malta" },
      { name: "Babel", country: "Malta" },
      { name: "La bitters", country: "Malta" },
      { name: "Cafe society", country: "Malta" },
      { name: "Blu Beach Club", country: "Malta" },
      { name: "kings pub", country: "Malta" },
      { name: "Mina's", country: "Malta" },
      { name: "Angela's Valletta", country: "Malta" },
      { name: "Ħelu Manna Gluten Free Kafeterija Val", country: "Malta" },
      { name: "Kaiseki", country: "Malta" },
      { name: "White Bridge", country: "Malta" },
      { name: "Suki Asian Snacks", country: "Malta" },
      { name: "Focacceria Dal Pani", country: "Malta" },
      { name: "La Sfoglia", country: "Malta" },
      { name: "THE EVEREST /NEPALESE & INDIAN RE", country: "Malta" },
      { name: "StrEat", country: "Malta" },
      { name: "Soul Food", country: "Malta" },
      { name: "MUŻA Restaurant", country: "Malta" },
      { name: "La Pira Maltese Kitchen", country: "Malta" },
      { name: "San Giovanni Valletta", country: "Malta" },
      { name: "The Dragon Chinese restaurant", country: "Malta" },
      { name: "AKI", country: "Malta" },
      { name: "Paul's Bistro", country: "Malta" },
      { name: "Zizka", country: "Malta" },
      { name: "Beati Paoli Restaurant", country: "Malta" },
      { name: "Osteria Tropea", country: "Malta" },
      { name: "Mojitos Beach Terrace", country: "Malta" },
      { name: "Piatto Nero Mediterranean Restaurant", country: "Malta" },
      { name: "Victoria Bar", country: "Malta" },
      { name: "Tanti Cafe Grill", country: "Malta" },
      { name: "Vecchia Napoli Mellieha", country: "Malta" },
      { name: "Munchies Mellieha Bay", country: "Malta" },
      { name: "Sandy Waters", country: "Malta" },
      { name: "Maxima Bar & Restaurant", country: "Malta" },
      { name: "Ventuno Restaurant", country: "Malta" },
      { name: "Great Dane Restaurant", country: "Malta" },
      { name: "Salia Restaurant - Mellieha", country: "Malta" },
      { name: "Jungle", country: "Malta" },
      { name: "Tavio's Pepe Nero", country: "Malta" },
      { name: "La Buona Trattoria del Nonno", country: "Malta" },
      { name: "simenta restaurant", country: "Malta" },
      { name: "Thalassalejn Boċċi Club", country: "Malta" },
      { name: "LOA", country: "Malta" },
      { name: "Ostrica", country: "Malta" },
      { name: "The Sea Cloud I Cocktail & Wine Bar", country: "Malta" },
      { name: "Xemxija Pitstop", country: "Malta" },
      { name: "Shaukiwan", country: "Malta" },
      { name: "Gandhi Tandoori", country: "Malta" },
      { name: "Gourmet Bar & Grill", country: "Malta" },
      { name: "Venus Restaurant Bugibba", country: "Malta" },
      { name: "Malta Chocolate Factory", country: "Malta" },
      { name: "Victoria Gastropub", country: "Malta" },
      { name: "Bognor Bar & Restaurant", country: "Malta" },
      { name: "Bayside Restaurant", country: "Malta" },
      { name: "Vinnies", country: "Malta" },
      { name: "Nine Lives", country: "Malta" },
      { name: "The Watson's Pub & Diner", country: "Malta" },
      { name: "9 Ball Cafe", country: "Malta" },
      { name: "Woodhut Pub & Diner", country: "Malta" },
      { name: "Ocean Basket", country: "Malta" },
      { name: "Vecchia Napoli Qawra", country: "Malta" },
      { name: "Seaside Kiosk", country: "Malta" },
      { name: "Vecchia Napoli @ Salini Resort, Naxxar", country: "Malta" },
      { name: "Giuseppi's Bar & Bistro", country: "Malta" },
      { name: "Ivy House", country: "Malta" },
      { name: "Sharma Ethnic Cuisines", country: "Malta" },
      { name: "L'Aroma - Meltingpot", country: "Malta" },
      { name: "The Bridge", country: "Malta" },
      { name: "Le Bistro", country: "Malta" },
      { name: "Caviar & Bull", country: "Malta" },
      { name: "Don Royale", country: "Malta" },
      { name: "Henry J. Bean's", country: "Malta" },
      { name: "Acqua", country: "Malta" },
      { name: "Tiffany Lounge Restaurant", country: "Malta" },
      { name: "Marina Terrace", country: "Malta" },
      { name: "Bayview Seafood House", country: "Malta" },
      { name: "Gozitan Restaurant", country: "Malta" },
      { name: "L' Ostricaio Paceville, St. Julians", country: "Malta" },
      { name: "Dolce Sicilia Paceville", country: "Malta" },
      { name: "Bellavia Ristorante Italiano", country: "Malta" },
      { name: "Hammett's Mestizo", country: "Malta" },
      { name: "Lubelli", country: "Malta" },
      { name: "Paranga", country: "Malta" },
      { name: "Intercontinental Beach Bar", country: "Malta" },
      { name: "White Wine And Food", country: "Malta" },
      { name: "Open Waters", country: "Malta" },
      { name: "Hugo's Terrace & Rooftop", country: "Malta" },
      { name: "The Long Hall Irish Pub", country: "Malta" },
      { name: "Peppermint", country: "Malta" },
      { name: "Burgers.Ink", country: "Malta" },
      { name: "NOM NOM Paceville", country: "Malta" },
      { name: "Hot Shot Bar", country: "Malta" },
      { name: "Trattoria da Nennella", country: "Malta" },
      { name: "Cork's", country: "Malta" },
      { name: "Big G's Snack Bar", country: "Malta" },
      { name: "The Game & Ale Pub ( by Crust )", country: "Malta" },
      { name: "Wok to Walk", country: "Malta" },
      { name: "The Dubliner", country: "Malta" },
      { name: "The Crafty Cat Pub", country: "Malta" },
      { name: "City of London Bar", country: "Malta" },
      { name: "NAAR Restobar", country: "Malta" },
      { name: "U Bistrot", country: "Malta" },
      { name: "Barracuda Restaurant", country: "Malta" },
      { name: "Barracuda Rooftop Lounge", country: "Malta" },
      { name: "Era Ora Steakhouse", country: "Malta" },
      { name: "Piccolo Padre", country: "Malta" },
      { name: "Fresco's", country: "Malta" },
      { name: "Peppi's Restaurant", country: "Malta" },
      { name: "The Exiles Beach Club", country: "Malta" },
      { name: "Paradise Exiles", country: "Malta" },
      { name: "Little Argentina", country: "Malta" },
      { name: "Il-Gabbana", country: "Malta" },
      { name: "Ta' Kolina", country: "Malta" },
      { name: "LA LUZ", country: "Malta" },
      { name: "l-Fortizza", country: "Malta" },
      { name: "Mason's Cafe", country: "Malta" },
      { name: "The Road Devil Sea Front", country: "Malta" },
      { name: "The Compass Lounge", country: "Malta" },
      { name: "Lady Di", country: "Malta" },
      { name: "Tigne Beach Club", country: "Malta" },
      { name: "MedAsia Playa", country: "Malta" },
      { name: "1926 La Plage", country: "Malta" },
      { name: "Il Galeone", country: "Malta" },
      { name: "The Chapels Gastrobrewpub", country: "Malta" },
      { name: "King's Gate Gastropub", country: "Malta" },
      { name: "Jungle Joy Bar - Restaurant", country: "Malta" },
      { name: "Bus Stop Lounge", country: "Malta" },
      { name: "Gourmet Fish & Grill", country: "Malta" },
      { name: "Felice Brasserie", country: "Malta" },
      { name: "Aqualuna", country: "Malta" },
      { name: "Punto Bar & Dine", country: "Malta" },
      { name: "Black Gold Saloon", country: "Malta" },
      { name: "MedAsia Fusion Lounge", country: "Malta" },
      { name: "The Londoner Pub Sliema", country: "Malta" },
      { name: "The Brew Grill & Brewery", country: "Malta" },
      { name: "The Black Sheep drink and dine", country: "Malta" },
      { name: "Trattoria del Mare - Malta Restaurant", country: "Malta" },
      { name: "Tiffany's Bistro", country: "Malta" },
      { name: "Giorgio's", country: "Malta" },
      { name: "Lou's Bistro", country: "Malta" },
      { name: "Opa! Mediterranean Fusion", country: "Malta" },
      { name: "Port 21 Restaurant", country: "Malta" },
      { name: "The Black Pearl", country: "Malta" },
      { name: "Mamma Mia Restaurant", country: "Malta" },
      { name: "The Ordnance Pub & Restaurant", country: "Malta" },
      { name: "Piadina Caffe", country: "Malta" },
      { name: "The Capitol City Bar", country: "Malta" },
      { name: "Tico Tico", country: "Malta" },
      { name: "67 Kapitali", country: "Malta" },
      { name: "Wild Honey Beer House & Bistro", country: "Malta" },
      { name: "CUBA Restaurant, Shoreline Mall, Kalkara", country: "Malta" },

      // Rwanda bars
      { name: "AFTER PARTY BAR & GRILL", country: "Rwanda" },
      { name: "Agence Pub", country: "Rwanda" },
      { name: "ALEX COME AGAIN BAR KICUKIRO BRANCH", country: "Rwanda" },
      { name: "Amahumbezi Pub", country: "Rwanda" },
      { name: "Antonov Bar", country: "Rwanda" },
      { name: "Astro Bar & Restaurant", country: "Rwanda" },
      { name: "B Flex Bar", country: "Rwanda" },
      { name: "Bahamas Pub", country: "Rwanda" },
      { name: "Bar Dolce", country: "Rwanda" },
      { name: "Bar Filao", country: "Rwanda" },
      { name: "Bar Nyenyeri", country: "Rwanda" },
      { name: "Billy's Bistro & Bar", country: "Rwanda" },
      { name: "Blackstone Lounge Kigali", country: "Rwanda" },
      { name: "Bodega and Brew Kacyiru", country: "Rwanda" },
      { name: "Burrows Bar & Restaurant", country: "Rwanda" },
      { name: "Cafe Restaurant Olympiade", country: "Rwanda" },
      { name: "Carpe Diem Bistro", country: "Rwanda" },
      { name: "CARRINGTON Resto-Bar", country: "Rwanda" },
      { name: "Chez Guiness Bar", country: "Rwanda" },
      { name: "Chez John Restaurant", country: "Rwanda" },
      { name: "Chez Kiruhura", country: "Rwanda" },
      { name: "Cincinnati Bar & Grill", country: "Rwanda" },
      { name: "CKYC Lounge", country: "Rwanda" },
      { name: "Click Bar", country: "Rwanda" },
      { name: "Cocobean", country: "Rwanda" },
      { name: "Come Again Bar & Resto Giporoso", country: "Rwanda" },
      { name: "Come Again, Kicukiro", country: "Rwanda" },
      { name: "Continental restaurant", country: "Rwanda" },
      { name: "Copenhagen Lounge", country: "Rwanda" },
      { name: "CRYSTAL LOUNGE - Rooftop Restaurant & Bar", country: "Rwanda" },
      { name: "Déjà Vu", country: "Rwanda" },
      { name: "East 24 Bar & Grill", country: "Rwanda" },
      { name: "Emerald Cafe and Restaurant, Remera", country: "Rwanda" },
      { name: "Four Points by Sheraton Kigali", country: "Rwanda" },
      { name: "Gorillas Golf Hotel", country: "Rwanda" },
      { name: "Grand Legacy Hotel", country: "Rwanda" },
      { name: "Great Wall Chinese Restaurant", country: "Rwanda" },
      { name: "Green Corner", country: "Rwanda" },
      { name: "H2O Lounge", country: "Rwanda" },
      { name: "Happy Park", country: "Rwanda" },
      { name: "HAVANA BAR AND RESTO", country: "Rwanda" },
      { name: "Heroes Lounge", country: "Rwanda" },
      { name: "Hôtel Chez Lando", country: "Rwanda" },
      { name: "Hôtel des Mille Collines", country: "Rwanda" },
      { name: "Hotel Villa Portofino Kigali", country: "Rwanda" },
      { name: "HQ LOUNGE", country: "Rwanda" },
      { name: "Inzozi Africa House B&B", country: "Rwanda" },
      { name: "Jollof Kigali", country: "Rwanda" },
      { name: "Juru Garden Bar", country: "Rwanda" },
      { name: "Kari-Beau Restaurant", country: "Rwanda" },
      { name: "Kigali Diplomat Hotel", country: "Rwanda" },
      { name: "Kigali Marriott Hotel", country: "Rwanda" },
      { name: "Kigali Serena Hotel", country: "Rwanda" },
      { name: "Kigali Sport Bar", country: "Rwanda" },
      { name: "Kiruhura Disque Orange", country: "Rwanda" },
      { name: "La Sanitas", country: "Rwanda" },
      { name: "Lemigo Hotel", country: "Rwanda" },
      { name: "Maestro Kitchen", country: "Rwanda" },
      { name: "Maison Noire Bar & Restaurant", country: "Rwanda" },
      { name: "Maracana Rwanda", country: "Rwanda" },
      { name: "Meze Fresh", country: "Rwanda" },
      { name: "Missed Call Pub", country: "Rwanda" },
      { name: "Nobleza Hotel", country: "Rwanda" },
      { name: "Onomo Hotel", country: "Rwanda" },
      { name: "Oyster Bar & Grill", country: "Rwanda" },
      { name: "Paddock Bar", country: "Rwanda" },
      { name: "Park Inn by Radisson Kigali", country: "Rwanda" },
      { name: "Pili Pili", country: "Rwanda" },
      { name: "Plus 250", country: "Rwanda" },
      { name: "Quelque Part Resto Bar", country: "Rwanda" },
      { name: "RELAX BAR & GRILL", country: "Rwanda" },
      { name: "Repub Lounge", country: "Rwanda" },
      { name: "Resto-Bar Chez John Maradona", country: "Rwanda" },
      { name: "Riders Lounge Kigali", country: "Rwanda" },
      { name: "Rio de Gikondo Sport Bar & Accomodation", country: "Rwanda" },
      { name: "Roasters CHOMAZONE Restaurant", country: "Rwanda" },
      { name: "Rosty Club", country: "Rwanda" },
      { name: "Sky Lounge", country: "Rwanda" },
      { name: "Suka Bar & Café", country: "Rwanda" },
      { name: "Sundowner", country: "Rwanda" },
      { name: "Ten to Two Bar Resto", country: "Rwanda" },
      { name: "The B Lounge", country: "Rwanda" },
      { name: "THE BELLO RESTAURANT", country: "Rwanda" },
      { name: "The Green Lounge Bar & Restaurant", country: "Rwanda" },
      { name: "The Grid Kigali", country: "Rwanda" },
      { name: "The Manor Hotel", country: "Rwanda" },
      { name: "The SkySports Lounge", country: "Rwanda" },
      { name: "Torino Bar & Restaurant", country: "Rwanda" },
      { name: "Tropical Bar-Restaurant-Rounge", country: "Rwanda" },
      { name: "Ubumwe Grande Hotel", country: "Rwanda" },
      { name: "Uncles Restaurant", country: "Rwanda" },
      { name: "Urban by CityBlue, Kigali", country: "Rwanda" }
    ];

    console.log(`📋 Processing ${barsList.length} bars`)
    
    const results = []
    let successCount = 0
    let failCount = 0

    for (const barInfo of barsList) {
      console.log(`\n🔍 Processing: ${barInfo.name} (${barInfo.country})`)
      
      try {
        // Build search query with country
        const searchQuery = `${barInfo.name} ${barInfo.country === 'Malta' ? 'Malta' : 'Kigali Rwanda'}`
        const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        
        const searchResponse = await fetch(searchUrl)
        const searchData = await searchResponse.json()
        
        if (searchData.results && searchData.results.length > 0) {
          const place = searchData.results[0]
          console.log(`   ✅ Found: ${place.name} (${place.place_id})`)
          
          // Get detailed place information
          const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_address,formatted_phone_number,international_phone_number,rating,user_ratings_total,photos,geometry&key=${GOOGLE_MAPS_API_KEY}`
          const detailsResponse = await fetch(detailsUrl)
          const detailsData = await detailsResponse.json()
          
          if (detailsData.result) {
            const details = detailsData.result
            
            // Get photo URLs (all available photos)
            let photoUrls = []
            if (details.photos && details.photos.length > 0) {
              // Get all photos, not just the first one
              photoUrls = details.photos.slice(0, 5).map(photo => 
                `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo.photo_reference}&key=${GOOGLE_MAPS_API_KEY}`
              )
            }
            
            // Determine phone number with correct country code
            let phoneNumber = details.international_phone_number || details.formatted_phone_number
            if (phoneNumber && !phoneNumber.startsWith('+')) {
              // Add country code if missing
              const countryCode = barInfo.country === 'Malta' ? '+356' : '+250'
              phoneNumber = `${countryCode} ${phoneNumber}`
            }
            
            // Create bar record
            const barRecord = {
              name: details.name || barInfo.name,
              address: details.formatted_address || '',
              contact_number: phoneNumber || null,
              rating: details.rating || null,
              review_count: details.user_ratings_total || null,
              google_place_id: place.place_id,
              latitude: details.geometry?.location?.lat || null,
              longitude: details.geometry?.location?.lng || null,
              country: barInfo.country,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            
            // Insert into database
            const { error: insertError } = await supabaseClient
              .from('bars')
              .insert(barRecord)
            
            if (insertError) {
              console.log(`   ❌ Insert failed: ${insertError.message}`)
              failCount++
              results.push({
                bar: barInfo.name,
                country: barInfo.country,
                status: 'insert_failed',
                error: insertError.message
              })
            } else {
              console.log(`   ✅ SUCCESS: Inserted with ${photoUrls.length} photos`)
              successCount++
              results.push({
                bar: barInfo.name,
                country: barInfo.country,
                status: 'success',
                data: {
                  name: barRecord.name,
                  address: barRecord.address,
                  phone: barRecord.contact_number,
                  rating: barRecord.rating,
                  reviews: barRecord.review_count,
                  photos: photoUrls.length
                }
              })
            }
          } else {
            console.log(`   ❌ No details found`)
            failCount++
            results.push({
              bar: barInfo.name,
              country: barInfo.country,
              status: 'no_details'
            })
          }
        } else {
          console.log(`   ❌ Not found in Google Maps`)
          failCount++
          results.push({
            bar: barInfo.name,
            country: barInfo.country,
            status: 'not_found'
          })
        }
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`)
        failCount++
        results.push({
          bar: barInfo.name,
          country: barInfo.country,
          status: 'error',
          error: error.message
        })
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    console.log('\n📊 FINAL RESULTS:')
    console.log(`✅ Successfully processed: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log(`📈 Success rate: ${((successCount/(successCount+failCount))*100).toFixed(1)}%`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Maps data fetching completed',
        summary: {
          totalBars: barsList.length,
          successful: successCount,
          failed: failCount,
          successRate: ((successCount/(successCount+failCount))*100).toFixed(1)
        },
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ Critical error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 