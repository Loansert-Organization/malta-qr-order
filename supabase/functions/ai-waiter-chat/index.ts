
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AI Model Router - calls different models based on the task
const callOpenAI = async (messages: any[], model = 'gpt-4o') => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 300
    }),
  });
  
  const data = await response.json();
  return data.choices[0].message.content;
};

const callClaude = async (messages: any[]) => {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY'),
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      messages: messages.filter(m => m.role !== 'system'),
      system: messages.find(m => m.role === 'system')?.content || ''
    }),
  });
  
  const data = await response.json();
  return data.content[0].text;
};

const callGemini = async (prompt: string) => {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GOOGLE_AI_API_KEY')}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300
      }
    }),
  });
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
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
    let relevantItems = [];
    try {
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

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        relevantItems = searchData.matches || [];
      }
    } catch (error) {
      console.log('Pinecone search failed, using basic matching:', error);
    }

    // ICUPA Multi-AI Orchestration
    console.log('Starting ICUPA multi-AI orchestration...');

    // Step 1: GPT-4o as primary UX orchestrator for initial response
    const gptMessages = [
      {
        role: 'system',
        content: `You are Kai, the AI waiter for ${vendor.name} in Malta. Generate a helpful response and suggest specific menu items.

Available menu items: ${JSON.stringify(menuItems)}
${relevantItems.length > 0 ? `Most relevant items: ${JSON.stringify(relevantItems)}` : ''}

Respond naturally and suggest 1-3 specific menu items with brief explanations. Keep it concise and friendly.`
      },
      { role: 'user', content: message }
    ];

    const gptResponse = await callOpenAI(gptMessages, 'gpt-4o');
    console.log('GPT-4o response generated');

    // Step 2: Claude-4 as tone and style auditor
    let claudeResponse = gptResponse;
    try {
      const claudeMessages = [
        {
          role: 'system',
          content: `You are a UX tone and style auditor. Refine this AI waiter response to be more friendly, empathetic, and culturally appropriate for Malta. Make the language more inviting and warm while keeping the same recommendations. Add a touch of Maltese hospitality.`
        },
        { role: 'user', content: `Original response: ${gptResponse}` }
      ];

      claudeResponse = await callClaude(claudeMessages);
      console.log('Claude refined the response');
    } catch (error) {
      console.log('Claude refinement failed, using GPT response:', error);
    }

    // Step 3: Extract suggested items based on AI response
    const suggestedItems = menuItems.filter(item => {
      const itemMentioned = claudeResponse.toLowerCase().includes(item.name.toLowerCase());
      const itemRelevant = relevantItems.some(rel => rel.id === item.id);
      return itemMentioned || itemRelevant;
    }).slice(0, 3);

    // Step 4: Gemini for visual layout suggestions (stored as metadata)
    let layoutSuggestions = {};
    try {
      const geminiPrompt = `Based on this AI waiter conversation context, suggest UI layout improvements for the suggested menu items. Context: "${message}" | Response: "${claudeResponse}" | Suggested items: ${JSON.stringify(suggestedItems.map(i => i.name))}. Respond with JSON format: {"cardStyle": "horizontal/vertical", "highlight": "price/popular", "animation": "subtle/none"}`;
      
      const geminiResponse = await callGemini(geminiPrompt);
      try {
        layoutSuggestions = JSON.parse(geminiResponse);
      } catch {
        layoutSuggestions = { cardStyle: "horizontal", highlight: "popular", animation: "subtle" };
      }
      console.log('Gemini layout suggestions generated');
    } catch (error) {
      console.log('Gemini layout suggestions failed:', error);
      layoutSuggestions = { cardStyle: "horizontal", highlight: "popular", animation: "subtle" };
    }

    // Log the multi-AI interaction
    await supabase.from('ai_waiter_logs').insert({
      vendor_id: vendor.id,
      guest_session_id: guestSessionId,
      message_type: 'user',
      content: message,
      ai_model_used: 'multi-ai',
      processing_metadata: {
        gpt_response: gptResponse,
        claude_refinement: claudeResponse,
        gemini_layout: layoutSuggestions
      }
    });

    await supabase.from('ai_waiter_logs').insert({
      vendor_id: vendor.id,
      guest_session_id: guestSessionId,
      message_type: 'assistant',
      content: claudeResponse,
      suggestions: suggestedItems,
      ai_model_used: 'multi-ai',
      processing_metadata: layoutSuggestions
    });

    return new Response(
      JSON.stringify({
        response: claudeResponse,
        suggestions: suggestedItems,
        layoutHints: layoutSuggestions
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-waiter-chat:', error);
    
    // Fallback to single AI model
    try {
      const fallbackResponse = await callOpenAI([
        {
          role: 'system',
          content: `You are Kai, a friendly AI waiter. Provide a helpful response about the menu.`
        },
        { role: 'user', content: message || 'Hello' }
      ], 'gpt-4o-mini');
      
      return new Response(
        JSON.stringify({
          response: fallbackResponse,
          suggestions: [],
          layoutHints: {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return new Response(
        JSON.stringify({ 
          response: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment, or feel free to browse our menu directly!",
          suggestions: [],
          layoutHints: {}
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }
});
