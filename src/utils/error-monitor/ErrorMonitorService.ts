
import { supabase } from '@/integrations/supabase/client';
import { ErrorContext, ErrorSeverity } from './types';

export class ErrorMonitorService {
  private static instance: ErrorMonitorService;
  private isInitialized = false;

  static getInstance(): ErrorMonitorService {
    if (!ErrorMonitorService.instance) {
      ErrorMonitorService.instance = new ErrorMonitorService();
    }
    return ErrorMonitorService.instance;
  }

  initialize(): void {
    if (this.isInitialized) return;

    // Set up global error handlers
    window.addEventListener('error', this.handleGlobalError.bind(this));
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));

    this.isInitialized = true;
    console.log('Error monitor initialized');
  }

  private handleGlobalError(event: ErrorEvent): void {
    this.logError('javascript_error', event.error?.message || 'Unknown error', 'high', {
      component: 'global_error_handler',
      additionalData: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    }, event.error?.stack);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent): void {
    this.logError(
      'unhandled_promise_rejection',
      event.reason?.message || 'Unhandled promise rejection',
      'high',
      {
        component: 'promise_rejection_handler',
        additionalData: {
          reason: event.reason
        }
      }
    );
  }

  async logError(
    errorType: string,
    errorMessage: string,
    severity: ErrorSeverity = 'medium',
    context?: ErrorContext,
    stackTrace?: string
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const baseContext = {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      const contextData = context && typeof context === 'object' ? {
        ...baseContext,
        ...context
      } : baseContext;

      await supabase.from('error_logs').insert({
        error_type: errorType,
        error_message: errorMessage,
        stack_trace: stackTrace,
        user_id: user?.id || null,
        context: contextData,
        severity
      });

      if (severity === 'critical') {
        console.error(`🚨 CRITICAL ERROR: ${errorType}`, {
          message: errorMessage,
          context: contextData,
          stackTrace
        });
      }
    } catch (error) {
      console.error('Failed to log error to database:', error);
    }
  }

  async getErrorStats(days: number = 7): Promise<any> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('error_logs')
      .select('severity, error_type, created_at')
      .gte('created_at', startDate);

    if (error) throw error;

    const stats = {
      total: data.length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>
    };

    data.forEach(log => {
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      stats.byType[log.error_type] = (stats.byType[log.error_type] || 0) + 1;
    });

    return stats;
  }
}
