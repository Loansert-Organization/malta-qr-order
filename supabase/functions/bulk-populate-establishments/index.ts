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
    console.log('🚀 Starting bulk establishment population...');

    let maltaCount = 0;
    let kigaliCount = 0;
    const errors: string[] = [];

    // Generate Malta establishments (200+)
    const maltaEstablishments = generateMaltaEstablishments();
    console.log(`Generated ${maltaEstablishments.length} Malta establishments`);

    for (const establishment of maltaEstablishments) {
      try {
        const { error } = await supabase
          .from('bars')
          .upsert({
            name: establishment.name,
            address: establishment.address,
            contact_number: establishment.phone,
            rating: establishment.rating,
            review_count: establishment.review_count,
            google_place_id: establishment.google_place_id,
            website_url: establishment.photo_url
          }, {
            onConflict: 'google_place_id',
            ignoreDuplicates: false
          });

        if (error) {
          errors.push(`Malta ${establishment.name}: ${error.message}`);
        } else {
          maltaCount++;
        }
      } catch (error) {
        errors.push(`Malta ${establishment.name}: ${error.message}`);
      }
    }

    // Generate Kigali establishments (100+)
    const kigaliEstablishments = generateKigaliEstablishments();
    console.log(`Generated ${kigaliEstablishments.length} Kigali establishments`);

    for (const establishment of kigaliEstablishments) {
      try {
        const { error } = await supabase
          .from('bars')
          .upsert({
            name: establishment.name,
            address: establishment.address,
            contact_number: establishment.phone,
            rating: establishment.rating,
            review_count: establishment.review_count,
            google_place_id: establishment.google_place_id,
            website_url: establishment.photo_url
          }, {
            onConflict: 'google_place_id',
            ignoreDuplicates: false
          });

        if (error) {
          errors.push(`Kigali ${establishment.name}: ${error.message}`);
        } else {
          kigaliCount++;
        }
      } catch (error) {
        errors.push(`Kigali ${establishment.name}: ${error.message}`);
      }
    }

    // Log the operation
    await supabase.from('system_logs').insert({
      log_type: 'bulk_population',
      component: 'edge_function',
      message: `Bulk populated ${maltaCount + kigaliCount} establishments`,
      severity: 'info',
      metadata: {
        malta_count: maltaCount,
        kigali_count: kigaliCount,
        total: maltaCount + kigaliCount,
        errors_count: errors.length
      }
    });

    return new Response(JSON.stringify({
      success: true,
      message: 'Bulk establishment population completed',
      data: {
        malta_establishments: maltaCount,
        kigali_establishments: kigaliCount,
        total_added: maltaCount + kigaliCount,
        errors: errors.slice(0, 10)
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('Bulk population error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});

function generateMaltaEstablishments() {
  const establishments = [];
  
  // Malta Cities with establishment counts to reach 200+
  const maltaCities = [
    { name: 'Valletta', lat: 35.8989, lng: 14.5145, count: 40 },
    { name: 'Sliema', lat: 35.9042, lng: 14.5019, count: 35 },
    { name: 'St. Julians', lat: 35.9170, lng: 14.4893, count: 35 },
    { name: 'Mdina', lat: 35.8859, lng: 14.4035, count: 20 },
    { name: 'Rabat', lat: 35.8817, lng: 14.3997, count: 15 },
    { name: 'Mosta', lat: 35.9091, lng: 14.4256, count: 15 },
    { name: 'Marsaxlokk', lat: 35.8420, lng: 14.5435, count: 15 },
    { name: 'Mellieha', lat: 35.9578, lng: 14.3622, count: 15 },
    { name: 'Qormi', lat: 35.8756, lng: 14.4714, count: 10 },
    { name: 'Birkirkara', lat: 35.8971, lng: 14.4611, count: 10 }
  ];

  const prefixes = ['Ta\'', 'Il-', 'Cafe', 'The', 'Restaurant', 'Bar', 'Bistro', 'Lounge'];
  const types = ['Restaurant', 'Bar', 'Cafe', 'Pub', 'Bistro', 'Lounge', 'Grill', 'Pizzeria'];

  maltaCities.forEach(city => {
    for (let i = 0; i < city.count; i++) {
      const prefix = prefixes[i % prefixes.length];
      const type = types[i % types.length];
      establishments.push({
        name: `${prefix} ${city.name} ${type} ${i + 1}`,
        address: `${i + 10} Main Street, ${city.name}, Malta`,
        latitude: city.lat + (Math.random() - 0.5) * 0.01,
        longitude: city.lng + (Math.random() - 0.5) * 0.01,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        review_count: Math.floor(Math.random() * 1000) + 50,
        google_place_id: `malta_${city.name.toLowerCase()}_${i}_${Date.now()}`,
        phone: `+356 21${Math.floor(Math.random() * 900000) + 100000}`,
        photo_url: `https://images.unsplash.com/photo-${1572116469696 + Math.floor(Math.random() * 1000)}-31de0f17cc34?w=400`
      });
    }
  });

  return establishments;
}

function generateKigaliEstablishments() {
  const establishments = [];
  
  // Kigali Districts with establishment counts to reach 100+
  const kigaliDistricts = [
    { name: 'CBD', lat: -1.9441, lng: 30.0619, count: 25 },
    { name: 'Kimihurura', lat: -1.9344, lng: 30.1067, count: 20 },
    { name: 'Remera', lat: -1.9123, lng: 30.1345, count: 15 },
    { name: 'Nyarutarama', lat: -1.9178, lng: 30.1234, count: 15 },
    { name: 'Kacyiru', lat: -1.9678, lng: 30.0789, count: 10 },
    { name: 'Gasabo', lat: -1.9234, lng: 30.1123, count: 10 },
    { name: 'Gikondo', lat: -1.9890, lng: 30.0345, count: 8 }
  ];

  const prefixes = ['Chez', 'Restaurant', 'Cafe', 'Bar', 'Lounge', 'Mama', 'Hotel'];
  const types = ['Restaurant', 'Bar', 'Cafe', 'Pub', 'Lounge', 'Grill', 'Bistro'];

  kigaliDistricts.forEach(district => {
    for (let i = 0; i < district.count; i++) {
      const prefix = prefixes[i % prefixes.length];
      const type = types[i % types.length];
      establishments.push({
        name: `${prefix} ${district.name} ${type} ${i + 1}`,
        address: `KG ${i + 10} Ave, ${district.name}, Kigali, Rwanda`,
        latitude: district.lat + (Math.random() - 0.5) * 0.01,
        longitude: district.lng + (Math.random() - 0.5) * 0.01,
        rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10,
        review_count: Math.floor(Math.random() * 800) + 30,
        google_place_id: `kigali_${district.name.toLowerCase()}_${i}_${Date.now()}`,
        phone: `+250 78${Math.floor(Math.random() * 9000000) + 1000000}`,
        photo_url: `https://images.unsplash.com/photo-${1414235077428 + Math.floor(Math.random() * 500)}-338989a2e8c0?w=400`
      });
    }
  });

  return establishments;
}
