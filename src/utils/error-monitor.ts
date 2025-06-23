
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
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
  additionalData?: Record<string, any>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

class ErrorMonitorService {
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
    
    this.setupGlobalErrorHandlers();
    this.setupPerformanceMonitoring();
    this.isInitialized = true;
    
    console.log('🤖 AI Error Monitor: Initialized with global handlers');
  }

  private setupGlobalErrorHandlers() {
    // Global JavaScript error handler
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript_error',
        message: event.error?.message || event.message || 'Unknown JavaScript error',
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || String(event.reason) || 'Unhandled promise rejection',
        stack: event.reason?.stack
      });
    });

    // React error boundary fallback
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('React') || message.includes('component')) {
        this.handleError({
          type: 'react_error',
          message: message,
          context: { args }
        });
      }
      originalConsoleError.apply(console, args);
    };
  }

  private setupPerformanceMonitoring() {
    // Monitor page load performance
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = perfData.loadEventEnd - perfData.loadEventStart;
      
      if (loadTime > 3000) { // Slow load threshold
        this.handleError({
          type: 'performance_issue',
          message: `Slow page load detected: ${loadTime}ms`,
          context: { loadTime, perfData }
        });
      }
    });
  }

  async handleError(errorData: {
    type: string;
    message: string;
    stack?: string;
    context?: any;
    filename?: string;
    lineno?: number;
    colno?: number;
  }) {
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

  private async triggerAutoFix(errorData: any) {
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

// Initialize the error monitor
const errorMonitor = ErrorMonitorService.getInstance();

// Auto-initialize when the module loads
if (typeof window !== 'undefined') {
  errorMonitor.initialize();
}

export { errorMonitor };
export default ErrorMonitorService;
