
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface ResourceTiming {
  name: string;
  duration: number;
  transferSize: number;
  type: string;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [resourceTimings, setResourceTimings] = useState<ResourceTiming[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const collectMetrics = useCallback(() => {
    if (!window.performance) return;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    const pageLoadTime = navigation.loadEventEnd - navigation.navigationStart;
    const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;

    // Collect Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          const lcp = entry.startTime;
          setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lcp } : null);
        }
        
        if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime;
          setMetrics(prev => prev ? { ...prev, firstInputDelay: fid } : null);
        }
        
        if (entry.entryType === 'layout-shift') {
          const cls = (entry as any).value;
          setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: cls } : null);
        }
      }
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });

    setMetrics({
      pageLoadTime,
      firstContentfulPaint,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: navigation.domInteractive - navigation.navigationStart
    });

    // Collect resource timings
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const resourceData = resources.map(resource => ({
      name: resource.name.split('/').pop() || 'unknown',
      duration: resource.duration,
      transferSize: resource.transferSize || 0,
      type: resource.initiatorType
    }));
    
    setResourceTimings(resourceData);
  }, []);

  const trackUserInteraction = useCallback(async (action: string, duration: number) => {
    try {
      await supabase.from('analytics').insert({
        vendor_id: 'system',
        date: new Date().toISOString().split('T')[0],
        metric_type: 'user_interaction',
        metric_value: duration,
        metadata: { action, timestamp: Date.now() }
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }, []);

  const trackAPICall = useCallback(async (endpoint: string, duration: number, success: boolean) => {
    try {
      await supabase.from('analytics').insert({
        vendor_id: 'system',
        date: new Date().toISOString().split('T')[0],
        metric_type: 'api_performance',
        metric_value: duration,
        metadata: { endpoint, success, timestamp: Date.now() }
      });
    } catch (error) {
      console.error('Failed to track API call:', error);
    }
  }, []);

  const reportMetrics = useCallback(async () => {
    if (!metrics) return;

    try {
      const metricsToReport = [
        { type: 'page_load_time', value: metrics.pageLoadTime },
        { type: 'first_contentful_paint', value: metrics.firstContentfulPaint },
        { type: 'largest_contentful_paint', value: metrics.largestContentfulPaint },
        { type: 'first_input_delay', value: metrics.firstInputDelay },
        { type: 'cumulative_layout_shift', value: metrics.cumulativeLayoutShift },
        { type: 'time_to_interactive', value: metrics.timeToInteractive }
      ];

      for (const metric of metricsToReport) {
        await supabase.from('analytics').insert({
          vendor_id: 'system',
          date: new Date().toISOString().split('T')[0],
          metric_type: `performance_${metric.type}`,
          metric_value: metric.value,
          metadata: { collected_at: Date.now() }
        });
      }
    } catch (error) {
      console.error('Failed to report metrics:', error);
    }
  }, [metrics]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    collectMetrics();
    
    // Report metrics after a delay to ensure all data is collected
    setTimeout(reportMetrics, 5000);
  }, [collectMetrics, reportMetrics]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  useEffect(() => {
    if (document.readyState === 'complete') {
      startMonitoring();
    } else {
      window.addEventListener('load', startMonitoring);
      return () => window.removeEventListener('load', startMonitoring);
    }
  }, [startMonitoring]);

  return {
    metrics,
    resourceTimings,
    isMonitoring,
    trackUserInteraction,
    trackAPICall,
    startMonitoring,
    stopMonitoring
  };
};
