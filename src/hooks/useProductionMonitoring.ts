
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductionMetrics {
  systemHealth: number;
  errorRate: number;
  responseTime: number;
  lastAuditScore: number;
  activeIssues: number;
  timestamp: string;
}

export const useProductionMonitoring = () => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const collectMetrics = async () => {
    const startTime = Date.now();

    try {
      // Test database connectivity
      const { data: healthCheck, error } = await supabase
        .from('vendors')
        .select('count')
        .limit(1);

      const responseTime = Date.now() - startTime;
      const hasError = !!error;

      // Quick health assessment
      const systemHealth = hasError ? 50 : (responseTime < 1000 ? 100 : 75);
      const errorRate = hasError ? 25 : 0;

      const newMetrics: ProductionMetrics = {
        systemHealth,
        errorRate,
        responseTime,
        lastAuditScore: 0,
        activeIssues: 0,
        timestamp: new Date().toISOString()
      };

      setMetrics(newMetrics);

      // Log metrics to system_logs
      try {
        await supabase.from('system_logs').insert({
          log_type: 'monitoring_metrics',
          component: 'production_monitoring',
          message: 'System health metrics collected',
          metadata: newMetrics as any,
          severity: systemHealth > 80 ? 'info' : 'warning'
        });
      } catch (logError) {
        console.warn('Failed to log metrics:', logError);
      }

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      
      const errorMetrics: ProductionMetrics = {
        systemHealth: 0,
        errorRate: 100,
        responseTime: 0,
        lastAuditScore: 0,
        activeIssues: 1,
        timestamp: new Date().toISOString()
      };

      setMetrics(errorMetrics);
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    
    // Initial metrics collection
    collectMetrics();

    // Monitor system health every 5 minutes
    const monitoringInterval = setInterval(() => {
      collectMetrics();
    }, 300000); // 5 minutes

    return () => {
      clearInterval(monitoringInterval);
      setIsMonitoring(false);
    };
  };

  const runQuickHealthCheck = async () => {
    await collectMetrics();
    return metrics;
  };

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, []);

  return {
    metrics,
    isMonitoring,
    collectMetrics,
    runQuickHealthCheck
  };
};
