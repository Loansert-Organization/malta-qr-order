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
    console.log('🔧 Applying schema cleanup migration...');

    // Execute migration steps one by one
    const migrationSteps = [
      // Remove deprecated fields from users table (bars)
      `ALTER TABLE users DROP COLUMN IF EXISTS revolut_link;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS logo_url;`,
      `ALTER TABLE users DROP COLUMN IF EXISTS website_url;`,
      
      // Remove deprecated fields from menu_items table
      `ALTER TABLE menu_items DROP COLUMN IF EXISTS description;`,
      `ALTER TABLE menu_items DROP COLUMN IF EXISTS preparation_time;`,
      `ALTER TABLE menu_items DROP COLUMN IF EXISTS rating;`,
      `ALTER TABLE menu_items DROP COLUMN IF EXISTS popularity;`
    ];

    const results = [];
    
    for (const [index, sql] of migrationSteps.entries()) {
      try {
        console.log(`Executing step ${index + 1}: ${sql.substring(0, 50)}...`);
        
        // For DROP COLUMN operations, we'll use a different approach
        // since Supabase client doesn't support raw SQL
        if (sql.includes('DROP COLUMN')) {
          const tableName = sql.includes('users') ? 'users' : 'menu_items';
          const columnName = sql.match(/DROP COLUMN IF EXISTS (\w+)/)?.[1];
          
          if (columnName) {
            // Try to select the column to see if it exists
            const { error: testError } = await supabase
              .from(tableName)
              .select(columnName)
              .limit(1);
            
            if (testError && testError.message.includes('does not exist')) {
              results.push({ 
                step: index + 1, 
                action: `Column ${columnName} already removed from ${tableName}`, 
                status: 'skipped' 
              });
            } else {
              results.push({ 
                step: index + 1, 
                action: `Column ${columnName} exists in ${tableName} - needs manual removal`, 
                status: 'pending' 
              });
            }
          }
        } else {
          results.push({ step: index + 1, action: 'Unknown operation', status: 'skipped' });
        }
      } catch (error) {
        results.push({ 
          step: index + 1, 
          action: sql.substring(0, 50),
          status: 'error', 
          error: error.message 
        });
      }
    }

    // Get stats
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .limit(100);
    
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('id')
      .limit(100);

    return new Response(JSON.stringify({
      success: true,
      message: 'Schema cleanup migration analysis completed',
      data: {
        migration_steps: results,
        table_stats: {
          users: users?.length || 0,
          menu_items: menuItems?.length || 0
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Migration error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}); 