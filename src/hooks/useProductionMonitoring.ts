
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAISupervision } from './useAISupervision';
import { productionAuditService } from '@/services/productionAudit';

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
  const { logSystemEvent } = useAISupervision();

  const startMonitoring = async () => {
    setIsMonitoring(true);
    await logSystemEvent('monitoring_started', 'Production monitoring activated');

    // Monitor system health every 5 minutes
    const monitoringInterval = setInterval(async () => {
      try {
        await collectMetrics();
      } catch (error) {
        console.error('Monitoring failed:', error);
        await logSystemEvent('monitoring_error', `Monitoring failed: ${error}`);
      }
    }, 300000); // 5 minutes

    // Initial metrics collection
    await collectMetrics();

    return () => {
      clearInterval(monitoringInterval);
      setIsMonitoring(false);
    };
  };

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
        lastAuditScore: 0, // Will be updated by full audit
        activeIssues: 0,   // Will be updated by full audit
        timestamp: new Date().toISOString()
      };

      setMetrics(newMetrics);

      // Log metrics
      await supabase.from('system_logs').insert({
        log_type: 'monitoring_metrics',
        component: 'production_monitoring',
        message: 'System health metrics collected',
        metadata: newMetrics,
        severity: systemHealth > 80 ? 'info' : 'warning'
      });

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

  const runQuickHealthCheck = async () => {
    await logSystemEvent('health_check_started', 'Quick health check initiated');
    
    try {
      const report = await productionAuditService.performFullAudit();
      
      if (metrics) {
        setMetrics({
          ...metrics,
          lastAuditScore: report.summary.productionReadinessScore,
          activeIssues: report.summary.criticalIssues,
          timestamp: new Date().toISOString()
        });
      }

      await logSystemEvent('health_check_completed', 
        `Health check completed: ${report.summary.productionReadinessScore}% ready`);
      
      return report;
    } catch (error) {
      await logSystemEvent('health_check_failed', `Health check failed: ${error}`);
      throw error;
    }
  };

  useEffect(() => {
    return startMonitoring();
  }, []);

  return {
    metrics,
    isMonitoring,
    collectMetrics,
    runQuickHealthCheck
  };
};
