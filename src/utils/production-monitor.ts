// ✨ Refactored by Cursor – Audit Phase 4: Production Monitoring & Analytics
import type { 
  PerformanceMetric,
  ErrorLog,
  SystemLog,
  AnalyticsEvent
} from '@/types/api';

interface MonitoringConfig {
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  enableUserAnalytics: boolean;
  sampleRate: number;
  errorThreshold: number;
  performanceThreshold: number;
}

interface ErrorReport {
  error: Error;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  sessionId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
  stackTrace?: string;
}

interface PerformanceReport {
  metric: string;
  value: number;
  timestamp: string;
  context: Record<string, unknown>;
  sessionId?: string;
  page: string;
}

interface UserEvent {
  event: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

class ProductionMonitor {
  private config: MonitoringConfig;
  private isProduction: boolean;
  private errorBuffer: ErrorReport[] = [];
  private performanceBuffer: PerformanceReport[] = [];
  private eventBuffer: UserEvent[] = [];
  private sessionId: string;
  private batchTimer: number | null = null;
  private readonly BATCH_SIZE = 10;
  private readonly BATCH_INTERVAL = 30000; // 30 seconds

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = {
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enableUserAnalytics: true,
      sampleRate: 1.0, // 100% in production, can reduce if needed
      errorThreshold: 50, // errors per minute before alert
      performanceThreshold: 3000, // 3s page load threshold
      ...config
    };

    this.isProduction = import.meta.env.PROD;
    this.sessionId = this.generateSessionId();
    
    if (this.isProduction) {
      this.initializeMonitoring();
    }
  }

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  private initializeMonitoring(): void {
    // Error tracking
    if (this.config.enableErrorTracking) {
      this.setupErrorHandlers();
    }

    // Performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.setupPerformanceObservers();
    }

    // Start batch processing
    this.startBatchProcessing();

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.flushBuffers();
    });

    // Periodic health check
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  private setupErrorHandlers(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError(new Error(event.message), {
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        type: 'javascript'
      }, 'medium');
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(
        new Error(`Unhandled promise rejection: ${event.reason}`),
        { type: 'promise_rejection' },
        'high'
      );
    });

    // Console.error override for controlled error tracking
    const originalError = console.error;
    console.error = (...args: unknown[]) => {
      originalError(...args);
      
      if (args.length > 0 && args[0] instanceof Error) {
        this.trackError(args[0], { source: 'console.error' }, 'low');
      }
    };
  }

  private setupPerformanceObservers(): void {
    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        this.trackPerformance('lcp', lastEntry.startTime, {
          element: lastEntry.element?.tagName || 'unknown',
          url: lastEntry.url || window.location.href
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.trackPerformance('fid', entry.processingStart - entry.startTime, {
            eventType: entry.name,
            target: entry.target?.tagName || 'unknown'
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      new PerformanceObserver((list) => {
        let clsValue = 0;
        
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });

        if (clsValue > 0) {
          this.trackPerformance('cls', clsValue, {
            affectedElements: list.getEntries().length
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });

      // Time to First Byte (TTFB)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.trackPerformance('ttfb', navEntry.responseStart - navEntry.requestStart, {
              type: navEntry.type,
              redirectCount: navEntry.redirectCount
            });
          }
        });
      }).observe({ entryTypes: ['navigation'] });

      // Resource loading times
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Only track slow resources
          if (resourceEntry.duration > 1000) {
            this.trackPerformance('resource_load', resourceEntry.duration, {
              name: resourceEntry.name,
              type: resourceEntry.initiatorType,
              size: resourceEntry.transferSize || 0
            });
          }
        });
      }).observe({ entryTypes: ['resource'] });
    }

    // Memory usage (if available)
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackPerformance('memory_usage', memory.usedJSHeapSize, {
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100
        });
      }, 30000); // Every 30 seconds
    }
  }

  // =============================================================================
  // TRACKING METHODS
  // =============================================================================

  trackError(
    error: Error, 
    context: Record<string, unknown> = {},
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): void {
    if (!this.config.enableErrorTracking || !this.shouldSample()) {
      return;
    }

    const errorReport: ErrorReport = {
      error,
      context,
      severity,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      stackTrace: error.stack
    };

    this.errorBuffer.push(errorReport);
    
    // Immediate flush for critical errors
    if (severity === 'critical') {
      this.flushErrorBuffer();
    }

    // Console log in development
    if (!this.isProduction) {
      console.error('Production Monitor - Error:', errorReport);
    }
  }

  trackPerformance(
    metric: string,
    value: number,
    context: Record<string, unknown> = {}
  ): void {
    if (!this.config.enablePerformanceMonitoring || !this.shouldSample()) {
      return;
    }

    const performanceReport: PerformanceReport = {
      metric,
      value,
      timestamp: new Date().toISOString(),
      context,
      sessionId: this.sessionId,
      page: window.location.pathname
    };

    this.performanceBuffer.push(performanceReport);

    // Alert on poor performance
    if (this.isPerformanceCritical(metric, value)) {
      console.warn(`Performance Alert: ${metric} = ${value}ms`);
    }

    // Console log in development
    if (!this.isProduction) {
      console.log('Production Monitor - Performance:', performanceReport);
    }
  }

  trackEvent(
    event: string,
    properties: Record<string, unknown> = {}
  ): void {
    if (!this.config.enableUserAnalytics || !this.shouldSample()) {
      return;
    }

    const userEvent: UserEvent = {
      event,
      properties: {
        ...properties,
        page: window.location.pathname,
        referrer: document.referrer,
        timestamp: new Date().toISOString()
      },
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    this.eventBuffer.push(userEvent);

    // Console log in development
    if (!this.isProduction) {
      console.log('Production Monitor - Event:', userEvent);
    }
  }

  // =============================================================================
  // BATCH PROCESSING
  // =============================================================================

  private startBatchProcessing(): void {
    this.batchTimer = window.setInterval(() => {
      this.flushBuffers();
    }, this.BATCH_INTERVAL);
  }

  private async flushBuffers(): Promise<void> {
    await Promise.all([
      this.flushErrorBuffer(),
      this.flushPerformanceBuffer(),
      this.flushEventBuffer()
    ]);
  }

  private async flushErrorBuffer(): Promise<void> {
    if (this.errorBuffer.length === 0) return;

    const errors = this.errorBuffer.splice(0, this.BATCH_SIZE);
    
    try {
      // Convert to database format
      const errorLogs: Partial<ErrorLog>[] = errors.map(error => ({
        error_type: 'frontend',
        error_message: error.error.message,
        stack_trace: error.stackTrace,
        severity: error.severity,
        component: error.context.source as string || 'unknown',
        url: error.url,
        user_agent: error.userAgent,
        session_id: error.sessionId,
        resolved: false,
        created_at: error.timestamp
      }));

      // Send to backend (replace with your actual API)
      await this.sendToBackend('/api/errors', errorLogs);
      
    } catch (error) {
      console.error('Failed to flush error buffer:', error);
      // Re-add errors to buffer for retry
      this.errorBuffer.unshift(...errors);
    }
  }

  private async flushPerformanceBuffer(): Promise<void> {
    if (this.performanceBuffer.length === 0) return;

    const metrics = this.performanceBuffer.splice(0, this.BATCH_SIZE);
    
    try {
      // Convert to database format
      const performanceMetrics: Partial<PerformanceMetric>[] = metrics.map(metric => ({
        metric_name: metric.metric,
        metric_value: metric.value,
        dimensions: metric.context,
        timestamp: metric.timestamp,
        session_id: metric.sessionId,
        created_at: metric.timestamp
      }));

      await this.sendToBackend('/api/performance', performanceMetrics);
      
    } catch (error) {
      console.error('Failed to flush performance buffer:', error);
      this.performanceBuffer.unshift(...metrics);
    }
  }

  private async flushEventBuffer(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = this.eventBuffer.splice(0, this.BATCH_SIZE);
    
    try {
      // Convert to database format
      const analyticsEvents: Partial<AnalyticsEvent>[] = events.map(event => ({
        event_name: event.event,
        properties: event.properties,
        session_id: event.sessionId,
        timestamp: event.timestamp,
        created_at: event.timestamp
      }));

      await this.sendToBackend('/api/analytics', analyticsEvents);
      
    } catch (error) {
      console.error('Failed to flush event buffer:', error);
      this.eventBuffer.unshift(...events);
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  private async sendToBackend(endpoint: string, data: unknown[]): Promise<void> {
    // In production, this would send to your Supabase functions or API
    if (this.isProduction) {
      // Example implementation:
      // await supabase.functions.invoke('monitoring', {
      //   body: { endpoint, data }
      // });
      
      // For now, just log the data
      console.log(`Would send to ${endpoint}:`, data);
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.config.sampleRate;
  }

  private isPerformanceCritical(metric: string, value: number): boolean {
    const thresholds: Record<string, number> = {
      'lcp': 2500, // 2.5s
      'fid': 100,  // 100ms
      'cls': 0.1,  // 0.1
      'ttfb': 800, // 800ms
      'page_load': this.config.performanceThreshold
    };

    return value > (thresholds[metric] || this.config.performanceThreshold);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private performHealthCheck(): void {
    const healthMetrics = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      memory: 'memory' in performance ? (performance as any).memory : null,
      connection: 'connection' in navigator ? (navigator as any).connection : null
    };

    this.trackEvent('health_check', healthMetrics);
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  // Convenience methods for common tracking
  trackPageView(page?: string): void {
    this.trackEvent('page_view', {
      page: page || window.location.pathname,
      title: document.title,
      referrer: document.referrer
    });
  }

  trackUserAction(action: string, properties: Record<string, unknown> = {}): void {
    this.trackEvent('user_action', {
      action,
      ...properties
    });
  }

  trackApiCall(endpoint: string, method: string, duration: number, status: number): void {
    this.trackPerformance('api_call', duration, {
      endpoint,
      method,
      status,
      success: status >= 200 && status < 300
    });
  }

  trackComponentRender(component: string, duration: number): void {
    this.trackPerformance('component_render', duration, {
      component
    });
  }

  // Update configuration
  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  // Get current session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Force flush all buffers
  async flush(): Promise<void> {
    await this.flushBuffers();
  }

  // Cleanup
  destroy(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    
    // Flush remaining data
    this.flushBuffers();
  }
}

// Create and export singleton instance
export const productionMonitor = new ProductionMonitor();

// Auto-initialize on import in production
if (import.meta.env.PROD) {
  // Track initial page load
  window.addEventListener('load', () => {
    productionMonitor.trackPageView();
    productionMonitor.trackPerformance('page_load', performance.now());
  });
}

// Export class for testing
export { ProductionMonitor }; 