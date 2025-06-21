
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

interface CodeEvaluationRequest {
  task_description: string;
  files_modified: string[];
  code_changes: {
    file_path: string;
    changes: string;
    change_type: 'created' | 'modified' | 'deleted';
  }[];
  user_requirements: string;
  completion_summary: string;
}

interface CodeEvaluationResponse {
  overall_score: number; // 0-100
  task_completion: {
    score: number;
    feedback: string;
    missing_requirements: string[];
  };
  code_quality: {
    score: number;
    strengths: string[];
    improvements: string[];
    maintainability: number;
    readability: number;
    performance: number;
  };
  best_practices: {
    score: number;
    followed: string[];
    violated: string[];
    suggestions: string[];
  };
  security_assessment: {
    score: number;
    vulnerabilities: string[];
    recommendations: string[];
  };
  future_recommendations: string[];
  ai_model_used: string;
  evaluation_timestamp: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const evaluationRequest: CodeEvaluationRequest = await req.json();
    console.log('AI Code Evaluator processing task:', evaluationRequest.task_description);

    // Choose AI model for evaluation
    let evaluationResult: CodeEvaluationResponse;
    
    if (openaiApiKey) {
      evaluationResult = await evaluateWithGPT4o(evaluationRequest);
    } else if (claudeApiKey) {
      evaluationResult = await evaluateWithClaude(evaluationRequest);
    } else {
      throw new Error('No AI API keys available for code evaluation');
    }

    // Log the evaluation for learning purposes
    await logCodeEvaluation(evaluationRequest, evaluationResult);

    return new Response(JSON.stringify(evaluationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Code Evaluator:', error);
    
    // Fallback evaluation
    const fallbackResponse: CodeEvaluationResponse = {
      overall_score: 70,
      task_completion: {
        score: 70,
        feedback: 'Unable to evaluate with AI models',
        missing_requirements: []
      },
      code_quality: {
        score: 70,
        strengths: ['Task attempted'],
        improvements: ['Add AI-powered evaluation'],
        maintainability: 70,
        readability: 70,
        performance: 70
      },
      best_practices: {
        score: 70,
        followed: [],
        violated: [],
        suggestions: ['Implement proper AI evaluation system']
      },
      security_assessment: {
        score: 70,
        vulnerabilities: [],
        recommendations: ['Review code manually']
      },
      future_recommendations: ['Set up AI evaluation system'],
      ai_model_used: 'fallback',
      evaluation_timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(fallbackResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function evaluateWithGPT4o(request: CodeEvaluationRequest): Promise<CodeEvaluationResponse> {
  const systemPrompt = `You are an expert code reviewer and software architect specializing in React/TypeScript applications. 

Your role is to evaluate completed coding tasks for ICUPA Malta - a hospitality platform built with React, TypeScript, Supabase, Tailwind CSS, and Shadcn UI.

Evaluate the code changes based on:
1. Task completion (Did it meet the requirements?)
2. Code quality (Clean, maintainable, readable)
3. Best practices (React patterns, TypeScript usage, performance)
4. Security considerations
5. Future maintainability

Provide specific, actionable feedback with scores out of 100.`;

  const userPrompt = `Code Evaluation Request:

Task Description: ${request.task_description}
User Requirements: ${request.user_requirements}
Completion Summary: ${request.completion_summary}

Files Modified: ${request.files_modified.join(', ')}

Code Changes:
${request.code_changes.map(change => 
  `File: ${change.file_path} (${change.change_type})
Changes: ${change.changes.substring(0, 500)}...`
).join('\n\n')}

Please provide a comprehensive evaluation with specific scores and actionable feedback.`;

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
  const evaluation = data.choices[0].message.content;

  // Parse AI response into structured format
  return parseCodeEvaluation(evaluation, 'gpt-4o');
}

async function evaluateWithClaude(request: CodeEvaluationRequest): Promise<CodeEvaluationResponse> {
  // Implementation for Claude API would go here
  // For now, return a placeholder
  return {
    overall_score: 85,
    task_completion: {
      score: 85,
      feedback: 'Claude evaluation not yet implemented',
      missing_requirements: []
    },
    code_quality: {
      score: 80,
      strengths: [],
      improvements: [],
      maintainability: 80,
      readability: 80,
      performance: 80
    },
    best_practices: {
      score: 80,
      followed: [],
      violated: [],
      suggestions: []
    },
    security_assessment: {
      score: 90,
      vulnerabilities: [],
      recommendations: []
    },
    future_recommendations: [],
    ai_model_used: 'claude-4',
    evaluation_timestamp: new Date().toISOString()
  };
}

function parseCodeEvaluation(evaluationText: string, model: string): CodeEvaluationResponse {
  // Parse the AI response into structured format
  // This is a simplified parser - in production, you'd want more robust parsing
  
  const overallScore = extractScore(evaluationText, 'overall') || 80;
  
  return {
    overall_score: overallScore,
    task_completion: {
      score: extractScore(evaluationText, 'task completion') || overallScore,
      feedback: extractFeedback(evaluationText, 'task completion'),
      missing_requirements: extractList(evaluationText, 'missing requirements')
    },
    code_quality: {
      score: extractScore(evaluationText, 'code quality') || overallScore,
      strengths: extractList(evaluationText, 'strengths'),
      improvements: extractList(evaluationText, 'improvements'),
      maintainability: extractScore(evaluationText, 'maintainability') || overallScore,
      readability: extractScore(evaluationText, 'readability') || overallScore,
      performance: extractScore(evaluationText, 'performance') || overallScore
    },
    best_practices: {
      score: extractScore(evaluationText, 'best practices') || overallScore,
      followed: extractList(evaluationText, 'followed'),
      violated: extractList(evaluationText, 'violated'),
      suggestions: extractList(evaluationText, 'suggestions')
    },
    security_assessment: {
      score: extractScore(evaluationText, 'security') || overallScore,
      vulnerabilities: extractList(evaluationText, 'vulnerabilities'),
      recommendations: extractList(evaluationText, 'security recommendations')
    },
    future_recommendations: extractList(evaluationText, 'future recommendations'),
    ai_model_used: model,
    evaluation_timestamp: new Date().toISOString()
  };
}

function extractScore(text: string, category: string): number | null {
  const scoreRegex = new RegExp(`${category}:?\\s*(\\d+)`, 'i');
  const match = text.match(scoreRegex);
  return match ? parseInt(match[1]) : null;
}

function extractFeedback(text: string, category: string): string {
  const feedbackRegex = new RegExp(`${category}:?\\s*(.+?)(?:\\n|$)`, 'i');
  const match = text.match(feedbackRegex);
  return match ? match[1].trim() : `${category} feedback not available`;
}

function extractList(text: string, category: string): string[] {
  const listRegex = new RegExp(`${category}:?\\s*([\\s\\S]*?)(?:\\n\\n|$)`, 'i');
  const match = text.match(listRegex);
  
  if (match) {
    return match[1]
      .split('\n')
      .map(item => item.replace(/^[-*•]\s*/, '').trim())
      .filter(item => item.length > 0);
  }
  
  return [];
}

async function logCodeEvaluation(request: CodeEvaluationRequest, evaluation: CodeEvaluationResponse) {
  try {
    console.log('Code Evaluation Logged:', {
      timestamp: new Date().toISOString(),
      task: request.task_description,
      overall_score: evaluation.overall_score,
      model_used: evaluation.ai_model_used,
      files_modified: request.files_modified.length
    });
  } catch (error) {
    console.error('Failed to log code evaluation:', error);
  }
}
