
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModelHealthCheck {
  model: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  error?: string;
}

interface SystemHealthResponse {
  overall_status: 'healthy' | 'degraded' | 'down';
  models: ModelHealthCheck[];
  database_status: 'connected' | 'disconnected';
  timestamp: string;
  recommendations: string[];
}

const testOpenAI = async (): Promise<ModelHealthCheck> => {
  const startTime = Date.now();
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: 'Health check' }],
        max_tokens: 5
      }),
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return { model: 'GPT-4o', status: 'healthy', responseTime };
    } else {
      return { 
        model: 'GPT-4o', 
        status: 'degraded', 
        responseTime, 
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      model: 'GPT-4o', 
      status: 'down', 
      responseTime: Date.now() - startTime, 
      error: error.message 
    };
  }
};

const testClaude = async (): Promise<ModelHealthCheck> => {
  const startTime = Date.now();
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('CLAUDE_API_KEY'),
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 5,
        messages: [{ role: 'user', content: 'Health check' }]
      }),
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return { model: 'Claude-4', status: 'healthy', responseTime };
    } else {
      return { 
        model: 'Claude-4', 
        status: 'degraded', 
        responseTime, 
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      model: 'Claude-4', 
      status: 'down', 
      responseTime: Date.now() - startTime, 
      error: error.message 
    };
  }
};

const testGemini = async (): Promise<ModelHealthCheck> => {
  const startTime = Date.now();
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Health check' }] }],
        generationConfig: { maxOutputTokens: 5 }
      }),
    });
    
    const responseTime = Date.now() - startTime;
    
    if (response.ok) {
      return { model: 'Gemini-2.5-Pro', status: 'healthy', responseTime };
    } else {
      return { 
        model: 'Gemini-2.5-Pro', 
        status: 'degraded', 
        responseTime, 
        error: `HTTP ${response.status}` 
      };
    }
  } catch (error) {
    return { 
      model: 'Gemini-2.5-Pro', 
      status: 'down', 
      responseTime: Date.now() - startTime, 
      error: error.message 
    };
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Test database connection
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await supabase.from('vendors').select('id').limit(1);
      databaseStatus = 'connected';
    } catch (error) {
      console.error('Database connection test failed:', error);
    }

    // Test all AI models concurrently
    const [openaiResult, claudeResult, geminiResult] = await Promise.all([
      testOpenAI(),
      testClaude(),
      testGemini()
    ]);

    const models = [openaiResult, claudeResult, geminiResult];
    
    // Determine overall status
    const healthyModels = models.filter(m => m.status === 'healthy').length;
    const downModels = models.filter(m => m.status === 'down').length;
    
    let overallStatus: 'healthy' | 'degraded' | 'down';
    if (healthyModels === models.length && databaseStatus === 'connected') {
      overallStatus = 'healthy';
    } else if (downModels === models.length || databaseStatus === 'disconnected') {
      overallStatus = 'down';
    } else {
      overallStatus = 'degraded';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (databaseStatus === 'disconnected') {
      recommendations.push('Database connection failed - check Supabase configuration');
    }
    
    models.forEach(model => {
      if (model.status === 'down') {
        recommendations.push(`${model.model} is down - check API key and service status`);
      } else if (model.status === 'degraded') {
        recommendations.push(`${model.model} is degraded - monitor response times`);
      }
    });
    
    if (healthyModels < models.length) {
      recommendations.push('Enable fallback mechanisms for failed AI models');
    }
    
    if (models.some(m => m.responseTime > 5000)) {
      recommendations.push('High response times detected - consider implementing caching');
    }

    const response: SystemHealthResponse = {
      overall_status: overallStatus,
      models,
      database_status: databaseStatus,
      timestamp: new Date().toISOString(),
      recommendations
    };

    // Log health check results
    console.log('System Health Check Results:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse: SystemHealthResponse = {
      overall_status: 'down',
      models: [],
      database_status: 'disconnected',
      timestamp: new Date().toISOString(),
      recommendations: ['System health check failed - investigate infrastructure issues']
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
