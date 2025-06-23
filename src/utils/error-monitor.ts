
import { createClient } from '@supabase/supabase-js';
import React from 'react';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorContext {
  userId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  action?: string;
  additionalData?: Record<string, any>;
}

export interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode?: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export class ErrorMonitor {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async logError(
    error: Error | string,
    severity: ErrorSeverity = 'medium',
    context: ErrorContext = {}
  ): Promise<void> {
    try {
      const errorMessage = typeof error === 'string' ? error : error.message;
      const stackTrace = typeof error === 'string' ? undefined : error.stack;

      await this.supabase
        .from('error_logs')
        .insert({
          error_type: this.getErrorType(error),
          error_message: errorMessage,
          stack_trace: stackTrace,
          user_id: context.userId,
          context: context,
          severity: severity
        });

      if (severity === 'critical') {
        await this.sendCriticalAlert(errorMessage, context);
      }

      console.error(`[${severity.toUpperCase()}] ${errorMessage}`, {
        context,
        stack: stackTrace
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  async logPerformance(metric: PerformanceMetric): Promise<void> {
    try {
      await this.supabase
        .from('performance_logs')
        .insert({
          endpoint: metric.endpoint,
          method: metric.method,
          response_time: metric.responseTime,
          status_code: metric.statusCode,
          user_id: metric.userId,
          metadata: metric.metadata
        });

      if (metric.responseTime > 5000) {
        await this.logError(
          `Slow response detected: ${metric.endpoint} took ${metric.responseTime}ms`,
          'high',
          { endpoint: metric.endpoint, responseTime: metric.responseTime }
        );
      }
    } catch (error) {
      console.error('Failed to log performance metric:', error);
    }
  }

  async trackEvent(
    eventName: string,
    properties: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('analytics_events')
        .insert({
          event_name: eventName,
          user_id: userId,
          session_id: this.getSessionId(),
          properties: properties
        });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async storeMetric(
    metricName: string,
    value: number,
    dimensions: Record<string, any> = {}
  ): Promise<void> {
    try {
      await this.supabase
        .from('analytics_metrics')
        .insert({
          metric_name: metricName,
          metric_value: value,
          dimensions: dimensions
        });
    } catch (error) {
      console.error('Failed to store metric:', error);
    }
  }

  async getErrorSummary(days: number = 7): Promise<any> {
    try {
      const { data } = await this.supabase
        .from('error_logs')
        .select('severity, error_type, count(*)')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('count', { ascending: false });

      return data;
    } catch (error) {
      console.error('Failed to get error summary:', error);
      return [];
    }
  }

  async getPerformanceMetrics(endpoint?: string, days: number = 7): Promise<any> {
    try {
      let query = this.supabase
        .from('performance_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

      if (endpoint) {
        query = query.eq('endpoint', endpoint);
      }

      const { data } = await query.order('created_at', { ascending: false });
      return data;
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return [];
    }
  }

  private getErrorType(error: Error | string): string {
    if (typeof error === 'string') return 'custom_error';
    return error.constructor.name || 'unknown_error';
  }

  private getSessionId(): string {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('session_id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('session_id', sessionId);
      }
      return sessionId;
    }
    return `server_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendCriticalAlert(message: string, context: ErrorContext): Promise<void> {
    try {
      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 Critical Error in ICUPA Malta`,
            attachments: [{
              color: 'danger',
              fields: [
                { title: 'Error', value: message, short: false },
                { title: 'Context', value: JSON.stringify(context, null, 2), short: false },
                { title: 'Time', value: new Date().toISOString(), short: true }
              ]
            }]
          })
        });
      }
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  }
}

export function useErrorMonitor() {
  const monitor = new ErrorMonitor();

  const logError = (error: Error | string, severity: ErrorSeverity = 'medium', context: ErrorContext = {}) => {
    monitor.logError(error, severity, context);
  };

  const trackEvent = (eventName: string, properties: Record<string, any> = {}) => {
    monitor.trackEvent(eventName, properties);
  };

  const logPerformance = (metric: PerformanceMetric) => {
    monitor.logPerformance(metric);
  };

  return { logError, trackEvent, logPerformance };
}

export function withPerformanceMonitoring<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: T) {
    const { logPerformance } = useErrorMonitor();
    
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        logPerformance({
          endpoint: `component_${componentName}`,
          method: 'render',
          responseTime: endTime - startTime,
          metadata: { componentName }
        });
      };
    }, [logPerformance]);

    return React.createElement(Component, props);
  };
}

export function setupGlobalErrorHandling() {
  const monitor = new ErrorMonitor();

  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      monitor.logError(
        event.reason,
        'high',
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          component: 'unhandled_promise_rejection'
        }
      );
    });

    window.addEventListener('error', (event) => {
      monitor.logError(
        event.error || event.message,
        'high',
        {
          url: window.location.href,
          userAgent: navigator.userAgent,
          component: 'javascript_error',
          additionalData: {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
          }
        }
      );
    });
  }

  if (typeof process !== 'undefined') {
    process.on('unhandledRejection', (reason, promise) => {
      monitor.logError(
        reason as Error,
        'critical',
        { component: 'server_unhandled_rejection' }
      );
    });

    process.on('uncaughtException', (error) => {
      monitor.logError(
        error,
        'critical',
        { component: 'server_uncaught_exception' }
      );
    });
  }
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  private monitor = new ErrorMonitor();

  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.monitor.logError(
      error,
      'high',
      {
        component: 'react_error_boundary',
        additionalData: errorInfo
      }
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>We've been notified of this error and are working to fix it.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
