import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔧 Executing schema cleanup migration...');

    // Migration SQL commands
    const migrationSQL = [
      'ALTER TABLE users DROP COLUMN IF EXISTS revolut_link;',
      'ALTER TABLE users DROP COLUMN IF EXISTS logo_url;',
      'ALTER TABLE users DROP COLUMN IF EXISTS website_url;',
      'ALTER TABLE menu_items DROP COLUMN IF EXISTS description;',
      'ALTER TABLE menu_items DROP COLUMN IF EXISTS preparation_time;',
      'ALTER TABLE menu_items DROP COLUMN IF EXISTS rating;',
      'ALTER TABLE menu_items DROP COLUMN IF EXISTS popularity;'
    ];

    const results = [];
    
    for (const [index, sql] of migrationSQL.entries()) {
      try {
        console.log(`Executing: ${sql}`);
        
        // Execute raw SQL using the service role client
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
        
        if (error) {
          console.error(`Error executing ${sql}:`, error);
          results.push({ 
            step: index + 1, 
            sql: sql,
            status: 'error', 
            error: error.message 
          });
        } else {
          results.push({ 
            step: index + 1, 
            sql: sql,
            status: 'success',
            data: data
          });
        }
      } catch (error) {
        console.error(`Exception executing ${sql}:`, error);
        results.push({ 
          step: index + 1, 
          sql: sql,
          status: 'exception', 
          error: error.message 
        });
      }
    }

    // Verify the changes by checking table structure
    const verificationResults = [];
    
    // Check users table
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (usersError) {
        verificationResults.push({ table: 'users', status: 'error', error: usersError.message });
      } else {
        const columns = Object.keys(usersData[0] || {});
        verificationResults.push({ 
          table: 'users', 
          status: 'success', 
          columns: columns,
          deprecated_removed: !columns.includes('revolut_link') && !columns.includes('logo_url') && !columns.includes('website_url')
        });
      }
    } catch (error) {
      verificationResults.push({ table: 'users', status: 'exception', error: error.message });
    }

    // Check menu_items table
    try {
      const { data: menuData, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .limit(1);
      
      if (menuError) {
        verificationResults.push({ table: 'menu_items', status: 'error', error: menuError.message });
      } else {
        const columns = Object.keys(menuData[0] || {});
        verificationResults.push({ 
          table: 'menu_items', 
          status: 'success', 
          columns: columns,
          deprecated_removed: !columns.includes('description') && !columns.includes('preparation_time') && !columns.includes('rating') && !columns.includes('popularity')
        });
      }
    } catch (error) {
      verificationResults.push({ table: 'menu_items', status: 'exception', error: error.message });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Schema cleanup migration executed',
      data: {
        migration_results: results,
        verification: verificationResults
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Migration execution error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 