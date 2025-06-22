
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  model: 'gpt-4o' | 'claude-4' | 'gemini-2.5-pro';
  task: 'layout' | 'recommendation' | 'chat' | 'content' | 'analysis';
  prompt: string;
  context?: any;
  temperature?: number;
  max_tokens?: number;
}

interface AIResponse {
  model_used: string;
  response: string;
  processing_time_ms: number;
  tokens_used?: number;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    console.log('🤖 AI Router request received');
    
    const { model, task, prompt, context, temperature = 0.7, max_tokens = 1000 }: AIRequest = await req.json();
    
    console.log(`🎯 Routing to ${model} for ${task} task`);
    
    let response: string;
    let tokensUsed: number | undefined;
    
    switch (model) {
      case 'gpt-4o':
        ({ response, tokensUsed } = await callOpenAI(prompt, context, temperature, max_tokens));
        break;
        
      case 'claude-4':
        ({ response, tokensUsed } = await callClaude(prompt, context, temperature, max_tokens));
        break;
        
      case 'gemini-2.5-pro':
        ({ response, tokensUsed } = await callGemini(prompt, context, temperature, max_tokens));
        break;
        
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
    
    const processingTime = Date.now() - startTime;
    console.log(`✅ ${model} response completed in ${processingTime}ms`);
    
    const aiResponse: AIResponse = {
      model_used: model,
      response,
      processing_time_ms: processingTime,
      tokens_used: tokensUsed,
      success: true
    };
    
    return new Response(
      JSON.stringify(aiResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('❌ AI Router error:', error);
    
    const processingTime = Date.now() - startTime;
    const errorResponse: AIResponse = {
      model_used: 'error',
      response: 'I apologize, but I encountered an error processing your request. Please try again.',
      processing_time_ms: processingTime,
      success: false,
      error: error.message
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

async function callOpenAI(prompt: string, context?: any, temperature = 0.7, maxTokens = 1000) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const messages = [
    {
      role: 'system',
      content: 'You are an AI assistant specialized in Malta hospitality and restaurant services. Provide helpful, accurate, and culturally aware responses.'
    },
    {
      role: 'user',
      content: context ? `Context: ${JSON.stringify(context)}\n\nRequest: ${prompt}` : prompt
    }
  ];
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages,
      temperature,
      max_tokens: maxTokens
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    response: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens
  };
}

async function callClaude(prompt: string, context?: any, temperature = 0.7, maxTokens = 1000) {
  const apiKey = Deno.env.get('CLAUDE_API_KEY');
  if (!apiKey) {
    throw new Error('Claude API key not configured');
  }
  
  const systemPrompt = 'You are an AI assistant specialized in Malta hospitality, focusing on friendly, empathetic communication and clear, culturally-aware responses for restaurant services.';
  const userPrompt = context ? `Context: ${JSON.stringify(context)}\n\nRequest: ${prompt}` : prompt;
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ]
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    response: data.content[0].text,
    tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens
  };
}

async function callGemini(prompt: string, context?: any, temperature = 0.7, maxTokens = 1000) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const systemInstruction = 'You are an AI assistant specialized in visual layout design and interactive behavior for Malta hospitality services. Focus on optimal card designs, animations, and visual coherence.';
  const userPrompt = context ? `Context: ${JSON.stringify(context)}\n\nRequest: ${prompt}` : prompt;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: `${systemInstruction}\n\n${userPrompt}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }
  
  const data = await response.json();
  return {
    response: data.candidates[0].content.parts[0].text,
    tokensUsed: data.usageMetadata?.totalTokenCount
  };
}
