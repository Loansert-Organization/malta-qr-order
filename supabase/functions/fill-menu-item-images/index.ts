import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'
import { generateFoodImagePrompt } from '../_shared/imagePrompter.ts'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
// Allow SERVICE_ROLE_KEY fallback because secrets cannot start with SUPABASE_
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY')!
const OPENAI_API_KEY  = Deno.env.get('OPENAI_API_KEY')!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Rate-limit: ~55 req/min
const RATE_DELAY = 1100 // ms
const MAX_RETRIES = 2
const DEFAULT_BATCH = 20

interface MenuItem {
  id: string
  bar_id: string
  name: string
  description: string | null
}

async function buildPrompt(item: MenuItem) {
  return await generateFoodImagePrompt(OPENAI_API_KEY, item.name, item.description ?? undefined)
}

async function generateImage(prompt: string): Promise<string> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          style: 'vivid'
        })
      })
      if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
      const json = await res.json()
      return json.data[0].url as string
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  throw new Error('Unreachable')
}

async function uploadToStorage(barId: string, itemId: string, imageUrl: string): Promise<string> {
  const download = await fetch(imageUrl)
  if (!download.ok) throw new Error('Failed to download generated image')
  const arrayBuffer = await download.arrayBuffer()
  const uint8 = new Uint8Array(arrayBuffer)
  const path = `bar_${barId}/item_${itemId}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('menu_photos')
    .upload(path, uint8, {
      contentType: 'image/jpeg',
      upsert: true
    })
  if (uploadError) throw new Error(`Storage upload error: ${uploadError.message}`)

  const { data: { publicUrl } } = supabase.storage.from('menu_photos').getPublicUrl(path)
  return publicUrl
}

async function saveImageUrl(itemId: string, url: string) {
  const { error } = await supabase
    .from('menu_items')
    .update({ image_url: url })
    .eq('id', itemId)
  if (error) throw new Error(`DB update error: ${error.message}`)
}

async function logError(itemId: string, reason: string) {
  await supabase.from('image_errors').insert({
    item_id: itemId,
    reason,
    timestamp: new Date().toISOString()
  })
}

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { batchSize } = await req.json().catch(() => ({ }))
    const limit = typeof batchSize === 'number' && batchSize > 0 ? batchSize : DEFAULT_BATCH

    // Fetch items with missing image_url
    const { data: items, error } = await supabase
      .from('menu_items')
      .select('id, bar_id, name, description')
      .is('image_url', null)
      .limit(limit)

    if (error) throw error
    if (!items || items.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: 'No items to process',
        processed: 0
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let generated = 0
    let failed = 0

    for (const item of items as MenuItem[]) {
      try {
        const prompt = await buildPrompt(item)
        const imgUrl = await generateImage(prompt)
        const publicUrl = await uploadToStorage(item.bar_id, item.id, imgUrl)
        await saveImageUrl(item.id, publicUrl)
        generated++
      } catch (err) {
        await logError(item.id, (err as Error).message)
        failed++
      }
      // rate-limit
      await new Promise((r) => setTimeout(r, RATE_DELAY))
    }

    return new Response(JSON.stringify({
      success: true,
      total_processed: items.length,
      generated,
      failed
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('Function error:', err)
    return new Response(JSON.stringify({ success: false, error: (err as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
}) 