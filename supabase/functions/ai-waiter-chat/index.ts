
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ChatRequest {
  message: string;
  vendorId: string;
  sessionId: string;
  conversationHistory?: any[];
  menuContext?: any[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🤖 AI Waiter Chat request received');
    
    const { message, vendorId, sessionId, conversationHistory = [], menuContext = [] }: ChatRequest = await req.json();
    
    console.log(`Processing message for vendor: ${vendorId}, session: ${sessionId}`);
    
    // Get vendor information
    const { data: vendor } = await supabase
      .from('vendors')
      .select('business_name, description, category')
      .eq('id', vendorId)
      .single();

    // Get menu items for context
    const { data: menuItems } = await supabase
      .from('menu_items')
      .select('*')
      .eq('menu_id', vendorId)
      .eq('available', true);

    // Prepare context for AI
    const systemPrompt = createSystemPrompt(vendor, menuItems || []);
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const aiData = await openaiResponse.json();
    const aiMessage = aiData.choices[0].message.content;

    // Extract menu item suggestions from the response
    const suggestions = extractMenuSuggestions(aiMessage, menuItems || []);

    // Log the interaction
    await supabase
      .from('ai_waiter_logs')
      .insert({
        vendor_id: vendorId,
        guest_session_id: sessionId,
        message_type: 'chat',
        content: message,
        ai_model_used: 'gpt-4o-mini',
        suggestions: suggestions,
        processing_metadata: {
          response_length: aiMessage.length,
          menu_items_in_context: menuItems?.length || 0
        }
      });

    // Update conversation in database
    await supabase
      .from('ai_conversations')
      .upsert({
        session_id: sessionId,
        vendor_id: vendorId,
        messages: [
          ...conversationHistory.slice(-20), // Keep last 20 messages
          { role: 'user', content: message, timestamp: new Date().toISOString() },
          { role: 'assistant', content: aiMessage, timestamp: new Date().toISOString() }
        ],
        context_data: {
          vendor_info: vendor,
          menu_items_count: menuItems?.length || 0
        }
      });

    console.log('✅ AI response generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        response: aiMessage,
        suggestions: suggestions,
        conversationId: sessionId,
        metadata: {
          model_used: 'gpt-4o-mini',
          response_time: Date.now(),
          suggestions_count: suggestions.length
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in ai-waiter-chat:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        response: "I'm sorry, I'm having trouble processing your request right now. Could you please try asking again?",
        error: error.message,
        fallback: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

function createSystemPrompt(vendor: any, menuItems: any[]): string {
  const businessName = vendor?.business_name || 'this restaurant';
  const businessType = vendor?.category || 'restaurant';
  
  return `You are an expert AI waiter for ${businessName}, a ${businessType} in Malta. You are knowledgeable, friendly, and helpful.

PERSONALITY:
- Warm, welcoming, and professional
- Knowledgeable about Maltese cuisine and culture
- Enthusiastic about the menu and restaurant
- Patient and attentive to customer needs
- Use emojis occasionally to be friendly

YOUR ROLE:
- Help customers find the perfect meal based on their preferences
- Provide detailed information about menu items
- Make personalized recommendations
- Answer questions about ingredients, allergens, and preparation
- Suggest complementary items (drinks with meals, etc.)
- Be aware of dietary restrictions and preferences

MENU CONTEXT:
${menuItems.length > 0 ? `Available menu items:
${menuItems.map(item => `- ${item.name}: €${item.price} (${item.category}) ${item.description || ''}`).join('\n')}` : 'Menu items are being loaded...'}

GUIDELINES:
- Always be helpful and informative
- If you don't know something specific, admit it honestly
- Suggest items that match the customer's stated preferences
- Mention prices when recommending items
- Ask follow-up questions to better understand preferences
- Keep responses concise but informative
- Focus on the available menu items
- If suggesting items, format them clearly with prices

MALTESE CONTEXT:
- Malta has a rich culinary tradition mixing Mediterranean influences
- Local specialties include ftira, pastizzi, rabbit stew, and kinnie
- The weather is generally warm, so fresh and light options are often popular
- Many customers appreciate local and traditional options

Remember: You're representing ${businessName} and should always maintain a positive, helpful attitude while providing excellent service.`;
}

function extractMenuSuggestions(aiResponse: string, menuItems: any[]): any[] {
  const suggestions: any[] = [];
  
  // Look for menu item names mentioned in the AI response
  menuItems.forEach(item => {
    const itemNameLower = item.name.toLowerCase();
    const responseLower = aiResponse.toLowerCase();
    
    if (responseLower.includes(itemNameLower)) {
      suggestions.push({
        id: item.id,
        name: item.name,
        price: item.price,
        category: item.category,
        description: item.description
      });
    }
  });
  
  // Limit to 3 suggestions to avoid overwhelming the user
  return suggestions.slice(0, 3);
}
