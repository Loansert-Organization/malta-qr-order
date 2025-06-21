
import { supabase } from '@/integrations/supabase/client';

export interface ErrorAnalysisRequest {
  error_message: string;
  error_stack?: string;
  file_path?: string;
  code_context?: string;
  user_action?: string;
  browser_info?: string;
  console_logs?: string[];
}

export interface CodeEvaluationRequest {
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

class AIAssistantService {
  async analyzeError(errorData: ErrorAnalysisRequest) {
    try {
      console.log('🤖 Calling AI Error Handler for error analysis...');
      
      const { data, error } = await supabase.functions.invoke('ai-error-handler', {
        body: errorData
      });

      if (error) {
        console.error('AI Error Handler failed:', error);
        return null;
      }

      console.log('✅ AI Error Analysis completed:', data);
      return data;
    } catch (error) {
      console.error('Failed to call AI Error Handler:', error);
      return null;
    }
  }

  async evaluateCode(evaluationData: CodeEvaluationRequest) {
    try {
      console.log('🤖 Calling AI Code Evaluator for task assessment...');
      
      const { data, error } = await supabase.functions.invoke('ai-code-evaluator', {
        body: evaluationData
      });

      if (error) {
        console.error('AI Code Evaluator failed:', error);
        return null;
      }

      console.log('✅ AI Code Evaluation completed:', data);
      return data;
    } catch (error) {
      console.error('Failed to call AI Code Evaluator:', error);
      return null;
    }
  }

  // Helper method to automatically capture error context
  captureErrorContext(error: Error, additionalContext?: Partial<ErrorAnalysisRequest>): ErrorAnalysisRequest {
    return {
      error_message: error.message,
      error_stack: error.stack,
      file_path: additionalContext?.file_path,
      code_context: additionalContext?.code_context,
      user_action: additionalContext?.user_action,
      browser_info: `${navigator.userAgent} - ${window.location.href}`,
      console_logs: this.getRecentConsoleLogs(),
      ...additionalContext
    };
  }

  // Helper method to capture console logs
  private getRecentConsoleLogs(): string[] {
    // In a real implementation, you'd need to override console methods to capture logs
    // For now, return an empty array
    return [];
  }

  // Helper method to format code evaluation requests
  formatCodeEvaluation(
    taskDescription: string,
    filesModified: string[],
    userRequirements: string,
    completionSummary: string
  ): CodeEvaluationRequest {
    return {
      task_description: taskDescription,
      files_modified: filesModified,
      code_changes: filesModified.map(file => ({
        file_path: file,
        changes: 'File changes tracked', // In practice, you'd capture actual changes
        change_type: 'modified' as const
      })),
      user_requirements: userRequirements,
      completion_summary: completionSummary
    };
  }
}

export const aiAssistantService = new AIAssistantService();
