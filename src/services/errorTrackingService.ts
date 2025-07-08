import { supabase } from '@/integrations/supabase/client';

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  success?: boolean;
  additionalData?: Record<string, unknown>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

class ErrorTrackingService {
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

      // Log critical errors to console for immediate attention
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

  async logJavaScriptError(error: Error, context?: ErrorContext): Promise<void> {
    const contextData = context && typeof context === 'object' ? {
      ...context,
      component: context.component || 'unknown'
    } : {
      component: 'unknown'
    };

    await this.logError(
      'javascript_error',
      error.message,
      'high',
      contextData,
      error.stack
    );
  }

  async logAPIError(
    endpoint: string,
    method: string,
    status: number,
    message: string,
    context?: ErrorContext
  ): Promise<void> {
    const severity: ErrorSeverity = status >= 500 ? 'critical' : status >= 400 ? 'high' : 'medium';
    
    const contextData = context && typeof context === 'object' ? {
      ...context,
      endpoint,
      method,
      statusCode: status
    } : {
      endpoint,
      method,
      statusCode: status
    };

    await this.logError(
      'api_error',
      `${method} ${endpoint}: ${message}`,
      severity,
      contextData
    );
  }

  async logUserAction(
    action: string,
    success: boolean,
    context?: ErrorContext
  ): Promise<void> {
    if (!success) {
      const contextData = context && typeof context === 'object' ? {
        ...context,
        action,
        success
      } : {
        action,
        success
      };

      await this.logError(
        'user_action_failed',
        `User action failed: ${action}`,
        'medium',
        contextData
      );
    }
  }

  async getErrorStats(days: number = 7): Promise<unknown> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('error_logs')
      .select('severity, error_type, created_at')
      .gte('created_at', startDate);

    if (error) throw error;

    const stats = {
      total: data.length,
      bySeverity: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      trend: [] as Array<{ date: string; count: number }>
    };

    data.forEach(log => {
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      stats.byType[log.error_type] = (stats.byType[log.error_type] || 0) + 1;
    });

    return stats;
  }

  async resolveError(errorId: string, notes?: string): Promise<void> {
    const updateData: Record<string, unknown> = {
      resolved: true,
      resolved_at: new Date().toISOString()
    };

    if (notes) {
      const { data: currentError } = await supabase
        .from('error_logs')
        .select('context')
        .eq('id', errorId)
        .single();

      if (currentError && currentError.context && typeof currentError.context === 'object') {
        updateData.context = {
          ...currentError.context,
          resolution_notes: notes
        };
      }
    }

    await supabase
      .from('error_logs')
      .update(updateData)
      .eq('id', errorId);
  }
}

export const errorTrackingService = new ErrorTrackingService();

// Global error handler
window.addEventListener('error', (event) => {
  errorTrackingService.logJavaScriptError(event.error, {
    component: 'global_error_handler',
    additionalData: {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorTrackingService.logError(
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
});
