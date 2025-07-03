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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Define menu categories
    const categories = [
      { name: 'Starters', display_order: 1 },
      { name: 'Mains', display_order: 2 },
      { name: 'Drinks', display_order: 3 },
      { name: 'Desserts', display_order: 4 },
      { name: 'Vegan', display_order: 5 },
      { name: 'Trending', display_order: 6 }
    ]

    // Check if categories already exist
    const { data: existingCategories, error: checkError } = await supabaseClient
      .from('menu_categories')
      .select('name')

    if (checkError) {
      console.error('Error checking existing categories:', checkError)
      return new Response(JSON.stringify({ error: checkError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const existingNames = existingCategories?.map(cat => cat.name) || []
    const newCategories = categories.filter(cat => !existingNames.includes(cat.name))

    if (newCategories.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'All categories already exist',
        existing_count: existingCategories?.length || 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Insert new categories
    const { data: insertedCategories, error: insertError } = await supabaseClient
      .from('menu_categories')
      .insert(newCategories)
      .select()

    if (insertError) {
      console.error('Error inserting categories:', insertError)
      return new Response(JSON.stringify({ error: insertError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: `Successfully created ${newCategories.length} menu categories`,
      categories_created: insertedCategories?.length || 0,
      existing_count: existingCategories?.length || 0,
      total_count: (existingCategories?.length || 0) + (insertedCategories?.length || 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
