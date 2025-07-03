import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    console.log('🔧 SETTING UP BAR PHOTOS TABLE AND STORAGE')
    console.log('==========================================')

    // Create bar_photos table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS bar_photos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        bar_id UUID NOT NULL REFERENCES bars(id) ON DELETE CASCADE,
        original_url TEXT NOT NULL,
        supabase_url TEXT,
        enhanced_url TEXT,
        photo_reference TEXT,
        width INTEGER,
        height INTEGER,
        is_enhanced BOOLEAN DEFAULT false,
        processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: tableError } = await supabaseClient.rpc('exec_sql', {
      sql: createTableSQL
    })

    if (tableError) {
      console.error('❌ Error creating table:', tableError)
    } else {
      console.log('✅ bar_photos table created/verified')
    }

    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_bar_photos_bar_id ON bar_photos(bar_id);
      CREATE INDEX IF NOT EXISTS idx_bar_photos_status ON bar_photos(processing_status);
    `

    const { error: indexError } = await supabaseClient.rpc('exec_sql', {
      sql: indexesSQL
    })

    if (indexError) {
      console.error('❌ Error creating indexes:', indexError)
    } else {
      console.log('✅ Indexes created')
    }

    // Enable RLS
    const rlsSQL = `
      ALTER TABLE bar_photos ENABLE ROW LEVEL SECURITY;
    `

    const { error: rlsError } = await supabaseClient.rpc('exec_sql', {
      sql: rlsSQL
    })

    if (rlsError) {
      console.error('❌ Error enabling RLS:', rlsError)
    } else {
      console.log('✅ RLS enabled')
    }

    // Create RLS policy
    const policySQL = `
      CREATE POLICY IF NOT EXISTS "Allow public access to bar_photos" ON bar_photos FOR ALL USING (true);
    `

    const { error: policyError } = await supabaseClient.rpc('exec_sql', {
      sql: policySQL
    })

    if (policyError) {
      console.error('❌ Error creating policy:', policyError)
    } else {
      console.log('✅ RLS policy created')
    }

    // Create storage bucket
    const { error: bucketError } = await supabaseClient.storage
      .createBucket('bar_photos', { public: true })

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Error creating bucket:', bucketError)
    } else {
      console.log('✅ Storage bucket created/verified')
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Bar photos infrastructure setup completed',
        tableCreated: !tableError,
        indexesCreated: !indexError,
        rlsEnabled: !rlsError,
        policyCreated: !policyError,
        bucketCreated: !bucketError || bucketError.message.includes('already exists')
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )

  } catch (error) {
    console.error('❌ Critical error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}) 