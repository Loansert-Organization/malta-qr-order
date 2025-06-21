
import { supabase } from '@/integrations/supabase/client';

interface PerformanceThresholds {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

class PerformanceService {
  private thresholds: PerformanceThresholds = {
    pageLoadTime: 3000,
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    firstInputDelay: 100,
    cumulativeLayoutShift: 0.1
  };

  async trackPageLoad(route: string, loadTime: number): Promise<void> {
    try {
      await supabase.from('analytics').insert({
        vendor_id: 'system',
        date: new Date().toISOString().split('T')[0],
        metric_type: 'page_load',
        metric_value: loadTime,
        metadata: { route, timestamp: Date.now() }
      });
    } catch (error) {
      console.error('Failed to track page load:', error);
    }
  }

  async trackComponentRender(componentName: string, renderTime: number): Promise<void> {
    try {
      await supabase.from('analytics').insert({
        vendor_id: 'system',
        date: new Date().toISOString().split('T')[0],
        metric_type: 'component_render',
        metric_value: renderTime,
        metadata: { component: componentName, timestamp: Date.now() }
      });
    } catch (error) {
      console.error('Failed to track component render:', error);
    }
  }

  async trackMemoryUsage(): Promise<void> {
    if (!(performance as any).memory) return;

    const memory = (performance as any).memory;
    
    try {
      await supabase.from('analytics').insert({
        vendor_id: 'system',
        date: new Date().toISOString().split('T')[0],
        metric_type: 'memory_usage',
        metric_value: memory.usedJSHeapSize,
        metadata: {
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to track memory usage:', error);
    }
  }

  async getPerformanceInsights(days: number = 7): Promise<any> {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('analytics')
        .select('*')
        .eq('vendor_id', 'system')
        .gte('date', startDate)
        .lte('date', endDate)
        .in('metric_type', [
          'performance_page_load_time',
          'performance_first_contentful_paint',
          'performance_largest_contentful_paint',
          'performance_first_input_delay',
          'performance_cumulative_layout_shift'
        ]);

      if (error) throw error;

      return this.analyzePerformanceData(data);
    } catch (error) {
      console.error('Failed to get performance insights:', error);
      return null;
    }
  }

  private analyzePerformanceData(data: any[]): any {
    const insights = {
      averages: {} as any,
      trends: {} as any,
      alerts: [] as string[]
    };

    // Group by metric type
    const grouped = data.reduce((acc, item) => {
      const type = item.metric_type.replace('performance_', '');
      if (!acc[type]) acc[type] = [];
      acc[type].push(item.metric_value);
      return acc;
    }, {});

    // Calculate averages and identify issues
    Object.entries(grouped).forEach(([type, values]: [string, any]) => {
      const average = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
      insights.averages[type] = average;

      // Check against thresholds
      const threshold = this.thresholds[type as keyof PerformanceThresholds];
      if (threshold && average > threshold) {
        insights.alerts.push(`${type} average (${Math.round(average)}ms) exceeds threshold (${threshold}ms)`);
      }
    });

    return insights;
  }

  withPerformanceTracking<T extends any[], R>(
    fn: (...args: T) => R,
    trackingName: string
  ): (...args: T) => R {
    return (...args: T): R => {
      const startTime = performance.now();
      const result = fn(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Track asynchronously
      this.trackComponentRender(trackingName, duration);

      return result;
    };
  }
}

export const performanceService = new PerformanceService();
