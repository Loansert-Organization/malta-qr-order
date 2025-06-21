
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

interface ErrorAnalysisRequest {
  error_message: string;
  error_stack?: string;
  file_path?: string;
  code_context?: string;
  user_action?: string;
  browser_info?: string;
  console_logs?: string[];
}

interface ErrorAnalysisResponse {
  error_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  root_cause: string;
  suggested_fixes: {
    fix_description: string;
    code_changes: string;
    confidence_score: number;
  }[];
  preventive_measures: string[];
  ai_model_used: string;
  analysis_timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const errorData: ErrorAnalysisRequest = await req.json();
    console.log('AI Error Handler processing error:', errorData.error_message);

    // Choose AI model based on error type and availability
    let analysisResult: ErrorAnalysisResponse;
    
    if (openaiApiKey) {
      analysisResult = await analyzeWithGPT4o(errorData);
    } else if (claudeApiKey) {
      analysisResult = await analyzeWithClaude(errorData);
    } else {
      throw new Error('No AI API keys available for error analysis');
    }

    // Log the analysis for learning purposes
    await logErrorAnalysis(errorData, analysisResult);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Error Handler:', error);
    
    // Fallback analysis
    const fallbackResponse: ErrorAnalysisResponse = {
      error_type: 'unknown',
      severity: 'medium',
      root_cause: 'Unable to analyze error with AI models',
      suggested_fixes: [{
        fix_description: 'Check console logs and error stack trace for more details',
        code_changes: 'Add more specific error handling and logging',
        confidence_score: 30
      }],
      preventive_measures: ['Add proper error boundaries', 'Implement comprehensive logging'],
      ai_model_used: 'fallback',
      analysis_timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeWithGPT4o(errorData: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
  const systemPrompt = `You are an expert JavaScript/TypeScript/React error analyst. Analyze the provided error and give specific, actionable solutions.

Context: This is for ICUPA Malta, a React/TypeScript app using Supabase, Tailwind CSS, and Shadcn UI.

Analyze the error and provide:
1. Error type classification
2. Severity assessment
3. Root cause analysis
4. Specific code fixes with high confidence
5. Preventive measures

Be specific about file paths, function names, and exact code changes needed.`;

  const userPrompt = `Error Analysis Request:
- Error Message: ${errorData.error_message}
- Stack Trace: ${errorData.error_stack || 'Not provided'}
- File Path: ${errorData.file_path || 'Unknown'}
- Code Context: ${errorData.code_context || 'Not provided'}
- User Action: ${errorData.user_action || 'Unknown'}
- Console Logs: ${errorData.console_logs?.join('\n') || 'None'}

Please provide a comprehensive analysis and specific solutions.`;

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
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  const data = await response.json();
  const analysis = data.choices[0].message.content;

  // Parse AI response into structured format
  return parseErrorAnalysis(analysis, 'gpt-4o');
}

async function analyzeWithClaude(errorData: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
  // Implementation for Claude API would go here
  // For now, return a placeholder
  return {
    error_type: 'analysis_pending',
    severity: 'medium',
    root_cause: 'Claude analysis not yet implemented',
    suggested_fixes: [],
    preventive_measures: [],
    ai_model_used: 'claude-4',
    analysis_timestamp: new Date().toISOString()
  };
}

function parseErrorAnalysis(analysisText: string, model: string): ErrorAnalysisResponse {
  // Parse the AI response into structured format
  // This is a simplified parser - in production, you'd want more robust parsing
  
  const lines = analysisText.split('\n');
  
  return {
    error_type: extractErrorType(analysisText),
    severity: extractSeverity(analysisText),
    root_cause: extractRootCause(analysisText),
    suggested_fixes: extractSuggestedFixes(analysisText),
    preventive_measures: extractPreventiveMeasures(analysisText),
    ai_model_used: model,
    analysis_timestamp: new Date().toISOString()
  };
}

function extractErrorType(text: string): string {
  const typeMatch = text.match(/error type:?\s*(.+)/i);
  return typeMatch ? typeMatch[1].trim() : 'unknown';
}

function extractSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMatch = text.match(/severity:?\s*(low|medium|high|critical)/i);
  return (severityMatch ? severityMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high' | 'critical';
}

function extractRootCause(text: string): string {
  const causeMatch = text.match(/root cause:?\s*(.+)/i);
  return causeMatch ? causeMatch[1].trim() : 'Unable to determine root cause';
}

function extractSuggestedFixes(text: string): { fix_description: string; code_changes: string; confidence_score: number; }[] {
  // Simplified extraction - would need more sophisticated parsing in production
  const fixes = [];
  const fixMatches = text.match(/fix:?\s*(.+)/gi);
  
  if (fixMatches) {
    for (const fix of fixMatches) {
      fixes.push({
        fix_description: fix.replace(/fix:?\s*/i, ''),
        code_changes: 'See fix description for details',
        confidence_score: 80
      });
    }
  }
  
  return fixes.length > 0 ? fixes : [{
    fix_description: 'Check the full AI analysis for detailed solutions',
    code_changes: 'Refer to AI analysis response',
    confidence_score: 60
  }];
}

function extractPreventiveMeasures(text: string): string[] {
  const measures = [];
  const measureMatches = text.match(/prevent:?\s*(.+)/gi);
  
  if (measureMatches) {
    for (const measure of measureMatches) {
      measures.push(measure.replace(/prevent:?\s*/i, ''));
    }
  }
  
  return measures.length > 0 ? measures : ['Implement proper error handling', 'Add comprehensive testing'];
}

async function logErrorAnalysis(errorData: ErrorAnalysisRequest, analysis: ErrorAnalysisResponse) {
  try {
    // Log to console for now - in production, you'd save to database
    console.log('Error Analysis Logged:', {
      timestamp: new Date().toISOString(),
      error: errorData.error_message,
      severity: analysis.severity,
      model_used: analysis.ai_model_used,
      fixes_suggested: analysis.suggested_fixes.length
    });
  } catch (error) {
    console.error('Failed to log error analysis:', error);
  }
}
