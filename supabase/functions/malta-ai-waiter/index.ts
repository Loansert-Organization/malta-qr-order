
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const callOpenAI = async (messages: any[], model = 'gpt-4o') => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 400
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, vendorSlug, guestSessionId, language = 'en', locationContext } = await req.json();
    
    // Get vendor and menu data
    const { data: vendor } = await supabase
      .from('vendors')
      .select(`
        id,
        name,
        location,
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
    
    // Enhanced Malta-specific system prompts
    const systemPrompts = {
      en: `You are Kai, the AI waiter for ${vendor.name} in Malta. You are an expert in Maltese cuisine and hospitality.

Malta Context:
- Location: ${vendor.location || 'Malta'}
- Nearby popular spots: ${locationContext?.nearbyBars?.map(b => b.name).join(', ') || 'Various local favorites'}
- You understand Malta's unique dining culture, from traditional ftira to modern fusion

Your personality:
- Warm and welcoming like traditional Maltese hospitality
- Knowledgeable about local ingredients (ġbejna, bigilla, honey rings)
- Familiar with Malta's areas and their dining personalities
- Can suggest food pairings with local wines and Kinnie

Available menu: ${JSON.stringify(menuItems)}
Respond naturally and suggest 1-3 specific menu items with brief explanations.`,

      mt: `Int Kai, il-kellner AI għal ${vendor.name} f'Malta. Int espert fl-ikel Malti u l-ospitalità.

Kuntest ta' Malta:
- Post: ${vendor.location || 'Malta'}
- Postijiet popolari fil-qrib: ${locationContext?.nearbyBars?.map(b => b.name).join(', ') || 'Diversi favoriti lokali'}
- Tifhem il-kultura tal-ikel unika f'Malta, mill-ftira tradizzjonali sal-fusion modern

Il-personalità tiegħek:
- Sħun u ta' merħba bħal l-ospitalità Maltija tradizzjonali
- Taf dwar l-ingredjenti lokali (ġbejna, bigilla, qaghaq tal-ghasel)
- Taf bil-gzejjer ta' Malta u l-personalitajiet tal-ikel tagħhom
- Tista' tissuġġerixxi kombinazzjonijiet tal-ikel mal-inbid lokali u l-Kinnie

Menu disponibbli: ${JSON.stringify(menuItems)}
Wieġeb b'mod naturali u ssuġġerixxi 1-3 platti speċifiċi bil-ispjegazzjonijiet qosra.`,

      it: `Sei Kai, il cameriere AI per ${vendor.name} a Malta. Sei un esperto di cucina maltese e ospitalità.

Contesto maltese:
- Posizione: ${vendor.location || 'Malta'}
- Posti popolari nelle vicinanze: ${locationContext?.nearbyBars?.map(b => b.name).join(', ') || 'Vari favoriti locali'}
- Comprendi la cultura culinaria unica di Malta, dalla ftira tradizionale alla fusion moderna

La tua personalità:
- Caloroso e accogliente come la tradizionale ospitalità maltese
- Esperto di ingredienti locali (ġbejna, bigilla, anelli di miele)
- Familiare con le aree di Malta e le loro personalità culinarie
- Puoi suggerire abbinamenti con vini locali e Kinnie

Menu disponibile: ${JSON.stringify(menuItems)}
Rispondi naturalmente e suggerisci 1-3 piatti specifici con brevi spiegazioni.`
    };

    // Enhanced contextual prompt building
    let contextualInfo = `User message: ${message}`;
    
    if (locationContext?.vendorLocation) {
      contextualInfo += `\nLocation context: Currently in ${locationContext.vendorLocation}`;
    }
    
    if (locationContext?.nearbyBars?.length > 0) {
      contextualInfo += `\nNearby popular venues: ${locationContext.nearbyBars.map(b => `${b.name} (${b.rating?.toFixed(1)}★)`).join(', ')}`;
    }

    // Time-based recommendations
    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    contextualInfo += `\nTime context: ${timeContext}`;

    const gptMessages = [
      {
        role: 'system',
        content: systemPrompts[language as keyof typeof systemPrompts] || systemPrompts.en
      },
      { role: 'user', content: contextualInfo }
    ];

    const gptResponse = await callOpenAI(gptMessages, 'gpt-4o');

    // Extract suggested items
    const suggestedItems = menuItems.filter(item => {
      const itemMentioned = gptResponse.toLowerCase().includes(item.name.toLowerCase());
      return itemMentioned;
    }).slice(0, 3);

    // Enhanced layout suggestions based on Malta context
    const layoutSuggestions = {
      cardStyle: locationContext?.area === 'Valletta' ? 'vertical' : 'horizontal',
      highlight: timeContext === 'evening' ? 'popular' : 'price',
      animation: 'subtle',
      maltaTheme: true
    };

    // Log the interaction with enhanced metadata
    await supabase.from('ai_waiter_logs').insert({
      vendor_id: vendor.id,
      guest_session_id: guestSessionId,
      message_type: 'user',
      content: message,
      ai_model_used: 'malta-enhanced-gpt4o',
      processing_metadata: {
        language,
        location_context: locationContext,
        time_context: timeContext,
        nearby_venues: locationContext?.nearbyBars?.length || 0
      }
    });

    await supabase.from('ai_waiter_logs').insert({
      vendor_id: vendor.id,
      guest_session_id: guestSessionId,
      message_type: 'assistant',
      content: gptResponse,
      suggestions: suggestedItems,
      ai_model_used: 'malta-enhanced-gpt4o',
      processing_metadata: {
        language,
        malta_features: layoutSuggestions
      }
    });

    return new Response(
      JSON.stringify({
        response: gptResponse,
        suggestions: suggestedItems,
        layoutHints: layoutSuggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in malta-ai-waiter:', error);
    
    const fallbackMessages = {
      en: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment!",
      mt: "Skużani, għandi problema biex naqbad issa. Jekk jogħġbok ipprova mill-ġdid wara ftit!",
      it: "Mi dispiace, sto avendo problemi di connessione. Riprova tra un momento!"
    };
    
    const { language = 'en' } = await req.json().catch(() => ({}));
    
    return new Response(
      JSON.stringify({
        response: fallbackMessages[language as keyof typeof fallbackMessages] || fallbackMessages.en,
        suggestions: [],
        layoutHints: {}
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
