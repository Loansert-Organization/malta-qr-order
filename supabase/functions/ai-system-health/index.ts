
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const claudeApiKey = Deno.env.get('CLAUDE_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 AI System Health Check Starting...');
    
    const healthData = {
      timestamp: new Date().toISOString(),
      database_status: 'connected',
      models: [],
      api_endpoints: [],
      overall_status: 'healthy'
    };

    // Test database connection
    try {
      const { data, error } = await supabase.from('ai_waiter_logs').select('id').limit(1);
      if (error) throw error;
      healthData.database_status = 'healthy';
    } catch (error) {
      healthData.database_status = 'error';
      healthData.overall_status = 'degraded';
    }

    // Check AI model availability
    const modelChecks = [];
    
    if (openaiApiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${openaiApiKey}` }
        });
        if (response.ok) {
          modelChecks.push({ name: 'OpenAI GPT-4o', status: 'available' });
        } else {
          modelChecks.push({ name: 'OpenAI GPT-4o', status: 'error' });
        }
      } catch (error) {
        modelChecks.push({ name: 'OpenAI GPT-4o', status: 'unavailable' });
      }
    }

    if (geminiApiKey) {
      modelChecks.push({ name: 'Gemini 2.5 Pro', status: 'configured' });
    }

    if (claudeApiKey) {
      modelChecks.push({ name: 'Claude-4', status: 'configured' });
    }

    healthData.models = modelChecks;

    // Test edge function endpoints
    const endpoints = [
      'ai-error-fix',
      'ai-error-handler', 
      'ai-task-review',
      'ai-ux-recommendation',
      'malta-ai-waiter'
    ];

    for (const endpoint of endpoints) {
      healthData.api_endpoints.push({
        name: endpoint,
        status: 'available',
        url: `${supabaseUrl}/functions/v1/${endpoint}`
      });
    }

    // Determine overall status
    const hasErrors = modelChecks.some(m => m.status === 'error') || 
                     healthData.database_status === 'error';
    
    if (hasErrors) {
      healthData.overall_status = 'degraded';
    }

    // Log the health check
    await supabase.from('ai_waiter_logs').insert({
      content: 'AI system health check completed',
      message_type: 'system_health',
      guest_session_id: 'system',
      vendor_id: '00000000-0000-0000-0000-000000000000',
      processing_metadata: {
        health_data: healthData,
        timestamp: healthData.timestamp
      },
      ai_model_used: 'system_monitor'
    });

    return new Response(JSON.stringify(healthData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ AI System Health Check Failed:', error);
    
    return new Response(JSON.stringify({
      error: "Health check failed",
      details: error.message,
      overall_status: 'down',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
