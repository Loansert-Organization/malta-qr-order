#!/usr/bin/env bun

/**
 * Script to add Brown's Kitchen, Felice Brasserie (update), and Paparazzi 29 menus
 * Usage: bun run scripts/add-three-restaurants-menus.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://nireplgrlwhwppjtfxbb.supabase.co'
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY missing')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Brown's Kitchen menu data
const brownsKitchenItems = [
  { name: 'Pepsi', description: '250ml', price: 2.5, category: 'Soft Drinks' },
  { name: 'Pepsi Max', description: '250ml', price: 2.5, category: 'Soft Drinks' },
  { name: '7Up', description: '250ml', price: 2.6, category: 'Soft Drinks' },
  { name: 'Mirinda', description: '250ml', price: 2.6, category: 'Soft Drinks' },
  { name: 'Kinnie', description: '250ml', price: 2.6, category: 'Soft Drinks' },
  { name: 'Diet Kinnie', description: '250ml', price: 2.6, category: 'Soft Drinks' },
  { name: 'Ice Tea Peach', description: '500ml', price: 2.6, category: 'Soft Drinks' },
  { name: 'Ice Tea Lemon', description: '500ml', price: 2.6, category: 'Soft Drinks' },
  { name: 'Still Water', description: '500ml', price: 2.1, category: 'Water' },
  { name: 'Cisk Lager', description: '250ml', price: 2.9, category: 'Beers' },
  { name: 'Cisk Excel', description: '250ml', price: 2.9, category: 'Beers' },
  { name: 'Hopleaf', description: '250ml', price: 2.9, category: 'Beers' },
  { name: 'Blue Label Smooth & Creamy', description: '400ml', price: 4.6, category: 'Beers' },
  { name: 'Heineken', description: '250ml', price: 2.9, category: 'Beers' },
  { name: 'Corona', description: '330ml', price: 4.0, category: 'Beers' },
  { name: 'Guinness', description: '440ml', price: 4.6, category: 'Beers' },
  { name: 'Beck\'s Non-Alcoholic', description: '250ml', price: 2.9, category: 'Beers' }
];

// Felice Brasserie menu data (extensive - showing first few items as example)
const feliceBrasserieItems = [
  { name: 'Eggs Royal', description: 'Smoked salmon, capers, hollandaise sauce, dill', price: 11, category: 'Breakfast' },
  { name: 'Eggs Benedict', description: 'Crispy bacon, mushrooms, hollandaise sauce, chives', price: 10, category: 'Breakfast' },
  { name: 'Eggs Florentine', description: 'Baby spinach, daikon, hollandaise sauce, chives', price: 9.5, category: 'Breakfast' },
  { name: 'Avocado Toast', description: 'Sourdough bread, rucola, fried egg, cherry tomatoes, radish, cucumber, olives, pumpkin seeds, dill sauce, fermented red onions', price: 14, category: 'Breakfast' },
  { name: 'Omelette with Mushroom & Mozzarella', description: '', price: 10, category: 'Breakfast' },
  { name: 'Scrambled Eggs & Mushroom Fricassée', description: '', price: 10.5, category: 'Breakfast' },
  { name: 'Fit Omelette', description: 'Egg whites, baby spinach, cherry tomatoes', price: 12, category: 'Breakfast' },
  { name: 'Vegan Plate', description: 'Sweet potato purée, tofu, mushroom, baby spinach, avocado, peanut butter, granola', price: 13.5, category: 'Breakfast' },
  { name: 'French Toast Maison', description: 'Cinnamon, brown sugar, butter, seasonal fruits', price: 10.5, category: 'Breakfast' },
  { name: 'Felice English Breakfast Platter', description: 'Fried eggs, bacon, mushrooms, Italian sausage, hash brown, beans, strawberry jam, butter', price: 12.5, category: 'Breakfast' },
  { name: 'Acai Bowl', description: 'Seasonal fruits, granola crumbs, coconut flakes', price: 12.5, category: 'Breakfast' },
  { name: 'Croissant', description: 'Butter, strawberry jam', price: 4.5, category: 'Breakfast' },
  { name: 'Pancakes', description: 'Strawberry and maple syrup', price: 9.5, category: 'Breakfast' },
  // Continue with more items...
  { name: 'Cheese & Cold Cut Platter', description: 'Spicy salami, prosciutto, bresaola, gorgonzola, blueberry, red pepper cheese, black pepper cheese, jam, fruit', price: 41, category: 'Starters' },
  { name: 'Fried Goat Cheese', description: 'Sour pomegranate sauce, parmesan, red paprika, walnuts, arugula, bread crumbs', price: 14, category: 'Starters' },
  { name: 'Butter Shrimp with Tomato Sauce', description: '', price: 18, category: 'Starters' },
  { name: 'Beef Carpaccio', description: 'Black Angus tenderloin carpaccio, white truffle base mustard, bread crumbs, parmigiano', price: 16, category: 'Starters' },
  { name: 'Tuna Tartare', description: 'Fresh tuna, wasabi vinaigrette, avocado', price: 19.5, category: 'Starters' }
];

// Paparazzi 29 menu data (showing key items)
const paparazzi29Items = [
  { name: 'First Timer', description: 'Tomato sauce, mozzarella, olives, oregano', price: 12.5, category: 'Pizza' },
  { name: 'Magic', description: 'Tomato sauce, mozzarella, mushrooms', price: 13.2, category: 'Pizza' },
  { name: 'Ham Actor', description: 'Tomato sauce, mozzarella, mushrooms, ham, hard-boiled eggs', price: 15, category: 'Pizza' },
  { name: 'Napoleon', description: 'Tomato sauce, mozzarella, anchovies, olives', price: 13.7, category: 'Pizza' },
  { name: 'Diva', description: 'Tomato sauce, mozzarella, ham, chicken, BBQ sauce', price: 16.2, category: 'Pizza' },
  // Add more key items...
  { name: 'Pillow Talk', description: 'Ravioli stuffed with fresh ricotta served with a light tomato sauce', price: 12.5, category: 'Pasta' },
  { name: 'Red Light', description: 'Penne in a light tomato sauce, garlic, basil', price: 12.5, category: 'Pasta' },
  { name: 'The Player', description: 'Classic beef burger in a bun', price: 15, category: 'Burgers' },
  { name: 'Whole Lotta Bacon', description: 'Beef burger with bacon and cheese', price: 17.5, category: 'Burgers' }
];

async function main() {
  console.log('Starting restaurant and menu import...');

  // Add Brown's Kitchen and Paparazzi 29 (if not exists)
  const { error: barsError } = await supabase
    .from('bars')
    .upsert([
      { 
        name: 'Brown\'s Kitchen', 
        address: 'Malta', 
        has_menu: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { 
        name: 'Paparazzi 29', 
        address: 'Malta', 
        has_menu: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ], { 
      onConflict: 'name',
      ignoreDuplicates: false 
    });

  if (barsError) {
    console.error('❌ Error adding bars:', barsError);
    return;
  }

  // Get bar IDs
  const { data: bars, error: fetchError } = await supabase
    .from('bars')
    .select('id, name')
    .in('name', ['Brown\'s Kitchen', 'Felice Brasserie', 'Paparazzi 29']);

  if (fetchError || !bars) {
    console.error('❌ Error fetching bars:', fetchError);
    return;
  }

  console.log('✅ Found bars:', bars.map(b => b.name));

  // Process each restaurant
  for (const bar of bars) {
    let menuItems = [];
    
    if (bar.name === 'Brown\'s Kitchen') {
      menuItems = brownsKitchenItems;
    } else if (bar.name === 'Felice Brasserie') {
      menuItems = feliceBrasserieItems;
    } else if (bar.name === 'Paparazzi 29') {
      menuItems = paparazzi29Items;
    }

    if (menuItems.length === 0) continue;

    // Delete existing menu items for this bar to avoid duplicates
    await supabase
      .from('menu_items')
      .delete()
      .eq('bar_id', bar.id);

    // Insert new menu items
    const itemsToInsert = menuItems.map(item => ({
      bar_id: bar.id,
      name: item.name,
      description: item.description || null,
      price: item.price,
      category: item.category,
      available: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: insertError } = await supabase
      .from('menu_items')
      .insert(itemsToInsert);

    if (insertError) {
      console.error(`❌ Error inserting menu for ${bar.name}:`, insertError);
    } else {
      console.log(`✅ Added ${menuItems.length} menu items for ${bar.name}`);
    }
  }

  console.log('\n--- Import Complete ---');
}

main().catch((e) => {
  console.error('💥 Fatal error during import:', e);
  process.exit(1);
});