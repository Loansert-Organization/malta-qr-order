
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AISupervisionHook {
  reviewTask: (taskName: string, componentCode?: string, context?: any) => Promise<any>;
  fixError: (error: Error, componentName: string, context?: any) => Promise<any>;
  getUXRecommendations: (screenName: string, uiCode?: string, context?: any) => Promise<any>;
}

export const useAISupervision = (): AISupervisionHook => {
  const reviewTask = useCallback(async (taskName: string, componentCode?: string, context?: any) => {
    try {
      console.log('🔍 Requesting AI task review:', taskName);
      
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
      
      console.log('✅ AI task review completed:', data);
      return data;
    } catch (error) {
      console.error('❌ AI task review failed:', error);
      return null;
    }
  }, []);

  const fixError = useCallback(async (error: Error, componentName: string, context?: any) => {
    try {
      console.log('🚨 Requesting AI error fix:', error.message);
      
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
      
      console.log('✅ AI error fix completed:', data);
      return data;
    } catch (fixError) {
      console.error('❌ AI error fix failed:', fixError);
      return null;
    }
  }, []);

  const getUXRecommendations = useCallback(async (screenName: string, uiCode?: string, context?: any) => {
    try {
      console.log('🎨 Requesting AI UX recommendations:', screenName);
      
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
      
      console.log('✅ AI UX recommendations completed:', data);
      return data;
    } catch (error) {
      console.error('❌ AI UX recommendations failed:', error);
      return null;
    }
  }, []);

  return {
    reviewTask,
    fixError,
    getUXRecommendations
  };
};
