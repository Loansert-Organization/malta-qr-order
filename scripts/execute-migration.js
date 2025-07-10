import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  console.log('🔧 Analyzing current schema and preparing migration...');

  // Migration SQL commands that need to be executed
  const migrationSQL = [
    'ALTER TABLE users DROP COLUMN IF EXISTS revolut_link;',
    'ALTER TABLE users DROP COLUMN IF EXISTS logo_url;',
    'ALTER TABLE users DROP COLUMN IF EXISTS website_url;',
    'ALTER TABLE menu_items DROP COLUMN IF EXISTS description;',
    'ALTER TABLE menu_items DROP COLUMN IF EXISTS preparation_time;',
    'ALTER TABLE menu_items DROP COLUMN IF EXISTS rating;',
    'ALTER TABLE menu_items DROP COLUMN IF EXISTS popularity;'
  ];

  console.log('\n📋 Migration SQL to execute in Supabase Dashboard:');
  console.log('Go to: https://app.supabase.com/project/nireplgrlwhwppjtfxbb/sql/new');
  console.log('Then run the following SQL commands:\n');
  
  migrationSQL.forEach((sql, index) => {
    console.log(`${index + 1}. ${sql}`);
  });

  console.log('\n🔍 Checking current schema...');

  // Verify the changes by checking table structure
  console.log('\n🔍 Verifying changes...');
  const verificationResults = [];
  
  // Check users table
  try {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('Error checking users table:', usersError);
      verificationResults.push({ table: 'users', status: 'error', error: usersError.message });
    } else {
      const columns = Object.keys(usersData[0] || {});
      const deprecatedRemoved = !columns.includes('revolut_link') && !columns.includes('logo_url') && !columns.includes('website_url');
      console.log(`Users table columns: ${columns.join(', ')}`);
      console.log(`Deprecated fields removed: ${deprecatedRemoved ? '✅' : '❌'}`);
      verificationResults.push({ 
        table: 'users', 
        status: 'success', 
        columns: columns,
        deprecated_removed: deprecatedRemoved
      });
    }
  } catch (error) {
    console.error('Exception checking users table:', error);
    verificationResults.push({ table: 'users', status: 'exception', error: error.message });
  }

  // Check menu_items table
  try {
    const { data: menuData, error: menuError } = await supabase
      .from('menu_items')
      .select('*')
      .limit(1);
    
    if (menuError) {
      console.error('Error checking menu_items table:', menuError);
      verificationResults.push({ table: 'menu_items', status: 'error', error: menuError.message });
    } else {
      const columns = Object.keys(menuData[0] || {});
      const deprecatedRemoved = !columns.includes('description') && !columns.includes('preparation_time') && !columns.includes('rating') && !columns.includes('popularity');
      console.log(`Menu items table columns: ${columns.join(', ')}`);
      console.log(`Deprecated fields removed: ${deprecatedRemoved ? '✅' : '❌'}`);
      verificationResults.push({ 
        table: 'menu_items', 
        status: 'success', 
        columns: columns,
        deprecated_removed: deprecatedRemoved
      });
    }
  } catch (error) {
    console.error('Exception checking menu_items table:', error);
    verificationResults.push({ table: 'menu_items', status: 'exception', error: error.message });
  }

  console.log('\n📊 Current Schema Analysis:');
  console.log(JSON.stringify({
    verification: verificationResults
  }, null, 2));

  console.log('\n🎯 Next Steps:');
  console.log('1. Copy the SQL commands above');
  console.log('2. Go to your Supabase Dashboard SQL Editor');
  console.log('3. Paste and execute the SQL commands');
  console.log('4. Run this script again to verify the changes');
  
  const deprecatedFieldsExist = verificationResults.some(v => 
    v.status === 'success' && !v.deprecated_removed
  );
  
  if (deprecatedFieldsExist) {
    console.log('\n⚠️ Deprecated fields still exist - migration needed');
  } else {
    console.log('\n✅ All deprecated fields have been removed!');
  }
}

executeMigration().catch(console.error); 