
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface AIRequest {
  model: 'gpt-4o' | 'claude-4' | 'gemini-2.5-pro';
  task: 'layout_generation' | 'content_refinement' | 'visual_design' | 'menu_recommendation';
  context: {
    vendor_id: string;
    session_id?: string;
    time_context?: string;
    location?: string;
    weather?: string;
    user_preferences?: any;
    menu_items?: any[];
  };
  prompt: string;
  config?: {
    temperature?: number;
    max_tokens?: number;
    fallback_model?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const aiRequest: AIRequest = await req.json();
    console.log('AI Router request:', aiRequest);

    // Log the request for analytics
    await logAIRequest(aiRequest);

    let response;
    
    switch (aiRequest.model) {
      case 'gpt-4o':
        response = await processWithGPT4o(aiRequest);
        break;
      case 'claude-4':
      case 'gemini-2.5-pro':
        // For now, fallback to GPT-4o until other models are configured
        console.log(`${aiRequest.model} not yet configured, falling back to GPT-4o`);
        response = await processWithGPT4o(aiRequest);
        break;
      default:
        throw new Error(`Unsupported model: ${aiRequest.model}`);
    }

    // Store successful AI interaction
    await storeAIResult(aiRequest, response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Router error:', error);
    
    // Try fallback model if specified
    try {
      const aiRequest: AIRequest = await req.json();
      if (aiRequest.config?.fallback_model && aiRequest.config.fallback_model !== aiRequest.model) {
        console.log(`Attempting fallback to ${aiRequest.config.fallback_model}`);
        const fallbackRequest = { ...aiRequest, model: aiRequest.config.fallback_model as any };
        const fallbackResponse = await processWithGPT4o(fallbackRequest);
        return new Response(JSON.stringify(fallbackResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }

    return new Response(JSON.stringify({ 
      error: error.message,
      fallback_used: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processWithGPT4o(aiRequest: AIRequest) {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = getSystemPrompt(aiRequest.task);
  const contextualPrompt = buildContextualPrompt(aiRequest);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: contextualPrompt }
      ],
      temperature: aiRequest.config?.temperature || 0.7,
      max_tokens: aiRequest.config?.max_tokens || 1000,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  
  return {
    model_used: 'gpt-4o',
    content: data.choices[0].message.content,
    task: aiRequest.task,
    processing_metadata: {
      tokens_used: data.usage?.total_tokens || 0,
      model_version: 'gpt-4o',
      timestamp: new Date().toISOString()
    }
  };
}

function getSystemPrompt(task: string): string {
  const prompts = {
    layout_generation: `You are a UX orchestrator for ICUPA Malta, specializing in generating dynamic restaurant menu layouts. 
    Create JSON layout configurations that optimize user engagement based on context like time, location, and preferences.
    Return only valid JSON with sections, priority ordering, and visual hints.`,
    
    content_refinement: `You are a content refinement specialist for ICUPA Malta, focusing on tone, empathy, and local Maltese charm.
    Refine restaurant content to be friendly, culturally appropriate, and engaging. Consider local expressions and hospitality warmth.`,
    
    visual_design: `You are a visual design AI for ICUPA Malta, optimizing card layouts, animations, and visual hierarchy.
    Suggest specific CSS classes, animations, and layout improvements for restaurant menu interfaces.`,
    
    menu_recommendation: `You are Kai, the AI Waiter for ICUPA Malta restaurants. You help guests discover perfect menu items.
    Be conversational, helpful, and knowledgeable about the menu. Always suggest specific items with reasons.`
  };

  return prompts[task as keyof typeof prompts] || prompts.menu_recommendation;
}

function buildContextualPrompt(aiRequest: AIRequest): string {
  let prompt = aiRequest.prompt;
  
  // Add contextual information
  if (aiRequest.context.time_context) {
    prompt += `\n\nTime context: ${aiRequest.context.time_context}`;
  }
  
  if (aiRequest.context.location) {
    prompt += `\nLocation: ${aiRequest.context.location}`;
  }
  
  if (aiRequest.context.weather) {
    prompt += `\nWeather: ${aiRequest.context.weather}`;
  }
  
  if (aiRequest.context.user_preferences) {
    prompt += `\nUser preferences: ${JSON.stringify(aiRequest.context.user_preferences)}`;
  }
  
  if (aiRequest.context.menu_items && aiRequest.context.menu_items.length > 0) {
    prompt += `\nAvailable menu items: ${JSON.stringify(aiRequest.context.menu_items.slice(0, 10))}`;
  }
  
  return prompt;
}

async function logAIRequest(aiRequest: AIRequest) {
  try {
    await supabase.from('layout_suggestions').insert({
      vendor_id: aiRequest.context.vendor_id,
      context_data: aiRequest.context,
      layout_config: { request: aiRequest.prompt, task: aiRequest.task },
      ai_model_used: aiRequest.model
    });
  } catch (error) {
    console.error('Failed to log AI request:', error);
  }
}

async function storeAIResult(aiRequest: AIRequest, response: any) {
  try {
    if (aiRequest.task === 'layout_generation') {
      await supabase.from('layout_suggestions').insert({
        vendor_id: aiRequest.context.vendor_id,
        context_data: aiRequest.context,
        layout_config: response.content,
        ai_model_used: response.model_used
      });
    }
  } catch (error) {
    console.error('Failed to store AI result:', error);
  }
}
