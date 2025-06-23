
import { supabase } from '@/integrations/supabase/client';
import { setupGlobalErrorHandlers } from './globalHandlers';
import { setupPerformanceMonitoring } from './performanceMonitor';
import type { ErrorContext, ErrorSeverity, ErrorData } from './types';

export class ErrorMonitorService {
  private static instance: ErrorMonitorService;
  private isInitialized = false;

  static getInstance(): ErrorMonitorService {
    if (!ErrorMonitorService.instance) {
      ErrorMonitorService.instance = new ErrorMonitorService();
    }
    return ErrorMonitorService.instance;
  }

  initialize() {
    if (this.isInitialized) return;
    
    setupGlobalErrorHandlers(this.handleError.bind(this));
    setupPerformanceMonitoring(this.handleError.bind(this));
    this.isInitialized = true;
    
    console.log('🤖 AI Error Monitor: Initialized with global handlers');
  }

  async handleError(errorData: ErrorData) {
    try {
      console.error('🤖 AI Monitor: Capturing error →', errorData.type, errorData.message);

      // Log to AI error handler edge function
      const { data, error } = await supabase.functions.invoke('ai-error-handler', {
        body: {
          message: errorData.message,
          stack: errorData.stack,
          source: errorData.filename || 'unknown',
          context: {
            type: errorData.type,
            lineno: errorData.lineno,
            colno: errorData.colno,
            ...errorData.context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
          },
          eventType: errorData.type,
          component: this.extractComponentFromStack(errorData.stack)
        }
      });

      if (error) {
        console.error('Failed to log error to AI handler:', error);
        return;
      }

      console.log('✅ AI Error logged successfully:', data);

      // If critical error, attempt auto-fix
      if (this.isCriticalError(errorData.message)) {
        console.log('🤖 AI Monitor: Triggering error → ai-error-fix');
        await this.triggerAutoFix(errorData);
      }

    } catch (err) {
      console.error('Error monitor failed:', err);
    }
  }

  private isCriticalError(message: string): boolean {
    const criticalKeywords = [
      'cannot read properties',
      'undefined',
      'null',
      'crash',
      'fatal',
      'failed to fetch',
      'network error',
      'authentication failed'
    ];
    
    const lowerMessage = message.toLowerCase();
    return criticalKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private async triggerAutoFix(errorData: ErrorData) {
    try {
      const { data: fixData, error: fixError } = await supabase.functions.invoke('ai-error-fix', {
        body: {
          message: errorData.message,
          stack: errorData.stack,
          source: errorData.filename,
          context: errorData.context
        }
      });

      if (fixError) {
        console.error('AI auto-fix failed:', fixError);
        return;
      }

      console.log('✅ AI Function (error) → ai-error-fix:', fixData);
    } catch (err) {
      console.error('Auto-fix trigger failed:', err);
    }
  }

  private extractComponentFromStack(stack?: string): string {
    if (!stack) return 'unknown';
    
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('.tsx') || line.includes('.ts')) {
        const match = line.match(/\/([^\/]+\.(tsx?|jsx?))/);
        if (match) return match[1];
      }
    }
    
    return 'unknown';
  }

  // Manual error reporting method
  async reportError(message: string, context?: ErrorContext, severity: ErrorSeverity = 'medium') {
    await this.handleError({
      type: 'manual_report',
      message,
      context: {
        ...context,
        severity,
        manual: true
      }
    });
  }

  // Performance monitoring
  async reportPerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      await this.handleError({
        type: 'performance_issue',
        message: `Performance threshold exceeded: ${metric} = ${value} (threshold: ${threshold})`,
        context: { metric, value, threshold }
      });
    }
  }

  // API call monitoring
  async monitorAPICall(endpoint: string, method: string, startTime: number, success: boolean, statusCode?: number) {
    const duration = Date.now() - startTime;
    
    if (!success || (statusCode && statusCode >= 400)) {
      await this.handleError({
        type: 'api_error',
        message: `API call failed: ${method} ${endpoint} (${statusCode || 'unknown'}) - ${duration}ms`,
        context: { endpoint, method, duration, statusCode, success }
      });
    } else if (duration > 5000) {
      await this.handleError({
        type: 'api_performance',
        message: `Slow API call: ${method} ${endpoint} - ${duration}ms`,
        context: { endpoint, method, duration, statusCode, success }
      });
    }
  }
}
