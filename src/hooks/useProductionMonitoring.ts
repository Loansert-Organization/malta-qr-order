
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { aiMonitor } from '@/utils/aiMonitor';

interface ProductionMetrics {
  systemHealth: number;
  errorRate: number;
  responseTime: number;
  lastAuditScore: number;
  activeIssues: number;
  timestamp: string;
  dbConnectivity: boolean;
  edgeFunctionHealth: boolean;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
}

interface ServiceHealth {
  api: boolean;
  db: boolean;
  edge: boolean;
  auth: boolean;
  lastError?: string;
  responseTimes: { [key: string]: number };
}

export const useProductionMonitoring = () => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>({
    api: false,
    db: false,
    edge: false,
    auth: false,
    responseTimes: {},
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const checkDatabaseHealth = async (): Promise<{ ok: boolean; time: number }> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.from('vendors').select('count').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        await aiMonitor("error", {
          message: `Database health check failed: ${error.message}`,
          context: "db-health-check",
          severity: "high"
        });
        return { ok: false, time: responseTime };
      }
      
      return { ok: true, time: responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      await aiMonitor("error", {
        message: `Database connectivity error: ${error}`,
        context: "db-connectivity",
        severity: "critical"
      });
      return { ok: false, time: responseTime };
    }
  };

  const checkEdgeFunctionHealth = async (): Promise<{ ok: boolean; time: number }> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.functions.invoke('ai-system-health', {
        body: { check: 'health' }
      });
      const responseTime = Date.now() - startTime;
      
      if (error) {
        await aiMonitor("error", {
          message: `Edge function health check failed: ${error.message}`,
          context: "edge-health-check",
          severity: "medium"
        });
        return { ok: false, time: responseTime };
      }
      
      return { ok: true, time: responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { ok: false, time: responseTime };
    }
  };

  const checkAuthHealth = async (): Promise<{ ok: boolean; time: number }> => {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase.auth.getSession();
      const responseTime = Date.now() - startTime;
      
      if (error) {
        await aiMonitor("error", {
          message: `Auth health check failed: ${error.message}`,
          context: "auth-health-check",
          severity: "medium"
        });
        return { ok: false, time: responseTime };
      }
      
      return { ok: true, time: responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { ok: false, time: responseTime };
    }
  };

  const collectMetrics = async () => {
    const startTime = Date.now();

    try {
      // Run health checks
      const [dbHealth, edgeHealth, authHealth] = await Promise.all([
        checkDatabaseHealth(),
        checkEdgeFunctionHealth(),
        checkAuthHealth()
      ]);

      const totalResponseTime = Date.now() - startTime;
      const healthyServices = [dbHealth.ok, edgeHealth.ok, authHealth.ok].filter(Boolean).length;
      const systemHealth = (healthyServices / 3) * 100;

      // Check for recent errors
      const { count: errorCount } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

      const errorRate = errorCount || 0;

      // Mock additional metrics (in production, these would come from actual monitoring)
      const mockMetrics = {
        uptime: 99.9,
        memoryUsage: 45 + Math.random() * 20,
        cpuUsage: 30 + Math.random() * 15,
      };

      const newMetrics: ProductionMetrics = {
        systemHealth,
        errorRate,
        responseTime: totalResponseTime,
        lastAuditScore: 85,
        activeIssues: errorCount || 0,
        timestamp: new Date().toISOString(),
        dbConnectivity: dbHealth.ok,
        edgeFunctionHealth: edgeHealth.ok,
        ...mockMetrics
      };

      const newServiceHealth: ServiceHealth = {
        api: true,
        db: dbHealth.ok,
        edge: edgeHealth.ok,
        auth: authHealth.ok,
        responseTimes: {
          db: dbHealth.time,
          edge: edgeHealth.time,
          auth: authHealth.time,
        },
        lastError: !dbHealth.ok ? 'Database' : !edgeHealth.ok ? 'Edge Functions' : !authHealth.ok ? 'Authentication' : undefined
      };

      setMetrics(newMetrics);
      setServiceHealth(newServiceHealth);

      // Log metrics to system_logs
      await supabase.from('system_logs').insert({
        log_type: 'monitoring_metrics',
        component: 'production_monitoring',
        message: `System health: ${systemHealth.toFixed(1)}%, Error rate: ${errorRate}`,
        metadata: newMetrics,
        severity: systemHealth > 80 ? 'info' : systemHealth > 60 ? 'warning' : 'error'
      });

      // Trigger AI monitoring if health is poor
      if (systemHealth < 70) {
        await aiMonitor("error", {
          message: `System health degraded: ${systemHealth.toFixed(1)}%`,
          context: "system-health-monitoring",
          metrics: newMetrics,
          severity: systemHealth < 50 ? "critical" : "high"
        });
      }

    } catch (error) {
      console.error('Failed to collect metrics:', error);
      
      const errorMetrics: ProductionMetrics = {
        systemHealth: 0,
        errorRate: 100,
        responseTime: 0,
        lastAuditScore: 0,
        activeIssues: 1,
        timestamp: new Date().toISOString(),
        dbConnectivity: false,
        edgeFunctionHealth: false,
        uptime: 0,
        memoryUsage: 0,
        cpuUsage: 0
      };

      setMetrics(errorMetrics);
      
      await aiMonitor("error", {
        message: `Metrics collection failed: ${error}`,
        context: "metrics-collection-failure",
        severity: "critical"
      });
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
    return { metrics, serviceHealth };
  };

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, []);

  return {
    metrics,
    serviceHealth,
    isMonitoring,
    collectMetrics,
    runQuickHealthCheck
  };
};
