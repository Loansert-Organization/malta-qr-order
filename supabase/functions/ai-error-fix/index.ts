
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('🔧 AI Error Fix Starting:', body.message || body.task);

    if (!body.message && !body.task) {
      return new Response(JSON.stringify({
        error: "Missing 'message' or 'task'"
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const errorContext = `
ERROR/ISSUE: ${body.message || 'Task completion issue'}
TASK: ${body.task || 'N/A'}
IMPLEMENTATION: ${body.implementation || 'N/A'}
STACK TRACE: ${body.stack || 'N/A'}
SOURCE: ${body.source || 'Unknown'}
`;

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert full-stack engineer specializing in React, TypeScript, and Supabase applications. 
            
            You receive error reports or task completion issues and provide specific, actionable fixes. Focus on:
            1. Identifying the root cause
            2. Providing exact code changes needed
            3. Explaining the solution clearly
            4. Preventing similar issues in the future
            
            Format your response with clear sections: DIAGNOSIS, FIX, and PREVENTION.`
          },
          {
            role: 'user',
            content: errorContext
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      }),
    });

    if (!completion.ok) {
      throw new Error(`OpenAI API error: ${completion.status}`);
    }

    const data = await completion.json();
    const suggestion = data.choices[0].message.content;

    // Log the fix attempt
    await supabase.from('ai_waiter_logs').insert({
      content: `AI error fix generated for: ${body.message || body.task}`,
      message_type: 'ai_error_fix',
      guest_session_id: 'system',
      vendor_id: '00000000-0000-0000-0000-000000000000',
      processing_metadata: {
        original_error: body.message,
        task: body.task,
        fix_suggestion: suggestion,
        timestamp: new Date().toISOString()
      },
      ai_model_used: 'gpt-4o'
    });

    return new Response(JSON.stringify({ 
      fix: suggestion,
      confidence: 85,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in AI Error Fix:', error);
    
    return new Response(JSON.stringify({
      error: "Failed to generate fix",
      details: error.message,
      fallback_suggestions: [
        "Check console logs for specific error details",
        "Verify all imports and dependencies are correct",
        "Ensure TypeScript types match expected interfaces",
        "Review recent code changes for potential conflicts"
      ]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
