import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Types
interface MenuItemData {
  bar: string;
  category: string;
  subcategory: string;
  item: string;
  description?: string;
  volume?: string | null;
  price: number;
}

interface ImportSummary {
  barsCreated: number;
  menusCreated: number;
  itemsInserted: number;
  itemsUpdated: number;
  errors: Array<{ item: string; error: string }>;
  totalProcessed: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const { menuData } = await req.json()

    if (!menuData || !Array.isArray(menuData)) {
      return new Response(
        JSON.stringify({ error: 'Invalid menu data. Expected array of menu items.' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Starting import of ${menuData.length} menu items...`)

    const summary: ImportSummary = {
      barsCreated: 0,
      menusCreated: 0,
      itemsInserted: 0,
      itemsUpdated: 0,
      errors: [],
      totalProcessed: 0
    }

    // Group items by bar for efficient processing
    const itemsByBar = menuData.reduce((acc: Record<string, MenuItemData[]>, item) => {
      if (!acc[item.bar]) {
        acc[item.bar] = []
      }
      acc[item.bar].push(item)
      return acc
    }, {})

    console.log(`Processing ${Object.keys(itemsByBar).length} bars...`)

    // Process each bar
    for (const [barName, items] of Object.entries(itemsByBar)) {
      try {
        console.log(`Processing bar: ${barName}`)

        // 1. Ensure bar exists
        let barId: string
        const { data: existingBar, error: barCheckError } = await supabase
          .from('bars')
          .select('id')
          .eq('name', barName)
          .maybeSingle()

        if (barCheckError) {
          console.error(`Error checking bar ${barName}:`, barCheckError)
          summary.errors.push({ 
            item: barName, 
            error: `Failed to check bar: ${barCheckError.message}` 
          })
          continue
        }

        if (!existingBar) {
          // Create new bar
          const { data: newBar, error: barInsertError } = await supabase
            .from('bars')
            .insert({ 
              name: barName,
              has_menu: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single()

          if (barInsertError || !newBar) {
            console.error(`Failed to create bar ${barName}:`, barInsertError)
            summary.errors.push({ 
              item: barName, 
              error: `Failed to create bar: ${barInsertError?.message}` 
            })
            continue
          }

          barId = newBar.id
          summary.barsCreated++
          console.log(`Created new bar: ${barName} (${barId})`)
        } else {
          barId = existingBar.id
          console.log(`Using existing bar: ${barName} (${barId})`)
        }

        // 2. Ensure menu exists for this bar
        let menuId: string
        const { data: existingMenu, error: menuCheckError } = await supabase
          .from('menus')
          .select('id')
          .eq('vendor_id', barId)
          .eq('name', 'Main Menu')
          .maybeSingle()

        if (menuCheckError) {
          console.error(`Error checking menu for ${barName}:`, menuCheckError)
          summary.errors.push({ 
            item: `${barName} Menu`, 
            error: `Failed to check menu: ${menuCheckError.message}` 
          })
          continue
        }

        if (!existingMenu) {
          // Create new menu
          const { data: newMenu, error: menuInsertError } = await supabase
            .from('menus')
            .insert({ 
              vendor_id: barId,
              name: 'Main Menu',
              active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('id')
            .single()

          if (menuInsertError || !newMenu) {
            console.error(`Failed to create menu for ${barName}:`, menuInsertError)
            summary.errors.push({ 
              item: `${barName} Menu`, 
              error: `Failed to create menu: ${menuInsertError?.message}` 
            })
            continue
          }

          menuId = newMenu.id
          summary.menusCreated++
          console.log(`Created new menu for ${barName} (${menuId})`)
        } else {
          menuId = existingMenu.id
          console.log(`Using existing menu for ${barName} (${menuId})`)
        }

        // 3. Process menu items for this bar
        console.log(`Processing ${items.length} items for ${barName}...`)
        
        for (const item of items) {
          try {
            // Check if item already exists
            const { data: existingItem, error: itemCheckError } = await supabase
              .from('menu_items')
              .select('id')
              .eq('menu_id', menuId)
              .eq('name', item.item)
              .maybeSingle()

            if (itemCheckError) {
              console.error(`Error checking item ${item.item}:`, itemCheckError)
              summary.errors.push({ 
                item: `${item.bar} - ${item.item}`, 
                error: `Failed to check item: ${itemCheckError.message}` 
              })
              continue
            }

            const itemData = {
              menu_id: menuId,
              bar_id: barId,
              name: item.item,
              description: item.description || null,
              price: item.price,
              category: item.category,
              subcategory: item.subcategory,
              available: true,
              popular: false,
              image_url: null, // Will be populated by image generation
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            if (existingItem) {
              // Update existing item
              const { error: updateError } = await supabase
                .from('menu_items')
                .update({
                  description: item.description || null,
                  price: item.price,
                  category: item.category,
                  subcategory: item.subcategory,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingItem.id)

              if (updateError) {
                console.error(`Failed to update item ${item.item}:`, updateError)
                summary.errors.push({ 
                  item: `${item.bar} - ${item.item}`, 
                  error: `Failed to update: ${updateError.message}` 
                })
              } else {
                summary.itemsUpdated++
                console.log(`Updated: ${item.item}`)
              }
            } else {
              // Insert new item
              const { error: insertError } = await supabase
                .from('menu_items')
                .insert(itemData)

              if (insertError) {
                console.error(`Failed to insert item ${item.item}:`, insertError)
                summary.errors.push({ 
                  item: `${item.bar} - ${item.item}`, 
                  error: `Failed to insert: ${insertError.message}` 
                })
              } else {
                summary.itemsInserted++
                console.log(`Inserted: ${item.item}`)
              }
            }

            summary.totalProcessed++

          } catch (error) {
            console.error(`Unexpected error processing item ${item.item}:`, error)
            summary.errors.push({ 
              item: `${item.bar} - ${item.item}`, 
              error: `Unexpected error: ${error}` 
            })
          }
        }

      } catch (error) {
        console.error(`Unexpected error processing bar ${barName}:`, error)
        summary.errors.push({ 
          item: barName, 
          error: `Unexpected error: ${error}` 
        })
      }
    }

    // Log final summary
    console.log('\n=== IMPORT SUMMARY ===')
    console.log(`Bars created: ${summary.barsCreated}`)
    console.log(`Menus created: ${summary.menusCreated}`)
    console.log(`Items inserted: ${summary.itemsInserted}`)
    console.log(`Items updated: ${summary.itemsUpdated}`)
    console.log(`Total processed: ${summary.totalProcessed}`)
    console.log(`Errors: ${summary.errors.length}`)
    
    if (summary.errors.length > 0) {
      console.log('\nErrors:')
      summary.errors.forEach(error => {
        console.log(`  - ${error.item}: ${error.error}`)
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary,
        message: `Import completed. ${summary.itemsInserted} items inserted, ${summary.itemsUpdated} items updated.`
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Import failed:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to import menu data',
        details: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})