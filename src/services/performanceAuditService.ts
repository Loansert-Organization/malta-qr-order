
import { supabase } from '@/integrations/supabase/client';
import { logSystemEvent } from '@/utils/systemLogs';

export interface PerformanceAuditIssue {
  id: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  recommendation: string;
  status: 'open' | 'resolved';
  metric?: string;
  value?: number;
  threshold?: number;
}

export class PerformanceAuditService {
  private slowQueryThreshold = 300; // ms
  private bundleSizeThreshold = 2 * 1024 * 1024; // 2MB
  private memoryThreshold = 85; // percentage

  async checkDatabasePerformance(): Promise<PerformanceAuditIssue[]> {
    const issues: PerformanceAuditIssue[] = [];
    const tablesToTest = [
      'vendors', 'orders', 'menu_items', 'payments', 
      'analytics', 'system_logs'
    ];

    for (const tableName of tablesToTest) {
      try {
        const startTime = performance.now();
        
        const { data, error } = await supabase
          .from(tableName as any)
          .select('*')
          .limit(10);

        const queryTime = performance.now() - startTime;

        if (queryTime > this.slowQueryThreshold) {
          issues.push({
            id: `slow-query-${tableName}`,
            description: `Slow database query detected on ${tableName} table`,
            severity: queryTime > 1000 ? 'high' : 'medium',
            category: 'database_performance',
            recommendation: `Optimize query performance for ${tableName}. Consider adding indexes or reducing data selection.`,
            status: 'open',
            metric: 'query_time_ms',
            value: Math.round(queryTime),
            threshold: this.slowQueryThreshold
          });
        }

        if (error) {
          issues.push({
            id: `query-error-${tableName}`,
            description: `Database query error on ${tableName}: ${error.message}`,
            severity: 'high',
            category: 'database_performance',
            recommendation: `Fix database query error for ${tableName} table`,
            status: 'open'
          });
        }

        // Log performance metrics
        await supabase.from('performance_logs').insert({
          endpoint: `db_query_${tableName}`,
          method: 'SELECT',
          response_time: Math.round(queryTime),
          status_code: error ? 500 : 200,
          metadata: { table: tableName, limit: 10 }
        });

      } catch (error) {
        console.error(`Performance test failed for ${tableName}:`, error);
        
        issues.push({
          id: `perf-error-${tableName}`,
          description: `Performance test failed for ${tableName}: ${error}`,
          severity: 'medium',
          category: 'database_performance',
          recommendation: `Investigate performance testing setup for ${tableName}`,
          status: 'open'
        });
      }
    }

    return issues;
  }

  async checkBundleSize(): Promise<PerformanceAuditIssue[]> {
    const issues: PerformanceAuditIssue[] = [];

    try {
      // Estimate bundle size using performance navigation API
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const transferSize = navigation.transferSize || 0;
        const encodedBodySize = navigation.encodedBodySize || 0;
        
        if (transferSize > this.bundleSizeThreshold) {
          issues.push({
            id: 'bundle-size-large',
            description: 'Application bundle size exceeds recommended threshold',
            severity: 'medium',
            category: 'bundle_performance',
            recommendation: 'Consider code splitting, lazy loading, or removing unused dependencies',
            status: 'open',
            metric: 'bundle_size_bytes',
            value: transferSize,
            threshold: this.bundleSizeThreshold
          });
        }

        // Check compression ratio
        const compressionRatio = encodedBodySize > 0 ? transferSize / encodedBodySize : 1;
        if (compressionRatio > 0.8) {
          issues.push({
            id: 'compression-poor',
            description: 'Poor compression ratio detected for application assets',
            severity: 'low',
            category: 'bundle_performance',
            recommendation: 'Enable gzip/brotli compression on server or CDN',
            status: 'open',
            metric: 'compression_ratio',
            value: Math.round(compressionRatio * 100) / 100
          });
        }
      }

      // Check for large dependencies using module analysis
      const scripts = document.querySelectorAll('script[src]');
      scripts.forEach((script, index) => {
        const src = (script as HTMLScriptElement).src;
        if (src && src.includes('chunk') && src.length > 100) {
          issues.push({
            id: `large-chunk-${index}`,
            description: `Large JavaScript chunk detected: ${src.split('/').pop()}`,
            severity: 'low',
            category: 'bundle_performance',
            recommendation: 'Consider code splitting this large chunk into smaller modules',
            status: 'open'
          });
        }
      });

    } catch (error) {
      console.error('Bundle size check failed:', error);
      
      issues.push({
        id: 'bundle-check-error',
        description: `Bundle size analysis failed: ${error}`,
        severity: 'low',
        category: 'bundle_performance',
        recommendation: 'Implement proper bundle analysis tooling',
        status: 'open'
      });
    }

    return issues;
  }

  async checkMemoryUsage(): Promise<PerformanceAuditIssue[]> {
    const issues: PerformanceAuditIssue[] = [];

    try {
      // Use performance.memory API if available (Chrome)
      const memory = (performance as any).memory;
      
      if (memory) {
        const usedMemoryMB = memory.usedJSHeapSize / (1024 * 1024);
        const totalMemoryMB = memory.totalJSHeapSize / (1024 * 1024);
        const limitMemoryMB = memory.jsHeapSizeLimit / (1024 * 1024);
        
        const memoryUsagePercent = (usedMemoryMB / limitMemoryMB) * 100;
        
        if (memoryUsagePercent > this.memoryThreshold) {
          issues.push({
            id: 'memory-usage-high',
            description: 'High memory usage detected in application',
            severity: memoryUsagePercent > 95 ? 'critical' : 'high',
            category: 'memory_performance',
            recommendation: 'Investigate memory leaks, optimize data structures, or implement pagination',
            status: 'open',
            metric: 'memory_usage_percent',
            value: Math.round(memoryUsagePercent),
            threshold: this.memoryThreshold
          });
        }

        // Check for memory growth over time
        setTimeout(async () => {
          const newUsedMemory = memory.usedJSHeapSize / (1024 * 1024);
          const memoryGrowth = newUsedMemory - usedMemoryMB;
          
          if (memoryGrowth > 10) { // 10MB growth in 5 seconds
            issues.push({
              id: 'memory-leak-suspected',
              description: 'Potential memory leak detected - rapid memory growth',
              severity: 'high',
              category: 'memory_performance',
              recommendation: 'Investigate potential memory leaks in component lifecycle or data caching',
              status: 'open',
              metric: 'memory_growth_mb',
              value: Math.round(memoryGrowth)
            });
          }
        }, 5000);
      }

      // Check for DOM node count
      const domNodeCount = document.querySelectorAll('*').length;
      if (domNodeCount > 2000) {
        issues.push({
          id: 'dom-size-large',
          description: 'Large DOM size detected - may impact performance',
          severity: domNodeCount > 5000 ? 'high' : 'medium',
          category: 'dom_performance',
          recommendation: 'Consider virtualization for large lists or component optimization',
          status: 'open',
          metric: 'dom_node_count',
          value: domNodeCount,
          threshold: 2000
        });
      }

    } catch (error) {
      console.error('Memory usage check failed:', error);
    }

    return issues;
  }

  async checkCoreWebVitals(): Promise<PerformanceAuditIssue[]> {
    const issues: PerformanceAuditIssue[] = [];

    try {
      // Check First Contentful Paint (FCP)
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
      if (fcpEntry && fcpEntry.startTime > 1800) { // 1.8s threshold
        issues.push({
          id: 'fcp-slow',
          description: 'First Contentful Paint is slower than recommended',
          severity: 'medium',
          category: 'web_vitals',
          recommendation: 'Optimize critical rendering path and reduce blocking resources',
          status: 'open',
          metric: 'fcp_ms',
          value: Math.round(fcpEntry.startTime),
          threshold: 1800
        });
      }

      // Check Largest Contentful Paint (LCP) using observer
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        if (lastEntry.startTime > 2500) { // 2.5s threshold
          issues.push({
            id: 'lcp-slow',
            description: 'Largest Contentful Paint is slower than recommended',
            severity: 'high',
            category: 'web_vitals',
            recommendation: 'Optimize large images, reduce server response times, and eliminate render-blocking resources',
            status: 'open',
            metric: 'lcp_ms',
            value: Math.round(lastEntry.startTime),
            threshold: 2500
          });
        }
        
        observer.disconnect();
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });

      // Cleanup observer after 10 seconds
      setTimeout(() => observer.disconnect(), 10000);

    } catch (error) {
      console.error('Core Web Vitals check failed:', error);
    }

    return issues;
  }

  async runComprehensivePerformanceAudit(): Promise<PerformanceAuditIssue[]> {
    console.log('⚡ Starting comprehensive performance audit...');
    
    const [dbIssues, bundleIssues, memoryIssues, webVitalIssues] = await Promise.all([
      this.checkDatabasePerformance(),
      this.checkBundleSize(),
      this.checkMemoryUsage(),
      this.checkCoreWebVitals()
    ]);

    const allIssues = [...dbIssues, ...bundleIssues, ...memoryIssues, ...webVitalIssues];

    await logSystemEvent({
      log_type: allIssues.length > 0 ? 'warning' : 'info',
      component: 'performance_audit',
      message: `Comprehensive performance audit completed. Found ${allIssues.length} total issues`,
      metadata: {
        total_issues: allIssues.length,
        critical_issues: allIssues.filter(i => i.severity === 'critical').length,
        high_issues: allIssues.filter(i => i.severity === 'high').length,
        categories: [...new Set(allIssues.map(i => i.category))]
      }
    });

    return allIssues;
  }
}

export const performanceAuditService = new PerformanceAuditService();
