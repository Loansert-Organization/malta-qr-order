
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const pineconeApiKey = Deno.env.get('PINECONE_API_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EmbedRequest {
  vendorId: string;
  menuItemIds?: string[];
  batchSize?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔄 Menu embedding request received');
    
    const { vendorId, menuItemIds, batchSize = 10 }: EmbedRequest = await req.json();
    
    console.log(`Embedding menu items for vendor: ${vendorId}`);

    // Fetch menu items to embed
    let query = supabase
      .from('menu_items')
      .select('id, name, description, category, price, dietary_tags, allergens')
      .eq('available', true);

    if (vendorId !== 'all') {
      query = query.eq('menu_id', vendorId);
    }

    if (menuItemIds && menuItemIds.length > 0) {
      query = query.in('id', menuItemIds);
    }

    const { data: menuItems, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching menu items: ${fetchError.message}`);
    }

    if (!menuItems || menuItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No menu items found to embed',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${menuItems.length} menu items`);

    const results = [];
    let processed = 0;
    let errors = 0;

    // Process items in batches
    for (let i = 0; i < menuItems.length; i += batchSize) {
      const batch = menuItems.slice(i, i + batchSize);
      
      try {
        // Prepare text content for embedding
        const textContents = batch.map(item => {
          const parts = [
            item.name,
            item.description || '',
            item.category || '',
            `Price: €${item.price}`,
            item.dietary_tags ? `Tags: ${item.dietary_tags.join(', ')}` : '',
            item.allergens ? `Allergens: ${item.allergens.join(', ')}` : ''
          ].filter(Boolean);
          
          return parts.join(' | ');
        });

        // Generate embeddings using OpenAI
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: textContents,
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI embedding error: ${embeddingResponse.statusText}`);
        }

        const embeddingData = await embeddingResponse.json();

        // Prepare vectors for Pinecone
        const vectors = batch.map((item, index) => ({
          id: `menu_item_${item.id}`,
          values: embeddingData.data[index].embedding,
          metadata: {
            menu_item_id: item.id,
            vendor_id: vendorId,
            name: item.name,
            category: item.category,
            price: item.price,
            embedding_content: textContents[index],
            created_at: new Date().toISOString()
          }
        }));

        // Upsert to Pinecone
        const pineconeResponse = await fetch(`https://icupa-malta-index-f8a6aa5.svc.aped-4627-b74a.pinecone.io/vectors/upsert`, {
          method: 'POST',
          headers: {
            'Api-Key': pineconeApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: vectors
          }),
        });

        if (!pineconeResponse.ok) {
          throw new Error(`Pinecone upsert error: ${pineconeResponse.statusText}`);
        }

        // Store embedding records in Supabase
        const embeddingRecords = vectors.map(vector => ({
          vector_id: vector.id,
          menu_item_id: vector.metadata.menu_item_id,
          embedding_content: vector.metadata.embedding_content
        }));

        const { error: insertError } = await supabase
          .from('pinecone_embeddings')
          .upsert(embeddingRecords);

        if (insertError) {
          console.error('Error storing embedding records:', insertError);
        }

        processed += batch.length;
        results.push({
          batch_index: Math.floor(i / batchSize) + 1,
          items_processed: batch.length,
          success: true
        });

        console.log(`✅ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(menuItems.length / batchSize)}`);

        // Small delay between batches to avoid rate limits
        if (i + batchSize < menuItems.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (batchError) {
        console.error(`❌ Error processing batch ${Math.floor(i / batchSize) + 1}:`, batchError);
        errors += batch.length;
        results.push({
          batch_index: Math.floor(i / batchSize) + 1,
          items_processed: batch.length,
          success: false,
          error: batchError.message
        });
      }
    }

    console.log(`✅ Embedding complete. Processed: ${processed}, Errors: ${errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        total_items: menuItems.length,
        processed: processed,
        errors: errors,
        batch_results: results,
        embedding_metadata: {
          model_used: 'text-embedding-ada-002',
          vector_dimension: 1536,
          pinecone_index: 'icupa-malta-index',
          processed_at: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in embed-menu-items:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        processed: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
