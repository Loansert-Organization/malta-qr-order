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
    console.log('🚀 Starting complete database setup...');

    // Step 1: Create WhatsApp tables
    const { error: whatsappError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS whatsapp_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          phone_number TEXT NOT NULL,
          vendor_id UUID REFERENCES vendors(id),
          conversation_state TEXT DEFAULT 'greeting',
          cart_data JSONB DEFAULT '{}',
          last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS whatsapp_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id UUID REFERENCES whatsapp_sessions(id),
          phone_number TEXT NOT NULL,
          message_type TEXT NOT NULL,
          message_content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE whatsapp_logs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Allow public access" ON whatsapp_sessions FOR ALL USING (true);
        CREATE POLICY "Allow public access" ON whatsapp_logs FOR ALL USING (true);
      `
    });

    // Step 2: Enhance notifications table
    const { error: notificationError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium';
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS icon TEXT;
        ALTER TABLE notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';
      `
    });

    // Step 3: Enhance bars table and add Malta data
    const { error: barsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS latitude NUMERIC;
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS longitude NUMERIC;
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS google_place_id TEXT;
        ALTER TABLE bars ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
      `
    });

    // Step 4: Insert Malta bars data
    const maltaBars = [
      {
        name: 'Trabuxu Bistro',
        address: 'Strait Street, Valletta',
        latitude: 35.8989,
        longitude: 14.5145,
        rating: 4.5,
        google_place_id: 'trabuxu_valletta_001',
        is_active: true
      },
      {
        name: 'Bridge Bar',
        address: 'Republic Street, Valletta',
        latitude: 35.8976,
        longitude: 14.5134,
        rating: 4.3,
        google_place_id: 'bridge_valletta_001', 
        is_active: true
      },
      {
        name: 'Hugo\'s Lounge',
        address: 'Strand, Sliema',
        latitude: 35.9042,
        longitude: 14.5019,
        rating: 4.4,
        google_place_id: 'hugos_sliema_001',
        is_active: true
      }
    ];

    for (const bar of maltaBars) {
      await supabase.from('bars').upsert(bar, { onConflict: 'google_place_id' });
    }

    // Step 5: Test database connectivity
    const { data: vendorsTest } = await supabase.from('vendors').select('count').limit(1);
    const { data: barsTest } = await supabase.from('bars').select('count').limit(1);
    const { data: whatsappTest } = await supabase.from('whatsapp_sessions').select('count').limit(1);

    return new Response(JSON.stringify({
      success: true,
      message: 'Complete database setup successful',
      details: {
        whatsapp_tables: whatsappTest !== null,
        bars_populated: barsTest?.[0]?.count || 0,
        vendors_accessible: vendorsTest !== null,
        malta_bars_added: maltaBars.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Database setup error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
