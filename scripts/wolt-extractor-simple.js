import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabase = createClient(
  'https://nireplgrlwhwppjtfxbb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs'
);

// Malta bars list
const MALTA_BARS = [
  "Crafty cat", "Hoppy hare", "Rabbit hole", "The hatter", "Tortuga",
  "White tower lido", "Brigantine lounge bar", "Victoria bar", "Munchies franchise",
  "Agliolio", "Singita restaurant", "Gnejna kiosk", "Paparazzi restaurants",
  "Babel", "La bitters", "Cafe society", "Blu Beach Club", "kings pub",
  "Mina's", "Angela's Valletta", "Kaiseki", "White Bridge", "Suki Asian Snacks",
  "Focacceria Dal Pani", "La Sfoglia", "THE EVEREST /NEPALESE & INDIAN RE",
  "StrEat", "Soul Food", "MUŻA Restaurant", "La Pira Maltese Kitchen",
  "San Giovanni Valletta", "The Dragon Chinese restaurant", "AKI", "Paul's Bistro",
  "Zizka", "Beati Paoli Restaurant", "Osteria Tropea", "Mojitos Beach Terrace",
  "Ocean Basket", "Wok to Walk", "The Dubliner", "The Crafty Cat Pub",
  "Burgers.Ink", "Barracuda Restaurant", "The Black Pearl", "Mamma Mia Restaurant"
];

// Normalize text for better matching
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Calculate string similarity
function calculateSimilarity(str1, str2) {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);
  
  if (norm1 === norm2) return 1.0;
  
  // Simple similarity based on common words
  const words1 = norm1.split(' ');
  const words2 = norm2.split(' ');
  const commonWords = words1.filter(w => words2.includes(w)).length;
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords / totalWords;
}

// Fetch Wolt restaurants for Malta
async function fetchWoltRestaurants() {
  console.log('🔍 Fetching Wolt Malta restaurants...');
  
  try {
    // Wolt API endpoint for Malta (using Valletta coordinates)
    const response = await fetch('https://restaurant-api.wolt.com/v1/pages/restaurants?lat=35.8989&lon=14.5146');
    const data = await response.json();
    
    const restaurants = [];
    
    // Extract restaurants from the response
    if (data.sections) {
      for (const section of data.sections) {
        if (section.items) {
          for (const item of section.items) {
            if (item.venue) {
              restaurants.push({
                name: item.venue.name,
                slug: item.venue.slug,
                url: `https://wolt.com/mt/restaurant/${item.venue.slug}`
              });
            }
          }
        }
      }
    }
    
    console.log(`✅ Found ${restaurants.length} restaurants on Wolt Malta`);
    return restaurants;
  } catch (error) {
    console.error('❌ Error fetching Wolt restaurants:', error.message);
    return [];
  }
}

// Extract menu for a specific restaurant
async function extractMenuItems(slug) {
  try {
    const response = await fetch(`https://restaurant-api.wolt.com/v3/venues/slug/${slug}`);
    const data = await response.json();
    
    const menuItems = [];
    
    if (data.results && data.results[0]) {
      const venue = data.results[0];
      
      // Extract menu categories and items
      if (venue.menu_categories) {
        for (const category of venue.menu_categories) {
          for (const item of category.items || []) {
            menuItems.push({
              item_name: item.name,
              description: item.description || null,
              price: item.baseprice ? (item.baseprice / 100).toFixed(2) : 0,
              image_url: item.image || null,
              category: category.name || null,
              subcategory: null
            });
          }
        }
      }
    }
    
    return menuItems;
  } catch (error) {
    console.error(`❌ Error extracting menu:`, error.message);
    return [];
  }
}

// Main extraction process
async function extractWoltMenus() {
  console.log('🚀 Starting Wolt Malta menu extraction...');
  console.log(`📋 Processing ${MALTA_BARS.length} bars\n`);
  
  // Fetch all Wolt restaurants
  const woltRestaurants = await fetchWoltRestaurants();
  
  if (woltRestaurants.length === 0) {
    console.error('❌ No restaurants found on Wolt Malta');
    return;
  }
  
  const stats = {
    totalBars: MALTA_BARS.length,
    matchedBars: 0,
    unmatchedBars: 0,
    totalMenuItems: 0
  };
  
  const matchedDetails = [];
  const unmatchedDetails = [];
  
  // Process each bar
  for (const barName of MALTA_BARS) {
    console.log(`\n🔄 Processing: ${barName}`);
    
    // Find best match
    let bestMatch = null;
    let bestScore = 0;
    
    for (const woltRest of woltRestaurants) {
      const score = calculateSimilarity(barName, woltRest.name);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = woltRest;
      }
    }
    
    // If good match found (>70% similarity)
    if (bestScore >= 0.7 && bestMatch) {
      console.log(`  ✅ Matched: ${barName} → ${bestMatch.name} (${(bestScore * 100).toFixed(0)}% match)`);
      
      // Extract menu items
      const menuItems = await extractMenuItems(bestMatch.slug);
      
      if (menuItems.length > 0) {
        // Save to Supabase
        for (const item of menuItems) {
          const { error } = await supabase
            .from('restaurant_menus')
            .insert({
              bar_name: barName,
              matched_name: bestMatch.name,
              wolt_url: bestMatch.url,
              item_name: item.item_name,
              description: item.description,
              price: parseFloat(item.price),
              image_url: item.image_url,
              category: item.category,
              subcategory: item.subcategory
            });
          
          if (error) {
            console.error(`    ❌ Error saving item: ${error.message}`);
          }
        }
        
        stats.matchedBars++;
        stats.totalMenuItems += menuItems.length;
        matchedDetails.push({
          bar: barName,
          matched: bestMatch.name,
          items: menuItems.length,
          url: bestMatch.url
        });
        
        console.log(`  📋 Saved ${menuItems.length} menu items`);
      } else {
        console.log(`  ⚠️ No menu items found`);
        unmatchedDetails.push(barName);
      }
    } else {
      console.log(`  ❌ No match found`);
      stats.unmatchedBars++;
      unmatchedDetails.push(barName);
      
      // Save to unmatched_bars table
      await supabase
        .from('unmatched_bars')
        .insert({
          bar_name: barName,
          reason: 'No match found on Wolt',
          attempted_at: new Date().toISOString()
        });
    }
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 EXTRACTION COMPLETE');
  console.log('='.repeat(60));
  console.log(`Total bars processed: ${stats.totalBars}`);
  console.log(`Successfully matched: ${stats.matchedBars}`);
  console.log(`Unmatched bars: ${stats.unmatchedBars}`);
  console.log(`Total menu items extracted: ${stats.totalMenuItems}`);
  console.log(`Success rate: ${((stats.matchedBars / stats.totalBars) * 100).toFixed(1)}%`);
  
  if (matchedDetails.length > 0) {
    console.log('\n✅ MATCHED BARS:');
    matchedDetails.forEach(m => {
      console.log(`  - ${m.bar} → ${m.matched} (${m.items} items)`);
      console.log(`    URL: ${m.url}`);
    });
  }
  
  if (unmatchedDetails.length > 0) {
    console.log('\n❌ UNMATCHED BARS:');
    unmatchedDetails.forEach(bar => {
      console.log(`  - ${bar}`);
    });
  }
}

// Run the extraction
extractWoltMenus().catch(console.error); 