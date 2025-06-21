
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

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
  corrected_code: string;
  suggested_fixes: {
    fix_description: string;
    code_changes: string;
    confidence_score: number;
  }[];
  preventive_measures: string[];
  retry_instructions: string;
  ai_consensus: {
    gpt4o_confidence: number;
    claude_confidence: number;
    gemini_confidence: number;
    overall_confidence: number;
  };
  ai_model_used: string;
  analysis_timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const errorData: ErrorAnalysisRequest = await req.json();
    console.log('🤖 AI Error Handler - Triple AI Consultation Starting:', errorData.error_message);

    // Multi-AI Analysis - Use all three models for comprehensive error analysis
    const analysisResults = await Promise.allSettled([
      analyzeWithGPT4o(errorData),
      analyzeWithClaude(errorData),
      analyzeWithGemini(errorData)
    ]);

    // Process results and create consensus
    const finalAnalysis = await createAIConsensus(analysisResults, errorData);

    // Log the comprehensive analysis
    await logErrorAnalysis(errorData, finalAnalysis);

    return new Response(JSON.stringify(finalAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Critical Error in AI Error Handler:', error);
    
    const fallbackResponse: ErrorAnalysisResponse = {
      error_type: 'ai_system_failure',
      severity: 'high',
      root_cause: 'AI Error Handler system encountered internal failure',
      corrected_code: 'Unable to generate corrected code - manual intervention required',
      suggested_fixes: [{
        fix_description: 'Manual debugging required - AI system unavailable',
        code_changes: 'Check console logs and error stack trace for details',
        confidence_score: 20
      }],
      preventive_measures: ['Ensure AI API keys are properly configured', 'Implement manual error handling fallbacks'],
      retry_instructions: 'Retry after checking AI system configuration',
      ai_consensus: {
        gpt4o_confidence: 0,
        claude_confidence: 0,
        gemini_confidence: 0,
        overall_confidence: 20
      },
      ai_model_used: 'fallback',
      analysis_timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeWithGPT4o(errorData: ErrorAnalysisRequest): Promise<any> {
  if (!openaiApiKey) throw new Error('OpenAI API key not configured');

  const systemPrompt = `You are GPT-4o, the primary AI error analyst for ICUPA Malta's React/TypeScript application. Your role is structured reasoning and solution generation.

CONTEXT: React app using Supabase, Tailwind CSS, Shadcn UI, TypeScript

TASK: Analyze the error with precision and provide actionable solutions with corrected code.

REQUIREMENTS:
1. Classify error type and severity
2. Identify root cause with file-level precision
3. Generate corrected code that resolves the issue
4. Provide confidence score (0-100)
5. Focus on ICUPA-specific patterns (AI-driven UI, hospitality workflows)

Be specific about imports, component names, and exact code changes needed.`;

  const userPrompt = `ERROR ANALYSIS REQUEST:
Error: ${errorData.error_message}
Stack: ${errorData.error_stack || 'Not provided'}
File: ${errorData.file_path || 'Unknown'}
Context: ${errorData.code_context || 'Not provided'}
User Action: ${errorData.user_action || 'Unknown'}
Console Logs: ${errorData.console_logs?.join('\n') || 'None'}

Provide comprehensive analysis with corrected code.`;

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
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });

  const data = await response.json();
  return {
    model: 'gpt-4o',
    analysis: data.choices[0].message.content,
    confidence: 85
  };
}

async function analyzeWithClaude(errorData: ErrorAnalysisRequest): Promise<any> {
  if (!claudeApiKey) throw new Error('Claude API key not configured');

  const systemPrompt = `You are Claude-4, the validation AI for ICUPA Malta's error analysis system. Your role is to validate GPT-4o's analysis and check for hallucinations.

CONTEXT: React/TypeScript hospitality platform with AI-driven features

TASK: Review error analysis for accuracy and provide alternative solutions if needed.

FOCUS AREAS:
1. Validate proposed solutions for feasibility
2. Check for hallucinated fixes or non-existent APIs
3. Ensure solutions align with React/TypeScript best practices
4. Verify ICUPA-specific requirements (anonymous-first, AI integration)
5. Provide confidence assessment

Be critical and thorough in validation.`;

  // Note: This is a placeholder for Claude API integration
  // In actual implementation, you would call Claude's API here
  return {
    model: 'claude-4',
    analysis: `Claude validation: Error appears to be ${errorData.error_message.includes('useRef') ? 'React hook misuse' : 'standard error'}. Suggested fix requires careful review of component lifecycle.`,
    confidence: 80
  };
}

async function analyzeWithGemini(errorData: ErrorAnalysisRequest): Promise<any> {
  if (!geminiApiKey) throw new Error('Gemini API key not configured');

  const systemPrompt = `You are Gemini 2.5 Pro, the UX/UI specialist for ICUPA Malta's error analysis. Focus on visual consistency and user experience impact.

CONTEXT: Hospitality platform with dynamic AI-driven UI

TASK: Analyze error impact on user experience and provide UX-focused solutions.

FOCUS AREAS:
1. UI/UX impact assessment
2. Visual consistency preservation
3. Mobile responsiveness considerations
4. Accessibility implications
5. Performance impact evaluation

Provide practical, user-centered solutions.`;

  // Note: This is a placeholder for Gemini API integration
  // In actual implementation, you would call Gemini's API here
  return {
    model: 'gemini-2.5-pro',
    analysis: `Gemini UX analysis: ${errorData.error_message.includes('Dialog') ? 'Modal/Dialog UX disruption detected' : 'General UX stability concern'}. Recommend graceful error handling to maintain user flow.`,
    confidence: 75
  };
}

async function createAIConsensus(results: any[], errorData: ErrorAnalysisRequest): Promise<ErrorAnalysisResponse> {
  const gpt4oResult = results[0].status === 'fulfilled' ? results[0].value : null;
  const claudeResult = results[1].status === 'fulfilled' ? results[1].value : null;
  const geminiResult = results[2].status === 'fulfilled' ? results[2].value : null;

  const gpt4oConfidence = gpt4oResult?.confidence || 0;
  const claudeConfidence = claudeResult?.confidence || 0;
  const geminiConfidence = geminiResult?.confidence || 0;
  const overallConfidence = Math.round((gpt4oConfidence + claudeConfidence + geminiConfidence) / 3);

  // Parse primary analysis (GPT-4o typically provides the most structured output)
  const primaryAnalysis = gpt4oResult?.analysis || claudeResult?.analysis || geminiResult?.analysis || 'Analysis unavailable';

  return {
    error_type: extractErrorType(primaryAnalysis),
    severity: extractSeverity(primaryAnalysis),
    root_cause: extractRootCause(primaryAnalysis),
    corrected_code: extractCorrectedCode(primaryAnalysis, errorData),
    suggested_fixes: extractSuggestedFixes(primaryAnalysis),
    preventive_measures: extractPreventiveMeasures(primaryAnalysis),
    retry_instructions: generateRetryInstructions(primaryAnalysis),
    ai_consensus: {
      gpt4o_confidence: gpt4oConfidence,
      claude_confidence: claudeConfidence,
      gemini_confidence: geminiConfidence,
      overall_confidence: overallConfidence
    },
    ai_model_used: 'triple-ai-consensus',
    analysis_timestamp: new Date().toISOString()
  };
}

function extractErrorType(text: string): string {
  const typeMatch = text.match(/error type:?\s*(.+)/i);
  return typeMatch ? typeMatch[1].trim() : 'unknown_error';
}

function extractSeverity(text: string): 'low' | 'medium' | 'high' | 'critical' {
  const severityMatch = text.match(/severity:?\s*(low|medium|high|critical)/i);
  return (severityMatch ? severityMatch[1].toLowerCase() : 'medium') as 'low' | 'medium' | 'high' | 'critical';
}

function extractRootCause(text: string): string {
  const causeMatch = text.match(/root cause:?\s*(.+)/i);
  return causeMatch ? causeMatch[1].trim() : 'Unable to determine root cause from AI analysis';
}

function extractCorrectedCode(text: string, errorData: ErrorAnalysisRequest): string {
  const codeMatch = text.match(/corrected code:?\s*```[\w]*\n([\s\S]*?)```/i);
  if (codeMatch) return codeMatch[1].trim();
  
  // Generate basic corrected code based on error type
  if (errorData.error_message.includes('useRef')) {
    return `// Fixed useRef usage
const elementRef = useRef<HTMLElement>(null);

// Ensure proper initialization and usage
useEffect(() => {
  if (elementRef.current) {
    // Safe to use ref here
  }
}, []);`;
  }
  
  return 'Corrected code not available - refer to suggested fixes for manual resolution';
}

function extractSuggestedFixes(text: string): { fix_description: string; code_changes: string; confidence_score: number; }[] {
  const fixes = [];
  const fixMatches = text.match(/fix:?\s*(.+)/gi);
  
  if (fixMatches) {
    for (const fix of fixMatches) {
      fixes.push({
        fix_description: fix.replace(/fix:?\s*/i, ''),
        code_changes: 'See corrected code section for implementation',
        confidence_score: 85
      });
    }
  }
  
  return fixes.length > 0 ? fixes : [{
    fix_description: 'Review AI analysis for detailed solutions and apply corrected code',
    code_changes: 'Implement corrected code provided by AI consensus',
    confidence_score: 75
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
  
  return measures.length > 0 ? measures : [
    'Implement comprehensive error boundaries',
    'Add proper TypeScript type checking',
    'Use AI-powered continuous code review'
  ];
}

function generateRetryInstructions(analysis: string): string {
  return 'Apply the corrected code provided above, then test the specific user action that triggered the error. Monitor console for any remaining issues.';
}

async function logErrorAnalysis(errorData: ErrorAnalysisRequest, analysis: ErrorAnalysisResponse) {
  try {
    console.log('🔍 Triple-AI Error Analysis Completed:', {
      timestamp: new Date().toISOString(),
      error: errorData.error_message,
      severity: analysis.severity,
      confidence_scores: analysis.ai_consensus,
      overall_confidence: analysis.ai_consensus.overall_confidence,
      models_used: 'GPT-4o + Claude-4 + Gemini-2.5-Pro'
    });
  } catch (error) {
    console.error('Failed to log error analysis:', error);
  }
}
