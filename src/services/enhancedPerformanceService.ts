
import { supabase } from '@/integrations/supabase/client';
import { errorTrackingService } from './errorTrackingService';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode?: number;
  metadata?: Record<string, any>;
}

class EnhancedPerformanceService {
  private performanceObserver?: PerformanceObserver;

  constructor() {
    this.initializePerformanceObserver();
    this.trackPageLoadMetrics();
  }

  private initializePerformanceObserver(): void {
    if (typeof PerformanceObserver !== 'undefined') {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.processPerformanceEntry(entry);
        }
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'resource', 'measure', 'paint'] 
      });
    }
  }

  private processPerformanceEntry(entry: PerformanceEntry): void {
    if (entry.entryType === 'navigation') {
      const navEntry = entry as PerformanceNavigationTiming;
      this.logPerformanceMetric({
        endpoint: window.location.pathname,
        method: 'GET',
        responseTime: navEntry.loadEventEnd - navEntry.fetchStart,
        metadata: {
          type: 'page_load',
          domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.fetchStart,
          firstContentfulPaint: this.getFirstContentfulPaint(),
          largestContentfulPaint: this.getLargestContentfulPaint()
        }
      });
    }
  }

  private getFirstContentfulPaint(): number | null {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    return fcpEntry?.startTime || null;
  }

  private getLargestContentfulPaint(): number | null {
    const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
    const lastEntry = lcpEntries[lcpEntries.length - 1];
    return lastEntry?.startTime || null;
  }

  private trackPageLoadMetrics(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          this.logPerformanceMetric({
            endpoint: window.location.pathname,
            method: 'GET',
            responseTime: navigation.loadEventEnd - navigation.fetchStart,
            metadata: {
              type: 'full_page_load',
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              networkTime: navigation.responseEnd - navigation.requestStart,
              renderTime: navigation.loadEventEnd - navigation.responseEnd
            }
          });
        }
      }, 0);
    });
  }

  async logPerformanceMetric(metric: PerformanceMetric): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('performance_logs').insert({
        endpoint: metric.endpoint,
        method: metric.method,
        response_time: Math.round(metric.responseTime),
        status_code: metric.statusCode,
        user_id: user?.id || null,
        metadata: metric.metadata || {}
      });

      // Log slow responses
      if (metric.responseTime > 3000) {
        await errorTrackingService.logError(
          'slow_performance',
          `Slow response: ${metric.method} ${metric.endpoint} took ${Math.round(metric.responseTime)}ms`,
          'medium',
          {
            component: 'performance_monitor',
            additionalData: metric
          }
        );
      }
    } catch (error) {
      console.error('Failed to log performance metric:', error);
    }
  }

  async trackAPICall<T>(
    endpoint: string,
    method: string,
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    let statusCode: number | undefined;
    
    try {
      const result = await apiCall();
      statusCode = 200;
      return result;
    } catch (error: any) {
      statusCode = error.status || 500;
      
      await errorTrackingService.logAPIError(
        endpoint,
        method,
        statusCode,
        error.message || 'API call failed'
      );
      
      throw error;
    } finally {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      
      await this.logPerformanceMetric({
        endpoint,
        method,
        responseTime,
        statusCode,
        metadata: {
          type: 'api_call',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  async getPerformanceInsights(days: number = 7): Promise<any> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('performance_logs')
      .select('endpoint, method, response_time, status_code, created_at')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const insights = {
      averageResponseTime: 0,
      slowestEndpoints: [] as Array<{ endpoint: string; averageTime: number }>,
      errorRate: 0,
      totalRequests: data.length,
      byEndpoint: {} as Record<string, { count: number; averageTime: number; errorCount: number }>
    };

    if (data.length > 0) {
      insights.averageResponseTime = data.reduce((sum, log) => sum + log.response_time, 0) / data.length;
      
      const errorCount = data.filter(log => log.status_code && log.status_code >= 400).length;
      insights.errorRate = (errorCount / data.length) * 100;

      // Group by endpoint
      data.forEach(log => {
        if (!insights.byEndpoint[log.endpoint]) {
          insights.byEndpoint[log.endpoint] = { count: 0, averageTime: 0, errorCount: 0 };
        }
        
        const endpoint = insights.byEndpoint[log.endpoint];
        endpoint.count++;
        endpoint.averageTime = (endpoint.averageTime * (endpoint.count - 1) + log.response_time) / endpoint.count;
        
        if (log.status_code && log.status_code >= 400) {
          endpoint.errorCount++;
        }
      });

      // Find slowest endpoints
      insights.slowestEndpoints = Object.entries(insights.byEndpoint)
        .map(([endpoint, stats]) => ({ endpoint, averageTime: stats.averageTime }))
        .sort((a, b) => b.averageTime - a.averageTime)
        .slice(0, 5);
    }

    return insights;
  }

  measureComponent<T extends any[], R>(
    componentName: string,
    fn: (...args: T) => R
  ): (...args: T) => R {
    return (...args: T): R => {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log slow component renders
      if (duration > 100) {
        this.logPerformanceMetric({
          endpoint: `component:${componentName}`,
          method: 'RENDER',
          responseTime: duration,
          metadata: {
            type: 'component_render',
            componentName
          }
        });
      }

      return result;
    };
  }

  destroy(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

export const enhancedPerformanceService = new EnhancedPerformanceService();
