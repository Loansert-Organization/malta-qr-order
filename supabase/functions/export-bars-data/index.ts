
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all bars data
    const { data: bars, error } = await supabaseClient
      .from('bars')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    // Convert to CSV format
    const headers = [
      'ID', 'Name', 'Address', 'Contact Number', 'Rating', 'Review Count', 
      'Google Place ID', 'Data Quality Score', 'Active', 'Created At', 'Updated At'
    ];
    
    const csvRows = [
      headers.join(','),
      ...bars.map(bar => [
        bar.id,
        `"${bar.name?.replace(/"/g, '""') || ''}"`,
        `"${bar.address?.replace(/"/g, '""') || ''}"`,
        `"${bar.contact_number?.replace(/"/g, '""') || ''}"`,
        bar.rating || '',
        bar.review_count || '',
        bar.google_place_id || '',
        bar.data_quality_score || 0,
        bar.is_active ? 'Yes' : 'No',
        new Date(bar.created_at).toISOString(),
        new Date(bar.updated_at).toISOString()
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    return new Response(
      JSON.stringify({ 
        success: true, 
        csv,
        total_records: bars.length,
        export_date: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in export-bars-data function:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
