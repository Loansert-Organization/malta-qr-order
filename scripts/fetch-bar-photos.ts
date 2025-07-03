#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nireplgrlwhwppjtfxbb.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function fetchPhotosForBar(barId: string) {
  try {
    console.log(`🔍 Fetching photos for bar ID: ${barId}`);
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/fetch-bar-photos`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ barId })
    });

    const result = await response.json();
    console.log('Result:', result);
    
    return result;
  } catch (error) {
    console.error('Error:', error);
    return { error: error.message };
  }
}

async function fetchPhotosForAllBarsWithoutPhotos() {
  try {
    console.log('🔍 Finding bars without photos...\n');
    
    const { data: bars, error } = await supabase
      .from('bars')
      .select('id, name, has_photos')
      .or('has_photos.is.null,has_photos.eq.false')
      .order('name');

    if (error) throw error;

    if (!bars || bars.length === 0) {
      console.log('✅ All bars have photos!');
      return;
    }

    console.log(`Found ${bars.length} bars without photos:\n`);
    
    for (const bar of bars) {
      console.log(`\n📸 Processing: ${bar.name} (ID: ${bar.id})`);
      const result = await fetchPhotosForBar(bar.id);
      
      if (result.status === 'done') {
        console.log(`✅ Successfully uploaded ${result.uploaded} photos`);
      } else if (result.status === 'skipped') {
        console.log(`⏭️  Skipped: ${result.message}`);
      } else {
        console.log(`❌ Failed: ${result.message || result.error}`);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Photo fetching complete!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📸 Bar Photo Fetcher
Usage:
  bun run scripts/fetch-bar-photos.ts [barId]    # Fetch photos for specific bar
  bun run scripts/fetch-bar-photos.ts all        # Fetch photos for all bars without photos
  
Examples:
  bun run scripts/fetch-bar-photos.ts 123e4567-e89b-12d3-a456-426614174000
  bun run scripts/fetch-bar-photos.ts all
`);
} else if (args[0] === 'all') {
  fetchPhotosForAllBarsWithoutPhotos();
} else {
  fetchPhotosForBar(args[0]);
} 