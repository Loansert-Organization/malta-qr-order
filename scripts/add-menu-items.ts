#!/usr/bin/env bun

/**
 * Script to bulk insert menu items from a tab-separated text block.
 *
 * Usage:
 *   bun run scripts/add-menu-items.ts
 *
 * Env vars required:
 *   SUPABASE_URL                – your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY   – service-role key with R/W access
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = process.env.SUPABASE_URL  || 'https://nireplgrlwhwppjtfxbb.supabase.co'
const SERVICE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_KEY) {
  console.error('❌  SUPABASE_SERVICE_ROLE_KEY missing')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const rawMenuItemsData = `
Okurama Asian Fusion	Food	CHEF'S SPECIALS	Red Curry Duck	 	14.5
Okurama Asian Fusion	Food	CHEF'S SPECIALS	Pad Kee Mao Duck	 	14
Okurama Asian Fusion	Food	CHEF'S SPECIALS	Hong Kong Duck (Half)	 	16.5
Okurama Asian Fusion	Food	CHEF'S SPECIALS	Hong Kong Duck (Whole)	 	29.5
Okurama Asian Fusion	Food	SUSHI NIGIRI	Avocado Nigiri		3.8
Okurama Asian Fusion	Food	SUSHI NIGIRI	Sweet Egg Nigiri		3.8
Okurama Asian Fusion	Food	SUSHI NIGIRI	Tofu Pocket Nigiri		3.8
Okurama Asian Fusion	Food	SUSHI NIGIRI	Salmon Nigiri		4.6
Okurama Asian Fusion	Food	SUSHI NIGIRI	Tuna Nigiri		4.8
Okurama Asian Fusion	Food	SUSHI NIGIRI	Prawn Nigiri		4.6
Okurama Asian Fusion	Food	SUSHI NIGIRI	Flame Seared Salmon Nigiri		4.6
Okurama Asian Fusion	Food	SUSHI NIGIRI	Eel Nigiri		5
Okurama Asian Fusion	Food	SUSHI NIGIRI	Beef Ribeye Nigiri		5.5
Okurama Asian Fusion	Food	SUSHI GUNKAN	Seaweed Gunkan		3.8
Okurama Asian Fusion	Food	SUSHI GUNKAN	Spicy Salmon Gunkun		4.6
Okurama Asian Fusion	Food	SUSHI GUNKAN	Spicy Tuna Gunkun		4.6
Okurama Asian Fusion	Food	SUSHI GUNKAN	Tobiko Gunkun		4.6
Okurama Asian Fusion	Food	SUSHI GUNKAN	Grilled Salmon & Philadelphia Gunkun		4.6
Okurama Asian Fusion	Food	SUSHI GUNKAN	Crab Stick & Mayo Gunkun		4.6
Okurama Asian Fusion	Food	HOSOMAKI	Avocado		4.3
Okurama Asian Fusion	Food	HOSOMAKI	Cucumber		4.3
Okurama Asian Fusion	Food	HOSOMAKI	Philadelphia Cheese		4.3
Okurama Asian Fusion	Food	HOSOMAKI	Salmon		5
Okurama Asian Fusion	Food	HOSOMAKI	Tuna		5
Okurama Asian Fusion	Food	HOSOMAKI	Crab Stick		5
Okurama Asian Fusion	Food	TEMAKI	Vegetarian	Lettuce, carrot, cucumber, avocado, garlic mayo	4.5
Okurama Asian Fusion	Food	TEMAKI	California	Crab stick, sweet egg, avocado, tobiko, mayo	5
Okurama Asian Fusion	Food	TEMAKI	Salmon & Cucumber	Salmon, cucumber, tobiko, garlic mayo	5
Okurama Asian Fusion	Food	TEMAKI	Tuna & Cucumber	Tuna, cucumber, green masago, garlic mayo	5
Okurama Asian Fusion	Food	TEMAKI	Teriyaki Chicken	Teriyaki chicken, cucumber, teriyaki sauce, sesame seeds	5
Okurama Asian Fusion	Food	TEMAKI	Prawn Tempura	Prawn tempura, avocado, teriyaki sauce, mayo	5
Okurama Asian Fusion	Food	SASHIMI	Salmon Sashimi		11.5
Okurama Asian Fusion	Food	SASHIMI	Tuna Sashimi		11.5
Okurama Asian Fusion	Food	SASHIMI	Mixed Sashimi (8 Pieces)		17
Okurama Asian Fusion	Food	SUSHI ROLLS	Chicken Katsu Roll (6 pcs)	Crispy chicken, cucumber, carrot, teriyaki sauce	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	Salmon Avocado Roll (6 pcs)	Salmon, avocado, lettuce	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	Vegetarian Roll (8 pcs)	Lettuce, cucumber, avocado, wakame, carrot, parsley flakes	9.5
Okurama Asian Fusion	Food	SUSHI ROLLS	Crunch Beef Roll (8 pcs)	Marinated beef, carrot, deep fried panko, crispy onions	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	Crispy Duck Roll (8 pcs)	Crispy duck, cucumber, carrot, peanut, spring onions, hoisin sauce	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	Prawn Tempura Roll (8 pcs)	Prawn tempura, cucumber, seaweed, egg flakes, teriyaki sauce	10.5
Okurama Asian Fusion	Food	SUSHI ROLLS	Grilled Salmon Roll (8 pcs)	Grilled salmon, avocado, carrot, sesame, teriyaki sauce	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	Grilled Tuna Roll (8 pcs)	Grilled tuna, cucumber, bell pepper, green masago	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	California Roll (8 pcs)	Crab stick, sweet egg, avocado, tobiko, mayo	9.95
Okurama Asian Fusion	Food	SUSHI ROLLS	Spicy Salmon Roll (8 pcs) 🌶️	Spicy salmon tartar, cucumber, avocado, chili flakes, spicy mayo	10.5
Okurama Asian Fusion	Food	SUSHI ROLLS	Spicy Tuna Roll (8 pcs) 🌶️	Spicy tuna tartar, cucumber, avocado, chili flakes, mayo	10.5
Okurama Asian Fusion	Food	FANCY ROLLS	Sun Rise	Crispy salmon skin, cucumber, avocado, crab stick, teriyaki sauce, peanut	11.5
Okurama Asian Fusion	Food	FANCY ROLLS	Crazy Salmon	Grilled salmon, avocado, bell pepper, fresh salmon, green masago, mayo	11.9
Okurama Asian Fusion	Food	FANCY ROLLS	Hot Night	Prawn tempura, cucumber, flame seared salmon, spicy salmon, spring onions, teriyaki sauce	11.9
Okurama Asian Fusion	Food	FANCY ROLLS	Red Monster	Crab stick, mayo, tobiko, avocado, cucumber, salmon, teriyaki sauce, spring onions	11.9
Okurama Asian Fusion	Food	FANCY ROLLS	Alaska Roll	Salmon, Philadelphia cheese, avocado, prawn, mayo, teriyaki sauce	11.9
Okurama Asian Fusion	Food	FANCY ROLLS	Tokyo Dragon	Salmon, boiled carrot, avocado, grilled eel, teriyaki sauce, spring onions	12.5
Okurama Asian Fusion	Food	FANCY ROLLS	Rainbow Roll	Prawn tempura, cucumber, topped with tuna, salmon, avocado	12.5
Okurama Asian Fusion	Food	SUSHI PLATTERS	Platter 1 (16 pcs)	Avocado nigiri, tofu pocket nigiri, tuna hosomaki, salmon Philadelphia roll, California roll	18
Okurama Asian Fusion	Food	SUSHI PLATTERS	Platter 2 (24 pcs)	Seared salmon nigiri, prawn nigiri, salmon hosomaki, spicy salmon roll, prawn tempura roll	28.5
Okurama Asian Fusion	Food	SUSHI PLATTERS	Platter 3 (30 pcs)	Salmon nigiri, tuna nigiri, Philadelphia hosomaki, chicken katsu roll, grilled tuna roll, hot night roll	36.5
Okurama Asian Fusion	Food	SUSHI PLATTERS	Platter 4 (34 pcs)	Seared salmon nigiri, tuna nigiri, prawn nigiri, ribeye nigiri, salmon hosomaki, grilled tuna roll, California roll, prawn tempura roll	42.5
Okurama Asian Fusion	Food	SUSHI PLATTERS	Platter 5 (48 pcs)	Various rolls, hosomaki, and nigiri selection	56.5
Okurama Asian Fusion	Food	SUSHI PLATTERS	Platter 6 (60 pcs)	Large variety of rolls, hosomaki, and nigiri	72
`

async function main() {
  console.log('Starting menu item import...');

  const barName = 'Okurama Asian Fusion';
  let barId: string | null = null;

  // 1. Find the bar ID
  const { data: bar, error: barError } = await supabase
    .from('bars')
    .select('id')
    .ilike('name', barName)
    .single();

  if (barError || !bar) {
    console.error(`❌ Error: Bar "${barName}" not found. Please add the bar to the 'bars' table first.`);
    process.exit(1);
  }
  barId = bar.id;
  console.log(`✅ Found bar "${barName}" with ID: ${barId}`);

  // 2. Parse the raw data
  const lines = rawMenuItemsData.trim().split('\n');
  let insertedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length < 5) {
      console.warn(`⚠️ Skipping malformed line: ${line}`);
      failedCount++;
      continue;
    }

    const [,
      itemType,
      category,
      name,
      descriptionOrEmpty,
      priceStr
    ] = parts.map(p => p.trim());

    const description = descriptionOrEmpty === '' ? null : descriptionOrEmpty;
    const price = parseFloat(priceStr);

    if (isNaN(price)) {
      console.warn(`⚠️ Skipping item "${name}" due to invalid price: ${priceStr}`);
      failedCount++;
      continue;
    }

    // Check if item already exists (based on bar_id, name, and category)
    const { data: existingItem, error: checkError } = await supabase
      .from('menu_items')
      .select('id')
      .eq('bar_id', barId)
      .ilike('name', name)
      .ilike('category', category)
      .single();

    if (existingItem) {
      console.log(`⏭️ Skipping existing item: ${name} (${category})`);
      skippedCount++;
      continue;
    }

    // 3. Insert the new item
    const { error: insertError } = await supabase
      .from('menu_items')
      .insert({
        bar_id: barId,
        name,
        description,
        price,
        category,
        type: itemType.toLowerCase(), // Assuming 'food' or 'drink'
        available: true, // Default to available
      });

    if (insertError) {
      console.error(`❌ Failed to insert ${name} (${category}):`, insertError.message);
      failedCount++;
    } else {
      console.log(`✅ Successfully inserted: ${name} (${category})`);
      insertedCount++;
    }
    await new Promise(resolve => setTimeout(resolve, 50)); // Small delay to avoid hammering DB
  }

  console.log('\n--- Import Summary ---');
  console.log(`Total lines processed: ${lines.length}`);
  console.log(`Successfully inserted: ${insertedCount}`);
  console.log(`Skipped (already exists): ${skippedCount}`);
  console.log(`Failed to process: ${failedCount}`);
}

main().catch((e) => {
  console.error('💥 Fatal error during import:', e);
  process.exit(1);
}); 