
import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { message, vendorSlug, guestSessionId } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get vendor and menu data
    const { data: vendor } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        menus!inner(
          id,
          menu_items(*)
        )
      `)
      .eq('slug', vendorSlug)
      .eq('menus.active', true)
      .single();

    if (!vendor) {
      throw new Error('Vendor not found');
    }

    const menuItems = vendor.menus[0]?.menu_items || [];
    
    // Use Pinecone for semantic search
    const searchResponse = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/pinecone-search`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          vendorId: vendor.id,
          topK: 3
        })
      }
    );

    let relevantItems = [];
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      relevantItems = searchData.matches || [];
    }

    // Generate AI response using OpenAI
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are Kai, the friendly AI waiter for ${vendor.name}. You help guests discover authentic Maltese cuisine and make personalized recommendations. 

Available menu items: ${JSON.stringify(menuItems)}
${relevantItems.length > 0 ? `Most relevant items for this query: ${JSON.stringify(relevantItems)}` : ''}

Respond naturally and suggest 1-3 specific menu items. Keep responses concise and friendly. Always mention prices in euros.`
          },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;

    // Extract suggested items based on AI response
    const suggestedItems = menuItems.filter(item => 
      aiResponse.toLowerCase().includes(item.name.toLowerCase()) ||
      relevantItems.some(rel => rel.id === item.id)
    ).slice(0, 3);

    // Log the interaction
    await supabase.from('ai_waiter_logs').insert({
      vendor_id: vendor.id,
      guest_session_id: guestSessionId,
      message_type: 'user',
      content: message
    });

    await supabase.from('ai_waiter_logs').insert({
      vendor_id: vendor.id,
      guest_session_id: guestSessionId,
      message_type: 'assistant',
      content: aiResponse,
      suggestions: suggestedItems
    });

    return new Response(
      JSON.stringify({
        response: aiResponse,
        suggestions: suggestedItems
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-waiter-chat:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
