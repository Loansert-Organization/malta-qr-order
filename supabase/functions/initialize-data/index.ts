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
    console.log('🚀 Initializing Malta QR Order database...');

    // Malta bars sample data
    const maltaBars = [
      {
        name: 'Trabuxu Bistro',
        address: 'Strait Street, Valletta, Malta',
        rating: 4.5,
        contact_number: '+356 2122 5000'
      },
      {
        name: 'Bridge Bar',
        address: 'Republic Street, Valletta, Malta',
        rating: 4.3,
        contact_number: '+356 2123 4567'
      },
      {
        name: 'Hugo\'s Lounge',
        address: 'Strand, Sliema, Malta',
        rating: 4.4,
        contact_number: '+356 2133 4455'
      },
      {
        name: 'Sky Club Malta',
        address: 'Portomaso Marina, St. Julian\'s, Malta',
        rating: 4.7,
        contact_number: '+356 2138 8899'
      },
      {
        name: 'Medina Restaurant & Bar',
        address: 'Holy Cross Street, Mdina, Malta',
        rating: 4.5,
        contact_number: '+356 2145 4004'
      }
    ];

    // Insert bars data
    const { data: barsData, error: barsError } = await supabase
      .from('bars')
      .upsert(maltaBars)
      .select();

    if (barsError) {
      console.error('Error inserting bars:', barsError);
    } else {
      console.log(`✅ Inserted ${barsData?.length || 0} bars`);
    }

    // Sample notifications
    const sampleNotifications = [
      {
        user_id: 'system',
        title: 'Welcome to Malta QR Order! 🎉',
        body: 'Your complete restaurant discovery and ordering platform is now ready.',
        type: 'system',
        status: 'pending'
      },
      {
        user_id: 'system',
        title: 'Malta Bars Loaded 🏝️',
        body: 'Discover amazing bars and restaurants across Malta!',
        type: 'promotion',
        status: 'pending'
      }
    ];

    // Insert notifications
    const { data: notifData, error: notifError } = await supabase
      .from('notifications')
      .upsert(sampleNotifications)
      .select();

    if (notifError) {
      console.error('Error inserting notifications:', notifError);
    } else {
      console.log(`✅ Inserted ${notifData?.length || 0} notifications`);
    }

    // Sample vendors
    const sampleVendors = [
      {
        name: 'Trabuxu Bistro',
        slug: 'trabuxu-bistro',
        location: 'Valletta',
        description: 'Wine bar and bistro in the heart of Valletta',
        active: true
      },
      {
        name: 'Hugo\'s Lounge',
        slug: 'hugos-lounge',
        location: 'Sliema',
        description: 'Seaside cocktails and dining experience',
        active: true
      }
    ];

    // Insert vendors
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .upsert(sampleVendors, { onConflict: 'slug' })
      .select();

    if (vendorError) {
      console.error('Error inserting vendors:', vendorError);
    } else {
      console.log(`✅ Inserted ${vendorData?.length || 0} vendors`);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Database initialization completed successfully',
      data: {
        bars: barsData?.length || 0,
        notifications: notifData?.length || 0,
        vendors: vendorData?.length || 0
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Initialization error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
