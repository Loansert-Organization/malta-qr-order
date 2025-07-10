import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { corsHeaders } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiKey = Deno.env.get('OPENAI_API_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, sessionId, cartItems, queryType } = await req.json();
    
    console.log(`🤖 AI Sommelier request: ${queryType} for session: ${sessionId}`);

    // Get current menu context
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select(`
        id, name, price, category, available,
        menu_categories(name)
      `)
      .eq('available', true);

    // Get user's current cart context
    let cartContext = '';
    if (cartItems && cartItems.length > 0) {
      cartContext = `\nCurrent cart items: ${cartItems.map((item: any) => 
        `${item.name} (${item.qty}x)`
      ).join(', ')}`;
    }

    // Build menu context for AI
    const menuContext = menuItems?.map(item => 
      `${item.name} (${item.menu_categories?.name}) - ${item.price} RWF`
    ).join('\n') || 'No menu available';

    let aiResponse = '';

    if (openaiKey) {
      // Use OpenAI for intelligent responses
      const systemPrompt = `You are ICUPA's AI Sommelier, an expert food and drink pairing assistant for a restaurant in Rwanda. You help customers with:
- Food and drink pairings
- Allergen information and dietary accommodations
- Recommendations based on preferences
- Menu explanations and suggestions

Current menu:
${menuContext}
${cartContext}

Respond in a friendly, knowledgeable tone. Keep responses concise but helpful. If asked about allergens, advise customers to confirm with staff for safety.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 300,
          temperature: 0.7,
        }),
      });

      const aiData = await response.json();
      aiResponse = aiData.choices?.[0]?.message?.content || 'I apologize, but I\'m having trouble processing your request right now.';
    } else {
      // Fallback responses without OpenAI
      const fallbackResponses = {
        pairing: "For wine pairings, I'd recommend our house red with meat dishes and our crisp white with seafood. Our sommelier can provide more specific recommendations!",
        allergen: "For allergen information, please speak with our staff who can provide detailed ingredient lists. We take food allergies very seriously.",
        recommendation: "Based on our popular items, I'd suggest trying our chef's special or asking about today's featured dishes!",
        default: "I'm here to help with food pairings, allergen questions, and recommendations. What would you like to know about our menu?"
      };

      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('pair') || lowerMessage.includes('wine') || lowerMessage.includes('drink')) {
        aiResponse = fallbackResponses.pairing;
      } else if (lowerMessage.includes('allergen') || lowerMessage.includes('allergy') || lowerMessage.includes('gluten') || lowerMessage.includes('dairy')) {
        aiResponse = fallbackResponses.allergen;
      } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('popular')) {
        aiResponse = fallbackResponses.recommendation;
      } else {
        aiResponse = fallbackResponses.default;
      }
    }

    // Log the interaction
    await supabase.from('ai_chat_logs').insert({
      session_id: sessionId,
      user_message: message,
      ai_response: aiResponse,
      query_type: queryType,
      menu_context_items: menuItems?.length || 0,
      cart_items_count: cartItems?.length || 0
    });

    // Check if AI suggests creating a draft order
    let suggestedItems = [];
    if (aiResponse.includes('recommend') || aiResponse.includes('suggest')) {
      // Simple keyword matching to suggest menu items
      const responseWords = aiResponse.toLowerCase().split(' ');
      suggestedItems = menuItems?.filter(item => 
        responseWords.some(word => 
          item.name.toLowerCase().includes(word) || 
          (item.category && item.category.toLowerCase().includes(word))
        )
      ).slice(0, 3) || [];
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        response: aiResponse,
        suggestedItems,
        contextUsed: {
          menuItemsCount: menuItems?.length || 0,
          cartItemsCount: cartItems?.length || 0,
          queryType
        },
        meta: {
          respondedAt: new Date().toISOString(),
          modelUsed: openaiKey ? 'gpt-3.5-turbo' : 'fallback',
          sessionId
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });

  } catch (error) {
    console.error('AI Sommelier error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: {
        response: "I'm here to help with food and drink recommendations! Feel free to ask about pairings, allergens, or menu suggestions.",
        suggestedItems: []
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }
});
