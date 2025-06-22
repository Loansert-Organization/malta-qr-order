
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

interface ErrorFixRequest {
  error_message: string;
  error_stack?: string;
  component_name: string;
  code_context?: string;
  user_action?: string;
  reproduction_steps?: string[];
}

interface ErrorFixResponse {
  fix_confidence: number;
  root_cause_analysis: string;
  recommended_fixes: string[];
  code_suggestions: string;
  prevention_measures: string[];
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  ai_models_used: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const errorRequest: ErrorFixRequest = await req.json();
    console.log('🚨 AI Error Fix Starting:', errorRequest.error_message);

    // Analyze error with GPT-4o
    const errorAnalysis = await analyzeErrorWithGPT4o(errorRequest);
    
    // Create comprehensive fix response
    const fixResponse = await generateFixResponse(errorAnalysis, errorRequest);

    // Log error fix attempt
    await logErrorFix(errorRequest, fixResponse);

    return new Response(JSON.stringify(fixResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in AI Error Fix:', error);
    
    const fallbackResponse: ErrorFixResponse = {
      fix_confidence: 50,
      root_cause_analysis: 'AI analysis failed - manual investigation required',
      recommended_fixes: ['Check console logs', 'Verify component imports', 'Review recent changes'],
      code_suggestions: '// Manual code review and debugging required',
      prevention_measures: ['Add proper error boundaries', 'Implement comprehensive logging'],
      severity_level: 'medium',
      ai_models_used: 'fallback'
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeErrorWithGPT4o(request: ErrorFixRequest): Promise<any> {
  if (!openaiApiKey) throw new Error('OpenAI API key not configured');

  const systemPrompt = `You are GPT-4o, the error analysis expert for ICUPA Malta's hospitality platform.
  
ICUPA CONTEXT:
- React + TypeScript + Supabase architecture
- Anonymous-first authentication system
- Real-time ordering and payment processing
- Multi-role platform (guests, vendors, admins)
- Malta-specific hospitality requirements

ANALYSIS FOCUS:
1. Root cause identification
2. Impact assessment on user experience
3. Fix recommendations with code examples
4. Prevention strategies
5. Testing approaches

Provide detailed analysis with specific, actionable solutions.`;

  const userPrompt = `ERROR ANALYSIS REQUEST:
Error: ${request.error_message}
Stack: ${request.error_stack || 'Not provided'}
Component: ${request.component_name}
User Action: ${request.user_action || 'Unknown'}
Code Context: ${request.code_context?.substring(0, 1500) || 'Not provided'}
Reproduction Steps: ${request.reproduction_steps?.join(', ') || 'Not provided'}

Analyze this error in the context of ICUPA Malta's hospitality platform and provide comprehensive fix recommendations.`;

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
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  return {
    analysis: data.choices[0].message.content,
    confidence: extractConfidence(data.choices[0].message.content)
  };
}

async function generateFixResponse(analysis: any, request: ErrorFixRequest): Promise<ErrorFixResponse> {
  const analysisText = analysis.analysis || '';
  
  return {
    fix_confidence: analysis.confidence || 75,
    root_cause_analysis: extractRootCause(analysisText),
    recommended_fixes: extractRecommendedFixes(analysisText),
    code_suggestions: extractCodeSuggestions(analysisText),
    prevention_measures: extractPreventionMeasures(analysisText),
    severity_level: determineSeverity(request.error_message),
    ai_models_used: 'GPT-4o'
  };
}

function extractConfidence(analysis: string): number {
  const confidenceMatch = analysis.match(/confidence:?\s*(\d+)%?/i);
  return confidenceMatch ? parseInt(confidenceMatch[1]) : 75;
}

function extractRootCause(analysis: string): string {
  const lines = analysis.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('root cause') || line.toLowerCase().includes('main issue')) {
      return line.trim();
    }
  }
  return 'Root cause analysis in progress - check detailed analysis';
}

function extractRecommendedFixes(analysis: string): string[] {
  const fixes = [];
  const lines = analysis.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('fix:') || line.toLowerCase().includes('solution:')) {
      fixes.push(line.trim());
    }
  }
  return fixes.length > 0 ? fixes : ['Review error context and apply standard debugging practices'];
}

function extractCodeSuggestions(analysis: string): string {
  const codeMatch = analysis.match(/```[\w]*\n([\s\S]*?)```/);
  return codeMatch ? codeMatch[1].trim() : '// Code suggestions available in detailed analysis';
}

function extractPreventionMeasures(analysis: string): string[] {
  const measures = [];
  const lines = analysis.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes('prevent') || line.toLowerCase().includes('avoid')) {
      measures.push(line.trim());
    }
  }
  return measures.length > 0 ? measures : ['Add comprehensive error handling', 'Implement proper validation'];
}

function determineSeverity(errorMessage: string): 'low' | 'medium' | 'high' | 'critical' {
  const lowerError = errorMessage.toLowerCase();
  
  if (lowerError.includes('crash') || lowerError.includes('fatal') || lowerError.includes('cannot read properties')) {
    return 'critical';
  } else if (lowerError.includes('failed') || lowerError.includes('error') || lowerError.includes('undefined')) {
    return 'high';
  } else if (lowerError.includes('warning') || lowerError.includes('deprecated')) {
    return 'medium';
  }
  
  return 'low';
}

async function logErrorFix(request: ErrorFixRequest, response: ErrorFixResponse) {
  try {
    await supabase.from('system_logs').insert({
      log_type: 'ai_error_fix',
      component: request.component_name,
      message: `Error fix attempted: ${request.error_message}`,
      metadata: {
        error_message: request.error_message,
        fix_confidence: response.fix_confidence,
        severity_level: response.severity_level,
        ai_models_used: response.ai_models_used,
        timestamp: new Date().toISOString()
      },
      severity: response.severity_level === 'critical' ? 'error' : 
               response.severity_level === 'high' ? 'warning' : 'info'
    });
    
    console.log('✅ Error fix logged successfully');
  } catch (error) {
    console.error('Failed to log error fix:', error);
  }
}
