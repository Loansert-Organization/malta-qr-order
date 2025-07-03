#!/usr/bin/env bun

/**
 * Fill missing menu-item images for ICUPA bars & restaurants.
 *
 * Usage:
 *   bun run scripts/fill-missing-menu-images.ts [--dry]
 *
 * Env vars required:
 *   SUPABASE_URL                – your Supabase project URL (defaults to hard-coded project)
 *   SUPABASE_SERVICE_ROLE_KEY   – service-role key with R/W access
 *   OPENAI_API_KEY              – key with image-generation access (GPT-4o / DALL·E-3)
 */

import { createClient } from '@supabase/supabase-js'
import path from 'path'
import { fileURLToPath } from 'url'
import { generateFoodImagePrompt } from '../supabase/functions/_shared/imagePrompter.ts'

const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://nireplgrlwhwppjtfxbb.supabase.co'
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const OPENAI_KEY    = process.env.OPENAI_API_KEY || ''

if (!SERVICE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY missing')
  process.exit(1)
}
if (!OPENAI_KEY) {
  console.error('❌  OPENAI_API_KEY missing')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)
const RATE_LIMIT_DELAY = 1100 // ms (≈ 55 req / min)
const MAX_RETRIES = 2

interface MenuItem {
  id: string
  bar_id: string
  name: string
  description: string | null
}

async function fetchItemsWithoutImages(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, bar_id, name, description')
    .is('image_url', null)

  if (error) throw error
  return data as MenuItem[]
}

async function buildPrompt(item: MenuItem): Promise<string> {
  return await generateFoodImagePrompt(OPENAI_KEY, item.name, item.description ?? undefined)
}

async function generateImage(prompt: string): Promise<string> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3', // GPT-4o image generation defaults to DALL·E-3 backend
          prompt,
          n: 1,
          size: '1024x1024'
        })
      })

      if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`)
      const json = await res.json()
      return json.data[0].url as string
    } catch (err) {
      if (attempt === MAX_RETRIES) throw err
      console.warn(`🔄  Retry image generation (${attempt + 1}/${MAX_RETRIES})…`, err.message)
      await Bun.sleep(2000)
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

  const { error } = await supabase.storage
    .from('menu_photos')
    .upload(path, uint8, { contentType: 'image/jpeg', upsert: true })

  if (error) throw new Error(`Storage upload error: ${error.message}`)

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

async function main() {
  const items = await fetchItemsWithoutImages()
  console.log(`Found ${items.length} menu items without images\n`)

  let generated = 0
  let failed = 0

  for (const item of items) {
    console.log(`📋  Processing ${item.name} (id: ${item.id})`)
    const prompt = await buildPrompt(item)

    try {
      const imgUrl = await generateImage(prompt)
      const publicUrl = await uploadToStorage(item.bar_id, item.id, imgUrl)
      await saveImageUrl(item.id, publicUrl)
      console.log('✅  Image generated & saved')
      generated++
    } catch (err) {
      console.error('❌ ', err.message)
      await logError(item.id, err.message)
      failed++
    }

    await Bun.sleep(RATE_LIMIT_DELAY)
  }

  const summary = {
    total_processed: items.length,
    generated,
    failed
  }
  console.log('\n📊 Summary:', JSON.stringify(summary, null, 2))
}

main().catch((e) => {
  console.error('Fatal error:', e)
  process.exit(1)
}) 