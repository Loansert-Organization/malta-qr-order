import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { menuItemId, itemName, itemDescription } = await req.json()

    if (!menuItemId || !itemName) {
      throw new Error('Menu item ID and name are required')
    }

    // Generate image using DALL-E 3
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: `Professional food photography of ${itemName}${itemDescription ? `: ${itemDescription}` : ''}. High-quality restaurant menu photo, appetizing presentation, natural lighting, shallow depth of field.`,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural'
      }),
    })

    if (!imageResponse.ok) {
      const error = await imageResponse.text()
      throw new Error(`OpenAI API error: ${error}`)
    }

    const imageData = await imageResponse.json()
    const imageUrl = imageData.data[0].url

    // Download the image
    const imageDownloadResponse = await fetch(imageUrl)
    if (!imageDownloadResponse.ok) {
      throw new Error('Failed to download generated image')
    }

    const imageBlob = await imageDownloadResponse.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const fileName = `${menuItemId}_${Date.now()}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('menu_images')
      .upload(fileName, uint8Array, {
        contentType: 'image/png',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('menu_images')
      .getPublicUrl(fileName)

    // Update menu item with new image URL
    const { error: updateError } = await supabase
      .from('menus')
      .update({ image_url: publicUrl })
      .eq('id', menuItemId)

    if (updateError) {
      throw new Error(`Database update error: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        message: 'Image generated and saved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error generating menu image:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
}) 