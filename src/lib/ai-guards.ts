
import { supabase } from '@/integrations/supabase/client';
import { SYSTEM_UUID } from './constants';

export class AIGuard {
  static async logError(error: Error, context: any): Promise<void> {
    try {
      await supabase.from('system_logs').insert({
        log_type: 'error',
        component: context.component || 'unknown',
        message: error.message,
        metadata: {
          stack: error.stack,
          context,
          timestamp: new Date().toISOString()
        },
        severity: 'error'
      });
    } catch (logError) {
      console.error('Failed to log error to database:', logError);
    }
  }

  static async handleComponentError(error: Error, componentName: string): Promise<void> {
    console.error(`Error in ${componentName}:`, error);
    
    await this.logError(error, { component: componentName });
    
    // Trigger AI error handler if available
    try {
      await supabase.functions.invoke('ai-error-handler', {
        body: {
          error: error.message,
          component: componentName,
          stack: error.stack,
          vendor_id: SYSTEM_UUID
        }
      });
    } catch (aiError) {
      console.warn('AI error handler failed:', aiError);
    }
  }

  static async validateTypeScript(code: string, context: string): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('ai-code-evaluator', {
        body: { 
          code, 
          context,
          vendor_id: SYSTEM_UUID
        }
      });
      return response.data?.isValid || false;
    } catch (error) {
      console.warn('TypeScript validation failed:', error);
      return false;
    }
  }
}

// Error boundary hook
export const useAIErrorHandler = (componentName: string) => {
  const handleError = async (error: Error) => {
    await AIGuard.handleComponentError(error, componentName);
  };

  return { handleError };
};
