
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_EDGE_BASE = "https://nireplgrlwhwppjtfxbb.supabase.co/functions/v1";

type EventType = "error" | "codeGenerated" | "taskComplete" | "uiLoaded" | "manualReview";

const ENDPOINTS: Record<EventType, string> = {
  error: "ai-error-fix",
  codeGenerated: "ai-code-evaluator", 
  taskComplete: "ai-task-review",
  uiLoaded: "ai-ux-recommendation",
  manualReview: "ai-error-handler"
};

export async function aiMonitor(
  eventType: EventType,
  payload: Record<string, any> = {}
): Promise<any> {
  const endpoint = ENDPOINTS[eventType];
  if (!endpoint) {
    console.warn(`[aiMonitor] Unknown event: ${eventType}`);
    return;
  }

  try {
    console.log(`🤖 AI Monitor: Triggering ${eventType} → ${endpoint}`);
    
    const response = await supabase.functions.invoke(endpoint, {
      body: {
        timestamp: new Date().toISOString(),
        eventType,
        ...payload
      }
    });

    if (response.error) {
      console.error(`[aiMonitor] Error calling ${endpoint}:`, response.error);
      return null;
    }

    console.log(`✅ AI Function (${eventType}) → ${endpoint}:`, response.data);
    
    // Log to system for tracking
    await logAIEvent(eventType, endpoint, response.data, payload);
    
    return response.data;
  } catch (err) {
    console.error(`[aiMonitor] Failed to call ${endpoint}:`, err);
    return null;
  }
}

async function logAIEvent(eventType: string, endpoint: string, result: any, payload: any) {
  try {
    await supabase.from('ai_waiter_logs').insert({
      content: `AI function ${endpoint} triggered for ${eventType}`,
      message_type: eventType,
      guest_session_id: 'system',
      vendor_id: '00000000-0000-0000-0000-000000000000',
      processing_metadata: {
        endpoint,
        payload,
        result,
        timestamp: new Date().toISOString()
      },
      ai_model_used: 'system_monitor'
    });
  } catch (error) {
    console.error('Failed to log AI event:', error);
  }
}

// Global error handler setup
export function setupGlobalAIErrorHandling() {
  window.onerror = (msg, src, lineno, colno, error) => {
    aiMonitor("error", {
      message: msg,
      source: src,
      line: lineno,
      column: colno,
      stack: error?.stack || "N/A"
    });
  };

  window.addEventListener('unhandledrejection', (event) => {
    aiMonitor("error", {
      message: "Unhandled Promise Rejection",
      source: "Promise",
      stack: event.reason?.stack || event.reason || "N/A"
    });
  });
}

// Automated QA flow
export async function runQAFlow(task: string, implementation: string) {
  console.log('🧪 Starting AI QA Flow...');
  
  // Step 1: Review the task
  const reviewResult = await aiMonitor("taskComplete", {
    task,
    implementation
  });
  
  if (!reviewResult) {
    console.error('❌ Task review failed');
    return false;
  }
  
  // Step 2: Check if review indicates issues
  const reviewText = reviewResult.review || '';
  const hasIssues = ['incomplete', 'error', 'fail', 'bug', 'missing', 'should improve', 'fix']
    .some(word => reviewText.toLowerCase().includes(word));
  
  if (!hasIssues) {
    console.log('✅ QA Passed - No issues found');
    return true;
  }
  
  console.log('⚠️ QA Found Issues - Triggering Auto-Fix...');
  
  // Step 3: Trigger error fix
  const fixResult = await aiMonitor("error", {
    message: `QA Review found issues: ${reviewText}`,
    task,
    implementation,
    source: "QA Review"
  });
  
  if (fixResult) {
    console.log('🔧 Auto-fix suggestions received:', fixResult);
    
    // Step 4: Re-evaluate after suggestions
    await aiMonitor("codeGenerated", {
      code: implementation,
      context: `Post-fix evaluation for task: ${task}`
    });
  }
  
  return false;
}
