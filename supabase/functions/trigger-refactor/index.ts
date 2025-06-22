
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
    const { task, implementation, code } = await req.json();
    console.log('🔄 Trigger Refactor Starting for:', task);

    if (!task && !code) {
      return new Response(JSON.stringify({ 
        error: "Missing task or code to evaluate" 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Step 1: Run QA Review
    console.log('📋 Step 1: Running QA Review...');
    const qaResponse = await supabase.functions.invoke('ai-task-review', {
      body: { task, implementation: implementation || code }
    });

    if (qaResponse.error) {
      throw new Error(`QA Review failed: ${qaResponse.error.message}`);
    }

    const review = qaResponse.data?.review || '';
    console.log('📋 QA Review completed');

    // Step 2: Check if refactor is needed
    const triggerWords = ['incomplete', 'error', 'fail', 'bug', 'missing', 'should improve', 'fix', 'refactor', 'optimize'];
    const needsRefactor = triggerWords.some(word =>
      review.toLowerCase().includes(word)
    );

    if (!needsRefactor) {
      console.log('✅ QA Passed - No refactor needed');
      
      await supabase.from('system_logs').insert({
        log_type: 'refactor_trigger',
        component: 'trigger_refactor',
        message: 'QA passed - no refactor needed',
        metadata: {
          task,
          review,
          needs_refactor: false,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

      return new Response(JSON.stringify({
        status: "QA Passed",
        review,
        needs_refactor: false,
        confidence: 90
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('⚠️ QA Issues Found - Triggering Refactor Process...');

    // Step 3: Trigger AI Error Fix
    const fixResponse = await supabase.functions.invoke('ai-error-fix', {
      body: {
        message: `QA Review identified issues: ${review}`,
        task,
        implementation: implementation || code,
        source: "QA Review Process"
      }
    });

    if (fixResponse.error) {
      console.error('Fix generation failed:', fixResponse.error);
    }

    // Step 4: Run Code Evaluation on original code
    const evalResponse = await supabase.functions.invoke('ai-code-evaluator', {
      body: {
        code: implementation || code,
        context: `Post-QA evaluation for task: ${task}`
      }
    });

    if (evalResponse.error) {
      console.error('Code evaluation failed:', evalResponse.error);
    }

    // Compile results
    const result = {
      status: "Refactor Triggered",
      qa_review: review,
      needs_refactor: true,
      fix_suggestions: fixResponse.data?.fix || "Fix generation failed",
      code_evaluation: evalResponse.data?.evaluation || "Evaluation failed",
      overall_confidence: evalResponse.data?.scores?.overall || 50,
      next_actions: [
        "Apply suggested fixes",
        "Re-run QA after implementing changes",
        "Test functionality thoroughly",
        "Monitor for improvements"
      ],
      timestamp: new Date().toISOString()
    };

    // Log the refactor trigger
    await supabase.from('system_logs').insert({
      log_type: 'refactor_trigger',
      component: 'trigger_refactor',
      message: `Refactor triggered for task: ${task}`,
      metadata: {
        task,
        qa_review: review,
        fix_suggestions: result.fix_suggestions,
        overall_confidence: result.overall_confidence,
        timestamp: result.timestamp
      },
      severity: 'warning'
    });

    console.log('🔄 Refactor process completed');

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Trigger Refactor Failed:', error);
    
    return new Response(JSON.stringify({
      error: "Refactor trigger failed",
      details: error.message,
      status: "Failed"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
