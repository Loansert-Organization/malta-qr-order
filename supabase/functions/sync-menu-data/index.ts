import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

// Type definitions
interface MenuItem {
  bar: string
  category: string
  subcategory: string
  item: string
  volume?: string
  price: number
  description?: string
}

interface ParsedMenuItem {
  bar: string
  category: string
  subcategory: string
  item: string
  volume: string
  price: number
  description: string
}

interface InsertionSummary {
  barsAdded: string[]
  itemsInserted: number
  errors: Array<{ item: string; error: string }>
}

// Parse the menu data from the provided text
function parseMenuData(rawData: string): ParsedMenuItem[] {
  const lines = rawData.trim().split('\n')
  const parsedItems: ParsedMenuItem[] = []

  for (const line of lines) {
    const parts = line.split('\t')
    if (parts.length < 6) continue

    const [bar, category, subcategory, item, volumeOrDesc, priceStr] = parts
    
    // Determine if the 5th column is volume or description
    const isVolume = /^\d+ml$|^\d+cl$|^\d+l$/i.test(volumeOrDesc)
    
    parsedItems.push({
      bar,
      category,
      subcategory,
      item,
      volume: isVolume ? volumeOrDesc : '',
      description: isVolume ? (parts[6] || '') : volumeOrDesc,
      price: parseFloat(priceStr) || parseFloat(parts[6]) || 0
    })
  }

  return parsedItems
}

// Function to handle duplicate items by updating instead of inserting
async function upsertMenuItems(
  supabase: any,
  menuData: ParsedMenuItem[]
): Promise<InsertionSummary> {
  const summary: InsertionSummary = {
    barsAdded: [],
    itemsInserted: 0,
    errors: []
  }

  // Group items by bar
  const itemsByBar = menuData.reduce((acc, item) => {
    if (!acc[item.bar]) {
      acc[item.bar] = []
    }
    acc[item.bar].push(item)
    return acc
  }, {} as Record<string, ParsedMenuItem[]>)

  for (const [barName, items] of Object.entries(itemsByBar)) {
    try {
      // Ensure bar exists
      const { data: bar, error: barError } = await supabase
        .from('bars')
        .upsert({ name: barName })
        .select('id')
        .single()

      if (barError || !bar) {
        summary.errors.push({ 
          item: barName, 
          error: `Failed to create/update bar: ${barError?.message || 'Unknown error'}` 
        })
        continue
      }

      if (!summary.barsAdded.includes(barName)) {
        summary.barsAdded.push(barName)
      }

      // Ensure menu exists
      const { data: menu, error: menuError } = await supabase
        .from('menus')
        .upsert({ 
          bar_id: bar.id, 
          name: 'Main Menu' 
        })
        .select('id')
        .single()

      if (menuError || !menu) {
        summary.errors.push({ 
          item: `${barName} Menu`, 
          error: `Failed to create/update menu: ${menuError?.message || 'Unknown error'}` 
        })
        continue
      }

      // Process items in batches
      const batchSize = 50
      const itemBatches = []
      
      for (let i = 0; i < items.length; i += batchSize) {
        itemBatches.push(items.slice(i, i + batchSize))
      }

      for (const batch of itemBatches) {
        const itemsToUpsert = batch.map(item => ({
          menu_id: menu.id,
          name: item.item,
          description: item.description || null,
          volume: item.volume || null,
          price: item.price,
          category: item.category,
          subcategory: item.subcategory
        }))

        const { error: batchError, data: insertedItems } = await supabase
          .from('menu_items')
          .upsert(itemsToUpsert, {
            onConflict: 'menu_id,name'
          })
          .select('id')

        if (batchError) {
          summary.errors.push({ 
            item: `${barName} items batch`, 
            error: `Failed to upsert items: ${batchError.message}` 
          })
        } else {
          summary.itemsInserted += insertedItems?.length || 0
        }
      }
    } catch (error) {
      summary.errors.push({ 
        item: barName, 
        error: `Unexpected error: ${error instanceof Error ? error.message : String(error)}` 
      })
    }
  }

  return summary
}

// Process JSON array of menu items
async function processMenuItemsArray(
  supabase: any,
  menuItems: MenuItem[]
): Promise<InsertionSummary> {
  const parsedItems: ParsedMenuItem[] = menuItems.map(item => ({
    bar: item.bar,
    category: item.category,
    subcategory: item.subcategory,
    item: item.item,
    volume: item.volume || '',
    price: item.price,
    description: item.description || ''
  }))
  
  return await upsertMenuItems(supabase, parsedItems)
}

// Main handler function
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the request body
    const requestData = await req.json()
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    let summary: InsertionSummary
    
    // Check if the input is raw text or JSON array
    if (requestData.rawMenuData && typeof requestData.rawMenuData === 'string') {
      const parsedData = parseMenuData(requestData.rawMenuData)
      summary = await upsertMenuItems(supabase, parsedData)
    } else if (Array.isArray(requestData.menuItems)) {
      summary = await processMenuItemsArray(supabase, requestData.menuItems)
    } else {
      throw new Error('Invalid input format. Provide either rawMenuData (string) or menuItems (array)')
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        summary 
      }), 
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Sync failed:', error)
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync menu data',
        details: error instanceof Error ? error.message : String(error)
      }), 
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
}) 