
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

interface SearchRequest {
  query: string;
  vendorId: string;
  topK?: number;
  includeMetadata?: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Pinecone search request received');
    
    const { query, vendorId, topK = 5, includeMetadata = true }: SearchRequest = await req.json();
    
    console.log(`Searching for: "${query}" in vendor: ${vendorId}`);

    // Generate embedding for the search query using OpenAI
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: query,
      }),
    });

    if (!embeddingResponse.ok) {
      throw new Error(`OpenAI embedding error: ${embeddingResponse.statusText}`);
    }

    const embeddingData = await embeddingResponse.json();
    const queryVector = embeddingData.data[0].embedding;

    // Search Pinecone index
    const pineconeResponse = await fetch(`https://icupa-malta-index-f8a6aa5.svc.aped-4627-b74a.pinecone.io/query`, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: queryVector,
        topK: topK,
        includeMetadata: includeMetadata,
        filter: {
          vendor_id: vendorId
        }
      }),
    });

    if (!pineconeResponse.ok) {
      throw new Error(`Pinecone search error: ${pineconeResponse.statusText}`);
    }

    const pineconeData = await pineconeResponse.json();
    
    // Extract menu item IDs from Pinecone results
    const menuItemIds = pineconeData.matches?.map((match: any) => match.metadata?.menu_item_id).filter(Boolean) || [];
    
    let menuItems = [];
    
    if (menuItemIds.length > 0) {
      // Fetch full menu item details from Supabase
      const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .in('id', menuItemIds)
        .eq('available', true);

      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        menuItems = items || [];
      }
    }

    // Combine Pinecone scores with menu item data
    const enrichedResults = pineconeData.matches?.map((match: any) => {
      const menuItem = menuItems.find(item => item.id === match.metadata?.menu_item_id);
      return {
        score: match.score,
        menu_item: menuItem,
        vector_id: match.id,
        metadata: match.metadata
      };
    }).filter(result => result.menu_item) || [];

    // Log search activity
    await supabase
      .from('ai_waiter_logs')
      .insert({
        vendor_id: vendorId,
        guest_session_id: `search_${Date.now()}`,
        message_type: 'semantic_search',
        content: query,
        ai_model_used: 'pinecone+openai',
        suggestions: enrichedResults.slice(0, 3).map(r => r.menu_item),
        processing_metadata: {
          total_matches: pineconeData.matches?.length || 0,
          top_score: pineconeData.matches?.[0]?.score || 0,
          search_vector_dimension: queryVector.length
        }
      });

    console.log(`✅ Found ${enrichedResults.length} relevant items`);

    return new Response(
      JSON.stringify({
        success: true,
        query: query,
        results: enrichedResults,
        total_matches: pineconeData.matches?.length || 0,
        search_metadata: {
          vendor_id: vendorId,
          embedding_model: 'text-embedding-ada-002',
          vector_dimension: queryVector.length,
          search_timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in pinecone-search:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        fallback_message: "I'm having trouble searching right now. Could you try describing what you're looking for differently?"
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
