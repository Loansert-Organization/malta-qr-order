
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, vendorId, topK = 5 } = await req.json();
    
    // Generate embedding for the query using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: query
      })
    });

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.data[0].embedding;

    // Search Pinecone
    const pineconeResponse = await fetch(
      `https://my-openai-index-3hxtqs8.svc.us-east-1.pinecone.io/query`,
      {
        method: 'POST',
        headers: {
          'Api-Key': Deno.env.get('PINECONE_API_KEY'),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vector: queryVector,
          topK: topK,
          includeMetadata: true,
          filter: {
            vendor_id: vendorId
          }
        })
      }
    );

    const pineconeData = await pineconeResponse.json();
    
    // Get the corresponding menu items from Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const menuItemIds = pineconeData.matches?.map(match => match.metadata?.menu_item_id).filter(Boolean) || [];
    
    let matches = [];
    if (menuItemIds.length > 0) {
      const { data: menuItems } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', menuItemIds);

      matches = menuItems || [];
    }

    return new Response(
      JSON.stringify({ matches }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in pinecone-search:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
