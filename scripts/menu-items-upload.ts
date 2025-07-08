import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

// Supabase configuration
const SUPABASE_URL = 'https://nireplgrlwhwppjtfxbb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pcmVwbGdybHdod3BwanRmeGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjYzMzMsImV4cCI6MjA2NjEwMjMzM30.nBdmNTrbS5CvEMV-2k-hkUbUA1NCsi4Xwt69kkrJnvs';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Interface for CSV row
interface CSVRow {
  id: string;
  menu_id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  available: string;
  popular: string;
  prep_time: string;
  created_at: string;
  updated_at: string;
  source_url: string;
  bar_id: string;
  subcategory: string;
  is_vegetarian: string;
  allergens: string;
  dietary_tags: string;
  category_id: string;
}

// Interface for processed menu item
interface ProcessedMenuItem {
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  subcategory: string | null;
  available: boolean;
  popular: boolean | null;
  prep_time: string | null;
  is_vegetarian: boolean | null;
  image_url: string | null;
  source_url: string | null;
  bar_id: string;
  menu_id: string;
  allergens: string[] | null;
  dietary_tags: string[] | null;
}

// Interface for upload result
interface UploadResult {
  total_processed: number;
  successful_inserts: number;
  failed_inserts: number;
  skipped_items: number;
  errors: string[];
  bars_affected: Set<string>;
}

// Function to find bar ID by the UUID in CSV
async function findBarByUUID(uuid: string): Promise<string | null> {
  try {
    // First, let's check if this UUID already exists in any table
    const { data: existingBars, error } = await supabase
      .from('bars')
      .select('id, name')
      .eq('id', uuid);
    
    if (error) {
      console.log(`Error checking for bar with UUID ${uuid}:`, error.message);
      return null;
    }
    
    if (existingBars && existingBars.length > 0) {
      return existingBars[0].id;
    }
    
    // If not found, we'll need to map these UUIDs to actual bars
    // For now, let's use the first available bar
    const { data: availableBars, error: barError } = await supabase
      .from('bars')
      .select('id, name')
      .limit(1);
    
    if (barError || !availableBars || availableBars.length === 0) {
      return null;
    }
    
    return availableBars[0].id;
  } catch (error) {
    console.error('Error finding bar:', error);
    return null;
  }
}

// Function to create or get menu for a bar
async function getOrCreateMenu(barId: string): Promise<string | null> {
  try {
    // First check if menu exists
    const { data: existingMenus, error: menuError } = await supabase
      .from('menus')
      .select('id')
      .eq('vendor_id', barId)
      .limit(1);
    
    if (menuError) {
      console.log('Error checking for existing menu:', menuError.message);
    }
    
    if (existingMenus && existingMenus.length > 0) {
      return existingMenus[0].id;
    }
    
    // Create vendor if not exists
    const { data: existingVendor, error: vendorCheckError } = await supabase
      .from('vendors')
      .select('id')
      .eq('id', barId)
      .limit(1);
    
    if (vendorCheckError) {
      console.log('Error checking vendor:', vendorCheckError.message);
    }
    
    if (!existingVendor || existingVendor.length === 0) {
      // Get bar name to create vendor
      const { data: barData, error: barError } = await supabase
        .from('bars')
        .select('name')
        .eq('id', barId)
        .single();
      
      if (barError || !barData) {
        console.log('Error getting bar data:', barError?.message);
        return null;
      }
      
      // Create vendor
      const { error: vendorError } = await supabase
        .from('vendors')
        .insert({
          id: barId,
          name: barData.name,
          business_name: barData.name,
          slug: barData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          is_active: true
        });
      
      if (vendorError) {
        console.log('Error creating vendor:', vendorError.message);
      }
    }
    
    // Create menu
    const { data: newMenu, error: createMenuError } = await supabase
      .from('menus')
      .insert({
        vendor_id: barId,
        name: 'Main Menu',
        active: true
      })
      .select('id')
      .single();
    
    if (createMenuError || !newMenu) {
      console.log('Error creating menu:', createMenuError?.message);
      return null;
    }
    
    return newMenu.id;
  } catch (error) {
    console.error('Error in getOrCreateMenu:', error);
    return null;
  }
}

// Function to process CSV row into menu item
function processCSVRow(row: CSVRow, barId: string, menuId: string): ProcessedMenuItem | null {
  try {
    // Skip rows with missing essential data
    if (!row.name || !row.price || row.name.trim() === '') {
      return null;
    }
    
    const price = parseFloat(row.price);
    if (isNaN(price)) {
      return null;
    }
    
    // Process dietary tags and allergens
    const dietaryTags = row.dietary_tags ? row.dietary_tags.split(',').map(tag => tag.trim()).filter(tag => tag) : null;
    const allergens = row.allergens ? row.allergens.split(',').map(allergen => allergen.trim()).filter(allergen => allergen) : null;
    
    return {
      name: row.name.trim(),
      description: row.description && row.description.trim() ? row.description.trim() : null,
      price: price,
      category: row.category && row.category.trim() ? row.category.trim() : null,
      subcategory: row.subcategory && row.subcategory.trim() ? row.subcategory.trim() : null,
      available: row.available ? row.available.toLowerCase() === 'true' : true,
      popular: row.popular ? row.popular.toLowerCase() === 'true' : null,
      prep_time: row.prep_time && row.prep_time.trim() ? row.prep_time.trim() : null,
      is_vegetarian: row.is_vegetarian ? row.is_vegetarian.toLowerCase() === 'true' : null,
      image_url: row.image_url && row.image_url.trim() ? row.image_url.trim() : null,
      source_url: row.source_url && row.source_url.trim() ? row.source_url.trim() : null,
      bar_id: barId,
      menu_id: menuId,
      allergens: allergens,
      dietary_tags: dietaryTags
    };
  } catch (error) {
    console.error('Error processing CSV row:', error);
    return null;
  }
}

// Function to upload menu items in batches
async function uploadMenuItems(menuItems: ProcessedMenuItem[]): Promise<UploadResult> {
  const result: UploadResult = {
    total_processed: 0,
    successful_inserts: 0,
    failed_inserts: 0,
    skipped_items: 0,
    errors: [],
    bars_affected: new Set()
  };
  
  const batchSize = 50;
  
  for (let i = 0; i < menuItems.length; i += batchSize) {
    const batch = menuItems.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert(batch)
        .select('id, bar_id');
      
      if (error) {
        console.error(`Batch ${i / batchSize + 1} error:`, error.message);
        result.errors.push(`Batch ${i / batchSize + 1}: ${error.message}`);
        result.failed_inserts += batch.length;
      } else {
        result.successful_inserts += batch.length;
        // Track affected bars
        batch.forEach(item => result.bars_affected.add(item.bar_id));
      }
      
      result.total_processed += batch.length;
      
      // Add delay between batches
      if (i + batchSize < menuItems.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
    } catch (error) {
      console.error(`Unexpected error in batch ${i / batchSize + 1}:`, error);
      result.errors.push(`Batch ${i / batchSize + 1}: Unexpected error`);
      result.failed_inserts += batch.length;
      result.total_processed += batch.length;
    }
    
    // Progress indicator
    console.log(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(menuItems.length / batchSize)}`);
  }
  
  return result;
}

// Main processing function
async function processMenuItemsCSV(): Promise<void> {
  console.log('🚀 Starting Menu Items Upload Process');
  console.log('=====================================');
  
  const csvPath = path.join(process.cwd(), 'Downloads/menu_items.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV file not found at: ${csvPath}`);
    return;
  }
  
  const menuItems: ProcessedMenuItem[] = [];
  const csvRows: CSVRow[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row: CSVRow) => {
        csvRows.push(row);
      })
      .on('end', async () => {
        console.log(`📋 Found ${csvRows.length} rows in CSV`);
        
        // Process each row
        for (let i = 0; i < csvRows.length; i++) {
          const row = csvRows[i];
          
          // Skip empty rows
          if (!row.id || !row.name || row.name.trim() === '') {
            continue;
          }
          
          // Find or map bar ID
          let barId = await findBarByUUID(row.id);
          if (!barId) {
            console.log(`⚠️  Could not find bar for UUID: ${row.id}, skipping item: ${row.name}`);
            continue;
          }
          
          // Get or create menu
          let menuId = await getOrCreateMenu(barId);
          if (!menuId) {
            console.log(`⚠️  Could not create menu for bar: ${barId}, skipping item: ${row.name}`);
            continue;
          }
          
          // Process the item
          const processedItem = processCSVRow(row, barId, menuId);
          if (processedItem) {
            menuItems.push(processedItem);
          }
          
          // Progress indicator
          if ((i + 1) % 100 === 0) {
            console.log(`Processed ${i + 1}/${csvRows.length} rows...`);
          }
        }
        
        console.log(`\n📊 Processed ${menuItems.length} valid menu items`);
        
        if (menuItems.length === 0) {
          console.log('❌ No valid menu items to upload');
          resolve();
          return;
        }
        
        // Upload to Supabase
        console.log('\n🔄 Uploading to Supabase...');
        const result = await uploadMenuItems(menuItems);
        
        // Generate report
        console.log('\n📊 UPLOAD REPORT');
        console.log('=================');
        console.log(`Total processed: ${result.total_processed}`);
        console.log(`✅ Successful inserts: ${result.successful_inserts}`);
        console.log(`❌ Failed inserts: ${result.failed_inserts}`);
        console.log(`⚠️  Skipped items: ${result.skipped_items}`);
        console.log(`🏢 Bars affected: ${result.bars_affected.size}`);
        console.log(`Success rate: ${((result.successful_inserts / result.total_processed) * 100).toFixed(1)}%`);
        
        if (result.errors.length > 0) {
          console.log('\n❌ ERRORS:');
          result.errors.forEach(error => console.log(`- ${error}`));
        }
        
        console.log('\n🎉 Menu items upload completed!');
        resolve();
      })
      .on('error', reject);
  });
}

// Run the script
processMenuItemsCSV().catch(console.error); 