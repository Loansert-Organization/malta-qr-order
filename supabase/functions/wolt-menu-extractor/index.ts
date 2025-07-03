import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as cheerio from 'https://esm.sh/cheerio@1.0.0-rc.12'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { inputBars } = await req.json()
    
    if (!inputBars || !Array.isArray(inputBars)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: expected array of bar names' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`📋 Processing ${inputBars.length} bars...`)

    // Step 1: Fetch Wolt Malta restaurants
    const woltRestaurants = await fetchWoltRestaurants()
    console.log(`Found ${woltRestaurants.length} restaurants on Wolt Malta`)

    // Step 2: Match bars with fuzzy logic
    const matches = matchBarsWithWolt(inputBars, woltRestaurants)

    // Step 3: Process each match
    const stats = {
      totalBars: inputBars.length,
      matchedBars: 0,
      unmatchedBars: 0,
      totalMenuItems: 0,
      results: [] as any[]
    }

    for (const match of matches) {
      if (match.match_type === 'not_found') {
        stats.unmatchedBars++
        await saveUnmatchedBar(supabase, match.input_name, 'No match found on Wolt')
        stats.results.push({
          bar: match.input_name,
          status: 'not_found'
        })
        continue
      }

      // Extract menu items
      const menuItems = await extractMenuItems(match.wolt_url)
      
      if (menuItems.length > 0) {
        const saved = await saveMenuToSupabase(supabase, match, menuItems)
        if (saved) {
          stats.matchedBars++
          stats.totalMenuItems += menuItems.length
          stats.results.push({
            bar: match.input_name,
            status: 'matched',
            matched_name: match.matched_name,
            items: menuItems.length,
            url: match.wolt_url
          })
        }
      } else {
        stats.unmatchedBars++
        await saveUnmatchedBar(supabase, match.input_name, 'No menu items found')
        stats.results.push({
          bar: match.input_name,
          status: 'no_menu'
        })
      }
    }

    return new Response(
      JSON.stringify(stats),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Normalize text for matching
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Calculate string similarity
function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeText(str1)
  const norm2 = normalizeText(str2)
  
  if (norm1 === norm2) return 1.0
  
  // Levenshtein distance calculation
  const matrix: number[][] = []
  for (let i = 0; i <= norm2.length; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= norm1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= norm2.length; i++) {
    for (let j = 1; j <= norm1.length; j++) {
      if (norm2.charAt(i - 1) === norm1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  const distance = matrix[norm2.length][norm1.length]
  const maxLength = Math.max(norm1.length, norm2.length)
  return 1 - (distance / maxLength)
}

// Fetch Wolt restaurants
async function fetchWoltRestaurants() {
  try {
    // Fetch the discovery page
    const response = await fetch('https://restaurant-api.wolt.com/v1/pages/restaurants?lat=35.8989&lon=14.5146')
    const data = await response.json()
    
    const restaurants: any[] = []
    
    // Extract restaurants from Wolt's API response
    if (data.sections) {
      for (const section of data.sections) {
        if (section.items) {
          for (const item of section.items) {
            if (item.venue) {
              restaurants.push({
                name: item.venue.name,
                slug: item.venue.slug,
                url: `https://wolt.com/mt/restaurant/${item.venue.slug}`
              })
            }
          }
        }
      }
    }
    
    return restaurants
  } catch (error) {
    console.error('Error fetching Wolt restaurants:', error)
    return []
  }
}

// Match bars with Wolt restaurants
function matchBarsWithWolt(inputBars: string[], woltRestaurants: any[]) {
  const matches = []
  
  for (const inputBar of inputBars) {
    let bestMatch = null
    let bestScore = 0
    
    for (const woltRest of woltRestaurants) {
      const score = calculateSimilarity(inputBar, woltRest.name)
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = woltRest
      }
    }
    
    if (bestScore >= 0.85) {
      matches.push({
        input_name: inputBar,
        matched_name: bestMatch.name,
        wolt_url: bestMatch.url,
        match_score: bestScore,
        match_type: bestScore === 1.0 ? 'exact' : 'fuzzy'
      })
    } else {
      matches.push({
        input_name: inputBar,
        matched_name: '',
        wolt_url: '',
        match_score: 0,
        match_type: 'not_found'
      })
    }
  }
  
  return matches
}

// Extract menu items from restaurant page
async function extractMenuItems(restaurantUrl: string) {
  try {
    // Extract slug from URL
    const slug = restaurantUrl.split('/').pop()
    
    // Fetch menu data from Wolt API
    const response = await fetch(`https://restaurant-api.wolt.com/v3/venues/slug/${slug}`)
    const data = await response.json()
    
    const menuItems: any[] = []
    
    if (data.results && data.results[0]) {
      const venue = data.results[0]
      
      // Parse menu sections
      if (venue.menu && venue.menu.categories) {
        for (const category of venue.menu.categories) {
          for (const item of category.items || []) {
            menuItems.push({
              item_name: item.name,
              description: item.description || null,
              price: item.baseprice ? item.baseprice / 100 : 0,
              image_url: item.image || null,
              category: category.name || null,
              subcategory: null
            })
          }
        }
      }
    }
    
    return menuItems
  } catch (error) {
    console.error(`Error extracting menu from ${restaurantUrl}:`, error)
    return []
  }
}

// Save menu to Supabase
async function saveMenuToSupabase(supabase: any, match: any, menuItems: any[]) {
  try {
    const itemsToInsert = menuItems.map(item => ({
      bar_name: match.input_name,
      matched_name: match.matched_name,
      wolt_url: match.wolt_url,
      item_name: item.item_name,
      description: item.description,
      price: item.price,
      image_url: item.image_url,
      category: item.category,
      subcategory: item.subcategory
    }))
    
    const { error } = await supabase
      .from('restaurant_menus')
      .insert(itemsToInsert)
    
    if (error) {
      console.error('Error saving menu items:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error saving to Supabase:', error)
    return false
  }
}

// Save unmatched bar
async function saveUnmatchedBar(supabase: any, barName: string, reason: string) {
  try {
    await supabase
      .from('unmatched_bars')
      .insert({
        bar_name: barName,
        reason: reason,
        attempted_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error saving unmatched bar:', error)
  }
} 