
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('🛡️ AI Error Handler - Logging Error:', body.message);

    const log = {
      message: body.message || "Unknown error",
      stack: body.stack || "No stack trace",
      source: body.source || "unknown",
      context: body.context || {},
      event_type: body.eventType || "error",
      component: body.component || "unknown",
      timestamp: new Date().toISOString()
    };

    // Insert into ai_waiter_logs table
    const { error: logError } = await supabase.from('ai_waiter_logs').insert({
      content: log.message,
      message_type: 'error_handler',
      guest_session_id: 'system',
      vendor_id: '00000000-0000-0000-0000-000000000000',
      processing_metadata: {
        stack: log.stack,
        source: log.source,
        context: log.context,
        event_type: log.event_type,
        component: log.component,
        timestamp: log.timestamp
      },
      ai_model_used: 'error_handler'
    });

    if (logError) {
      console.error('Failed to log to database:', logError);
    }

    // Also log to console for immediate visibility
    console.log("📋 Error logged to system:", log);

    // Determine if this error needs immediate attention
    const needsAttention = checkIfCritical(log.message, log.stack);

    return new Response(JSON.stringify({ 
      status: "logged", 
      log,
      needs_attention: needsAttention,
      suggestions: generateBasicSuggestions(log.message)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('❌ Error Handler Failed:', err);
    
    return new Response(JSON.stringify({
      error: "Log handler failed",
      details: err.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function checkIfCritical(message: string, stack: string): boolean {
  const criticalKeywords = ['cannot read properties', 'undefined', 'null', 'crash', 'fatal', 'failed to fetch'];
  const messageText = (message + ' ' + stack).toLowerCase();
  
  return criticalKeywords.some(keyword => messageText.includes(keyword));
}

function generateBasicSuggestions(message: string): string[] {
  const suggestions = ['Check console logs for more details'];
  
  if (message.includes('undefined') || message.includes('null')) {
    suggestions.push('Verify object properties exist before accessing them');
    suggestions.push('Add null/undefined checks or optional chaining');
  }
  
  if (message.includes('fetch') || message.includes('network')) {
    suggestions.push('Check network connectivity and API endpoints');
    suggestions.push('Verify API keys and authentication');
  }
  
  if (message.includes('import') || message.includes('module')) {
    suggestions.push('Verify import paths and module exports');
    suggestions.push('Check if dependencies are properly installed');
  }
  
  return suggestions;
}
