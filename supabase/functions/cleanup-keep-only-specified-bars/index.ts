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

    console.log('🧹 CLEANUP: Keeping only specified bars')
    console.log('========================================')

    // List of bars to KEEP (exactly as specified by user)
    const barsToKeep = [
      // Malta bars
      "Crafty cat", "Hoppy hare", "Rabbit hole", "The hatter", "Tortuga", "White tower lido",
      "Brigantine lounge bar", "Victoria bar", "Munchies franchise", "Agliolio", "Singita restaurant",
      "Singita Restaurant", "Gnejna kiosk", "Paparazzi restaurants", "Babel", "La bitters",
      "Cafe society", "Blu Beach Club", "kings pub", "Mina's", "Angela's Valletta",
      "Ħelu Manna Gluten Free Kafeterija Val", "Kaiseki", "White Bridge", "Suki Asian Snacks",
      "Focacceria Dal Pani", "La Sfoglia", "THE EVEREST /NEPALESE & INDIAN RE", "StrEat",
      "Soul Food", "MUŻA Restaurant", "La Pira Maltese Kitchen", "San Giovanni Valletta",
      "The Dragon Chinese restaurant", "AKI", "Paul's Bistro", "Zizka", "Beati Paoli Restaurant",
      "Osteria Tropea", "Mojitos Beach Terrace", "Piatto Nero Mediterranean Restaurant",
      "Victoria Bar", "Tanti Cafe Grill", "Vecchia Napoli Mellieha", "Munchies Mellieha Bay",
      "Sandy Waters", "Maxima Bar & Restaurant", "Ventuno Restaurant", "Great Dane Restaurant",
      "Salia Restaurant - Mellieha", "Jungle", "Tavio's Pepe Nero", "La Buona Trattoria del Nonno",
      "simenta restaurant", "Thalassalejn Boċċi Club", "LOA", "Ostrica", "The Sea Cloud I Cocktail & Wine Bar",
      "Xemxija Pitstop", "Shaukiwan", "Gandhi Tandoori", "Gourmet Bar & Grill", "Venus Restaurant Bugibba",
      "Malta Chocolate Factory", "Victoria Gastropub", "Bognor Bar & Restaurant", "Bayside Restaurant",
      "Vinnies", "Nine Lives", "The Watson's Pub & Diner", "9 Ball Cafe", "Woodhut Pub & Diner",
      "Ocean Basket", "Vecchia Napoli Qawra", "Seaside Kiosk", "Vecchia Napoli @ Salini Resort, Naxxar",
      "Giuseppi's Bar & Bistro", "Ivy House", "Sharma Ethnic Cuisines", "L'Aroma - Meltingpot",
      "The Bridge", "Le Bistro", "Caviar & Bull", "Don Royale", "Henry J. Bean's", "Acqua",
      "Tiffany Lounge Restaurant", "Marina Terrace", "Bayview Seafood House", "Gozitan Restaurant",
      "L' Ostricaio Paceville, St. Julians", "Dolce Sicilia Paceville", "Bellavia Ristorante Italiano",
      "Hammett's Mestizo", "Lubelli", "Paranga", "Intercontinental Beach Bar", "White Wine And Food",
      "Open Waters", "Hugo's Terrace & Rooftop", "The Long Hall Irish Pub", "Peppermint",
      "Burgers.Ink", "NOM NOM Paceville", "Hot Shot Bar", "Trattoria da Nennella", "Cork's",
      "Big G's Snack Bar", "The Game & Ale Pub ( by Crust )", "Wok to Walk", "The Dubliner",
      "The Crafty Cat Pub", "City of London Bar", "NAAR Restobar", "U Bistrot", "Barracuda Restaurant",
      "Barracuda Rooftop Lounge", "Era Ora Steakhouse", "Piccolo Padre", "Fresco's", "Peppi's Restaurant",
      "The Exiles Beach Club", "Paradise Exiles", "Little Argentina", "Il-Gabbana", "Ta' Kolina",
      "LA LUZ", "l-Fortizza", "Mason's Cafe", "The Road Devil Sea Front", "The Compass Lounge",
      "Lady Di", "Tigne Beach Club", "MedAsia Playa", "1926 La Plage", "Il Galeone",
      "The Chapels Gastrobrewpub", "King's Gate Gastropub", "Jungle Joy Bar - Restaurant", "Bus Stop Lounge",
      "Gourmet Fish & Grill", "Felice Brasserie", "Aqualuna", "Punto Bar & Dine", "Black Gold Saloon",
      "MedAsia Fusion Lounge", "The Londoner Pub Sliema", "The Brew Grill & Brewery",
      "The Black Sheep drink and dine", "Trattoria del Mare - Malta Restaurant", "Tiffany's Bistro",
      "Giorgio's", "Lou's Bistro", "Opa! Mediterranean Fusion", "Port 21 Restaurant", "The Black Pearl",
      "Mamma Mia Restaurant", "The Ordnance Pub & Restaurant", "Piadina Caffe", "The Capitol City Bar",
      "Tico Tico", "67 Kapitali", "Wild Honey Beer House & Bistro", "CUBA Restaurant, Shoreline Mall, Kalkara",

      // Rwanda bars
      "AFTER PARTY BAR & GRILL", "Agence Pub", "ALEX COME AGAIN BAR KICUKIRO BRANCH", "Amahumbezi Pub",
      "Antonov Bar", "Astro Bar & Restaurant", "B Flex Bar", "Bahamas Pub", "Bar Dolce", "Bar Filao",
      "Bar Nyenyeri", "Billy's Bistro & Bar", "Blackstone Lounge Kigali", "Bodega and Brew Kacyiru",
      "Burrows Bar & Restaurant", "Cafe Restaurant Olympiade", "Carpe Diem Bistro", "CARRINGTON Resto-Bar",
      "Chez Guiness Bar", "Chez John Restaurant", "Chez Kiruhura", "Cincinnati Bar & Grill", "CKYC Lounge",
      "Click Bar", "Cocobean", "Come Again Bar & Resto Giporoso", "Come Again, Kicukiro", "Continental restaurant",
      "Copenhagen Lounge", "CRYSTAL LOUNGE - Rooftop Restaurant & Bar", "Déjà Vu", "East 24 Bar & Grill",
      "Emerald Cafe and Restaurant, Remera", "Four Points by Sheraton Kigali", "Gorillas Golf Hotel",
      "Grand Legacy Hotel", "Great Wall Chinese Restaurant", "Green Corner", "H2O Lounge", "Happy Park",
      "HAVANA BAR AND RESTO", "Heroes Lounge", "Hôtel Chez Lando", "Hôtel des Mille Collines",
      "Hotel Villa Portofino Kigali", "HQ LOUNGE", "Inzozi Africa House B&B", "Jollof Kigali", "Juru Garden Bar",
      "Kari-Beau Restaurant", "Kigali Diplomat Hotel", "Kigali Marriott Hotel", "Kigali Serena Hotel",
      "Kigali Sport Bar", "Kiruhura Disque Orange", "La Sanitas", "Lemigo Hotel", "Maestro Kitchen",
      "Maison Noire Bar & Restaurant", "Maracana Rwanda", "Meze Fresh", "Missed Call Pub", "Nobleza Hotel",
      "Onomo Hotel", "Oyster Bar & Grill", "Paddock Bar", "Park Inn by Radisson Kigali", "Pili Pili",
      "Plus 250", "Quelque Part Resto Bar", "RELAX BAR & GRILL", "Repub Lounge", "Resto-Bar Chez John Maradona",
      "Riders Lounge Kigali", "Rio de Gikondo Sport Bar & Accomodation", "Roasters CHOMAZONE Restaurant",
      "Rosty Club", "Sky Lounge", "Suka Bar & Café", "Sundowner", "Ten to Two Bar Resto", "The B Lounge",
      "THE BELLO RESTAURANT", "The Green Lounge Bar & Restaurant", "The Grid Kigali", "The Manor Hotel",
      "The SkySports Lounge", "Torino Bar & Restaurant", "Tropical Bar-Restaurant-Rounge", "Ubumwe Grande Hotel",
      "Uncles Restaurant", "Urban by CityBlue, Kigali"
    ]

    console.log(`📋 Will keep ${barsToKeep.length} specified bars`)

    // Get all current bars
    const { data: allBars, error: fetchError } = await supabaseClient
      .from('bars')
      .select('id, name')

    if (fetchError) {
      console.error('❌ Error fetching bars:', fetchError)
      return new Response(JSON.stringify({ error: fetchError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`📊 Found ${allBars.length} total bars in database`)

    // Find bars to delete (not in the keep list)
    const barsToDelete = allBars.filter(bar => {
      // Check if this bar's name matches any in the keep list (case insensitive)
      const shouldKeep = barsToKeep.some(keepName => 
        keepName.toLowerCase().trim() === bar.name.toLowerCase().trim()
      )
      return !shouldKeep
    })

    console.log(`🗑️ Will delete ${barsToDelete.length} bars`)
    console.log(`✅ Will keep ${allBars.length - barsToDelete.length} bars`)

    // Delete bars not in the keep list
    let deletedCount = 0
    const deleteResults = []

    for (const bar of barsToDelete) {
      const { error: deleteError } = await supabaseClient
        .from('bars')
        .delete()
        .eq('id', bar.id)

      if (deleteError) {
        console.log(`❌ Failed to delete ${bar.name}: ${deleteError.message}`)
        deleteResults.push({
          name: bar.name,
          status: 'failed',
          error: deleteError.message
        })
      } else {
        console.log(`✅ Deleted: ${bar.name}`)
        deletedCount++
        deleteResults.push({
          name: bar.name,
          status: 'deleted'
        })
      }
    }

    // Verify remaining bars
    const { data: remainingBars, error: verifyError } = await supabaseClient
      .from('bars')
      .select('name')

    console.log('\n📊 CLEANUP RESULTS:')
    console.log(`🗑️ Deleted: ${deletedCount} bars`)
    console.log(`✅ Remaining: ${remainingBars?.length || 0} bars`)
    console.log(`📈 Success rate: ${((deletedCount/(deletedCount + deleteResults.filter(r => r.status === 'failed').length))*100).toFixed(1)}%`)

    if (remainingBars) {
      console.log('\n📋 REMAINING BARS:')
      remainingBars.forEach((bar, index) => {
        console.log(`${index + 1}. ${bar.name}`)
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Database cleanup completed',
        summary: {
          totalBarsOriginal: allBars.length,
          barsDeleted: deletedCount,
          barsRemaining: remainingBars?.length || 0,
          barsToKeepSpecified: barsToKeep.length
        },
        deleteResults,
        remainingBars: remainingBars?.map(b => b.name) || []
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