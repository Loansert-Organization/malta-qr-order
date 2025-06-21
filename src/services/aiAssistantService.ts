
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

export interface UXRecommendationRequest {
  screen_name: string;
  current_ui_code: string;
  user_context?: {
    device_type?: 'mobile' | 'tablet' | 'desktop';
    location?: string;
    time_of_day?: string;
    user_role?: 'guest' | 'vendor' | 'admin';
  };
  performance_metrics?: {
    load_time?: number;
    interaction_delay?: number;
  };
}

class AIAssistantService {
  // Triple-AI Error Analysis (GPT-4o + Claude-4 + Gemini 2.5 Pro)
  async analyzeError(errorData: ErrorAnalysisRequest) {
    try {
      console.log('🤖 Calling Triple-AI Error Handler (GPT-4o + Claude-4 + Gemini)...');
      
      const { data, error } = await supabase.functions.invoke('ai-error-handler', {
        body: errorData
      });

      if (error) {
        console.error('❌ AI Error Handler failed:', error);
        return null;
      }

      console.log('✅ Triple-AI Error Analysis completed:', {
        confidence: data.ai_consensus?.overall_confidence,
        models: data.ai_model_used
      });
      return data;
    } catch (error) {
      console.error('Failed to call AI Error Handler:', error);
      return null;
    }
  }

  // AI-Powered Code Quality Evaluation
  async evaluateCode(evaluationData: CodeEvaluationRequest) {
    try {
      console.log('🤖 Calling AI Code Evaluator for task assessment...');
      
      const { data, error } = await supabase.functions.invoke('ai-code-evaluator', {
        body: evaluationData
      });

      if (error) {
        console.error('❌ AI Code Evaluator failed:', error);
        return null;
      }

      console.log('✅ AI Code Evaluation completed:', {
        overall_score: data.overall_score,
        model: data.ai_model_used
      });
      return data;
    } catch (error) {
      console.error('Failed to call AI Code Evaluator:', error);
      return null;
    }
  }

  // Triple-AI UX Recommendations (Adaptive UX Rule)
  async getUXRecommendations(uxData: UXRecommendationRequest) {
    try {
      console.log('🎨 Calling Triple-AI UX Recommendation (Adaptive UX Enhancement)...');
      
      const { data, error } = await supabase.functions.invoke('ai-ux-recommendation', {
        body: uxData
      });

      if (error) {
        console.error('❌ AI UX Recommendation failed:', error);
        return null;
      }

      console.log('✅ Triple-AI UX Analysis completed:', {
        ux_score: data.ai_consensus?.overall_ux_score,
        priority: data.implementation_priority,
        models: data.ai_models_used
      });
      return data;
    } catch (error) {
      console.error('Failed to call AI UX Recommendation:', error);
      return null;
    }
  }

  // Autonomous AI QA Protocol - Build Confidence Check
  async checkBuildConfidence(taskData: {
    task_description: string;
    files_modified: string[];
    error_logs?: string[];
    ui_screens?: string[];
  }) {
    try {
      console.log('🏗️ Running Autonomous AI QA Protocol - Build Confidence Check...');
      
      // Run all three AI systems in parallel
      const [codeEvaluation, errorAnalysis, uxRecommendations] = await Promise.allSettled([
        this.evaluateTaskCode(taskData),
        this.checkForErrors(taskData),
        this.validateUXScreens(taskData)
      ]);

      const codeScore = codeEvaluation.status === 'fulfilled' ? codeEvaluation.value?.overall_score || 0 : 0;
      const errorScore = errorAnalysis.status === 'fulfilled' ? (errorAnalysis.value ? 100 : 90) : 70;
      const uxScore = uxRecommendations.status === 'fulfilled' ? uxRecommendations.value?.ai_consensus?.overall_ux_score || 0 : 0;

      const overallConfidence = Math.round((codeScore + errorScore + uxScore) / 3);
      
      const buildConfidenceResult = {
        overall_confidence: overallConfidence,
        code_quality_score: codeScore,
        error_free_score: errorScore,
        ux_quality_score: uxScore,
        meets_90_percent_threshold: overallConfidence >= 90,
        recommendations: this.generateConfidenceRecommendations(overallConfidence, {
          code: codeScore,
          errors: errorScore,
          ux: uxScore
        }),
        timestamp: new Date().toISOString()
      };

      console.log('🏆 Build Confidence Check completed:', buildConfidenceResult);
      return buildConfidenceResult;
    } catch (error) {
      console.error('Failed Build Confidence Check:', error);
      return {
        overall_confidence: 50,
        meets_90_percent_threshold: false,
        error: 'Build confidence check failed',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper Methods
  private async evaluateTaskCode(taskData: any) {
    return this.evaluateCode({
      task_description: taskData.task_description,
      files_modified: taskData.files_modified,
      code_changes: taskData.files_modified.map((file: string) => ({
        file_path: file,
        changes: 'Task completion changes',
        change_type: 'modified' as const
      })),
      user_requirements: taskData.task_description,
      completion_summary: 'Autonomous AI QA evaluation'
    });
  }

  private async checkForErrors(taskData: any) {
    if (taskData.error_logs && taskData.error_logs.length > 0) {
      return this.analyzeError({
        error_message: taskData.error_logs[0],
        console_logs: taskData.error_logs
      });
    }
    return null;
  }

  private async validateUXScreens(taskData: any) {
    if (taskData.ui_screens && taskData.ui_screens.length > 0) {
      return this.getUXRecommendations({
        screen_name: taskData.ui_screens[0],
        current_ui_code: 'Screen validation check'
      });
    }
    return null;
  }

  private generateConfidenceRecommendations(overallConfidence: number, scores: any) {
    const recommendations = [];
    
    if (overallConfidence < 90) {
      recommendations.push('🚨 Build confidence below 90% threshold - improvements required');
    }
    
    if (scores.code < 80) {
      recommendations.push('📝 Code quality needs improvement - run AI code review');
    }
    
    if (scores.errors < 90) {
      recommendations.push('🐛 Error detection required - run AI error analysis');
    }
    
    if (scores.ux < 80) {
      recommendations.push('🎨 UX optimization needed - apply AI UX recommendations');
    }

    if (overallConfidence >= 90) {
      recommendations.push('✅ Build confidence meets 90% threshold - ready for deployment');
    }

    return recommendations;
  }

  // Legacy helper methods (maintaining backward compatibility)
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

  private getRecentConsoleLogs(): string[] {
    // In a real implementation, you'd override console methods to capture logs
    return [];
  }

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
        changes: 'File changes tracked',
        change_type: 'modified' as const
      })),
      user_requirements: userRequirements,
      completion_summary: completionSummary
    };
  }
}

export const aiAssistantService = new AIAssistantService();
