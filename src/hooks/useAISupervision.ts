
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AISupervisionHook {
  reviewTask: (taskName: string, componentCode?: string, context?: any) => Promise<any>;
  fixError: (error: Error, componentName: string, context?: any) => Promise<any>;
  getUXRecommendations: (screenName: string, uiCode?: string, context?: any) => Promise<any>;
  logSystemEvent: (eventType: string, message: string, metadata?: any) => Promise<void>;
}

export const useAISupervision = (): AISupervisionHook => {
  const logSystemEvent = useCallback(async (eventType: string, message: string, metadata?: any) => {
    try {
      await supabase.from('ai_waiter_logs').insert({
        content: message,
        message_type: eventType,
        guest_session_id: 'system',
        vendor_id: '00000000-0000-0000-0000-000000000000',
        processing_metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          source: 'useAISupervision'
        },
        ai_model_used: 'system_hook'
      });
    } catch (error) {
      console.error('Failed to log system event:', error);
    }
  }, []);

  const reviewTask = useCallback(async (taskName: string, componentCode?: string, context?: any) => {
    try {
      console.log('🔍 Requesting AI task review:', taskName);
      
      // Log the task review request
      await logSystemEvent('task_review_request', `Task review requested: ${taskName}`, {
        component_code: componentCode,
        context
      });
      
      const { data, error } = await supabase.functions.invoke('ai-task-review', {
        body: {
          task_name: taskName,
          component_code: componentCode,
          screen_name: context?.screenName,
          functionality_description: context?.description || `Task: ${taskName}`,
          current_state: 'completed',
          context
        }
      });

      if (error) throw error;
      
      // Log successful completion
      await logSystemEvent('task_review_completed', `Task review completed: ${taskName}`, {
        result: data
      });
      
      console.log('✅ AI task review completed:', data);
      return data;
    } catch (error) {
      console.error('❌ AI task review failed:', error);
      await logSystemEvent('task_review_failed', `Task review failed: ${taskName}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }, [logSystemEvent]);

  const fixError = useCallback(async (error: Error, componentName: string, context?: any) => {
    try {
      console.log('🚨 Requesting AI error fix:', error.message);
      
      // Log the error fix request
      await logSystemEvent('error_fix_request', `Error fix requested for ${componentName}: ${error.message}`, {
        error_stack: error.stack,
        component_name: componentName,
        context
      });
      
      const { data, error: fixError } = await supabase.functions.invoke('ai-error-fix', {
        body: {
          error_message: error.message,
          error_stack: error.stack,
          component_name: componentName,
          code_context: context?.code,
          user_action: context?.userAction,
          reproduction_steps: context?.steps
        }
      });

      if (fixError) throw fixError;
      
      // Log successful fix
      await logSystemEvent('error_fix_completed', `Error fix completed for ${componentName}`, {
        result: data
      });
      
      console.log('✅ AI error fix completed:', data);
      return data;
    } catch (fixError) {
      console.error('❌ AI error fix failed:', fixError);
      await logSystemEvent('error_fix_failed', `Error fix failed for ${componentName}`, {
        error: fixError instanceof Error ? fixError.message : 'Unknown error'
      });
      return null;
    }
  }, [logSystemEvent]);

  const getUXRecommendations = useCallback(async (screenName: string, uiCode?: string, context?: any) => {
    try {
      console.log('🎨 Requesting AI UX recommendations:', screenName);
      
      // Log the UX recommendation request
      await logSystemEvent('ux_recommendation_request', `UX recommendations requested for ${screenName}`, {
        ui_code: uiCode,
        context
      });
      
      const { data, error } = await supabase.functions.invoke('ai-ux-recommendation', {
        body: {
          screen_name: screenName,
          current_ui_code: uiCode,
          user_context: context?.userContext,
          performance_metrics: context?.performance,
          malta_context: {
            currency: 'EUR',
            language: 'English',
            local_preferences: context?.maltaPreferences
          }
        }
      });

      if (error) throw error;
      
      // Log successful completion
      await logSystemEvent('ux_recommendation_completed', `UX recommendations completed for ${screenName}`, {
        result: data
      });
      
      console.log('✅ AI UX recommendations completed:', data);
      return data;
    } catch (error) {
      console.error('❌ AI UX recommendations failed:', error);
      await logSystemEvent('ux_recommendation_failed', `UX recommendations failed for ${screenName}`, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }, [logSystemEvent]);

  return {
    reviewTask,
    fixError,
    getUXRecommendations,
    logSystemEvent
  };
};
