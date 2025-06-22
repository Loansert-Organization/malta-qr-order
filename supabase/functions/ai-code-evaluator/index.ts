
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
    console.log('🧪 AI Code Evaluator Starting...');

    const code = body.code || body.implementation;
    const context = body.context || body.task || "";

    if (!code) {
      return new Response(JSON.stringify({ 
        error: "Missing code or implementation to evaluate" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
            content: `You are a senior code reviewer specializing in React, TypeScript, and modern web development.
            
            Evaluate the provided code and give scores (0-100) for:
            1. Code Quality - clean, readable, maintainable
            2. Performance - efficient, optimized
            3. Security - safe practices, no vulnerabilities  
            4. Best Practices - follows modern standards
            5. Type Safety - proper TypeScript usage
            
            Provide an overall score and specific recommendations. Be constructive and actionable.`
          },
          {
            role: 'user',
            content: `CODE TO EVALUATE:\n${code}\n\nCONTEXT:\n${context}`
          }
        ],
        temperature: 0.3,
        max_tokens: 1200
      }),
    });

    if (!completion.ok) {
      throw new Error(`OpenAI API error: ${completion.status}`);
    }

    const data = await completion.json();
    const evaluation = data.choices[0].message.content;

    // Extract scores using simple regex (fallback to default if not found)
    const overallScore = extractScore(evaluation, 'overall') || 75;
    const qualityScore = extractScore(evaluation, 'quality') || 75;
    const performanceScore = extractScore(evaluation, 'performance') || 75;
    const securityScore = extractScore(evaluation, 'security') || 80;

    const result = {
      evaluation,
      scores: {
        overall: overallScore,
        code_quality: qualityScore,
        performance: performanceScore,
        security: securityScore,
        type_safety: extractScore(evaluation, 'type') || 70,
        best_practices: extractScore(evaluation, 'practices') || 70
      },
      recommendations: extractRecommendations(evaluation),
      timestamp: new Date().toISOString()
    };

    // Log the evaluation
    await supabase.from('system_logs').insert({
      log_type: 'ai_code_evaluation',
      component: 'code_evaluator',
      message: `Code evaluation completed with overall score: ${overallScore}`,
      metadata: {
        scores: result.scores,
        code_length: code.length,
        context,
        timestamp: result.timestamp
      },
      severity: overallScore >= 80 ? 'info' : overallScore >= 60 ? 'warning' : 'error'
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Code Evaluation Failed:', error);
    
    return new Response(JSON.stringify({
      error: "Code evaluation failed",
      details: error.message,
      fallback_score: 50
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractScore(text: string, category: string): number | null {
  const patterns = [
    new RegExp(`${category}[:\\s]*([0-9]{1,3})`, 'i'),
    new RegExp(`([0-9]{1,3})[\\s]*[/\\-\\s]*100[\\s]*${category}`, 'i'),
    new RegExp(`${category}[^0-9]*([0-9]{1,3})`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const score = parseInt(match[1]);
      if (score >= 0 && score <= 100) {
        return score;
      }
    }
  }
  
  return null;
}

function extractRecommendations(evaluation: string): string[] {
  const recommendations = [];
  const lines = evaluation.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^[-•*]\s/) || trimmed.toLowerCase().includes('recommend') || trimmed.toLowerCase().includes('suggest')) {
      recommendations.push(trimmed.replace(/^[-•*]\s*/, ''));
    }
  }
  
  return recommendations.length > 0 ? recommendations : [
    'Continue following current coding practices',
    'Consider adding more comprehensive error handling',
    'Review code for potential performance optimizations'
  ];
}
