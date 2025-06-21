
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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get all menu items that don't have embeddings yet
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select(`
        *,
        menus!inner(vendor_id),
        pinecone_embeddings(id)
      `)
      .is('pinecone_embeddings.id', null);

    if (!menuItems || menuItems.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No new menu items to embed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const item of menuItems) {
      // Create embedding content
      const embeddingContent = `${item.name} - ${item.description || ''} - Category: ${item.category || 'General'} - Price: €${item.price}`;
      
      // Generate embedding using OpenAI
      const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: embeddingContent
        })
      });

      const embeddingData = await embeddingResponse.json();
      const vector = embeddingData.data[0].embedding;

      // Store in Pinecone
      const vectorId = `menu_item_${item.id}`;
      const pineconeResponse = await fetch(
        `https://my-openai-index-3hxtqs8.svc.us-east-1.pinecone.io/vectors/upsert`,
        {
          method: 'POST',
          headers: {
            'Api-Key': Deno.env.get('PINECONE_API_KEY'),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: [{
              id: vectorId,
              values: vector,
              metadata: {
                menu_item_id: item.id,
                vendor_id: item.menus.vendor_id,
                name: item.name,
                description: item.description,
                category: item.category,
                price: item.price
              }
            }]
          })
        }
      );

      if (pineconeResponse.ok) {
        // Store the embedding reference
        await supabase.from('pinecone_embeddings').insert({
          menu_item_id: item.id,
          vector_id: vectorId,
          embedding_content: embeddingContent
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully embedded ${menuItems.length} menu items`,
        embedded_count: menuItems.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in embed-menu-items:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
