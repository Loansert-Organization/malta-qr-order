#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nireplgrlwhwppjtfxbb.supabase.co'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function fetchPhotosForBarByName(name: string) {
  // Look up bar id by name (case-insensitive)
  const { data: bar, error } = await supabase
    .from('bars')
    .select('id, name')
    .ilike('name', name)
    .single()

  if (error || !bar) {
    console.error(`🔎  Could not find bar "${name}":`, error?.message)
    return
  }

  console.log(`\n📌  Processing ${bar.name} (id: ${bar.id})`)

  const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-bar-photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ barId: bar.id }),
  })

  const result = await response.json()
  console.log('➡️  Result:', result)
}

async function main() {
  const targets = ['Zion Bar & Restaurant', 'Il-Fortizza']
  for (const name of targets) {
    await fetchPhotosForBarByName(name)
  }
}

main() 