
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { aiMonitor } from '@/utils/aiMonitor';
import { logSystemEvent } from '@/utils/systemLogs';

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
  failureCount: number;
  circuitBreakerOpen: boolean;
  lastRecoveryAttempt?: string;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextRetryTime: number;
  state: 'closed' | 'open' | 'half-open';
}

export const useProductionMonitoring = () => {
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [serviceHealth, setServiceHealth] = useState<ServiceHealth>({
    api: false,
    db: false,
    edge: false,
    auth: false,
    responseTimes: {},
    failureCount: 0,
    circuitBreakerOpen: false,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerState>({
    isOpen: false,
    failureCount: 0,
    lastFailureTime: 0,
    nextRetryTime: 0,
    state: 'closed'
  });

  const FAILURE_THRESHOLD = 3;
  const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute
  const MAX_BACKOFF_TIME = 300000; // 5 minutes

  const calculateBackoffTime = (failureCount: number): number => {
    return Math.min(1000 * Math.pow(2, failureCount), MAX_BACKOFF_TIME);
  };

  const shouldAttemptRequest = (): boolean => {
    if (circuitBreaker.state === 'closed') return true;
    if (circuitBreaker.state === 'open' && Date.now() > circuitBreaker.nextRetryTime) {
      setCircuitBreaker(prev => ({ ...prev, state: 'half-open' }));
      return true;
    }
    return false;
  };

  const recordSuccess = () => {
    setCircuitBreaker({
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextRetryTime: 0,
      state: 'closed'
    });
  };

  const recordFailure = () => {
    const newFailureCount = circuitBreaker.failureCount + 1;
    const now = Date.now();
    
    if (newFailureCount >= FAILURE_THRESHOLD) {
      const backoffTime = calculateBackoffTime(newFailureCount);
      setCircuitBreaker({
        isOpen: true,
        failureCount: newFailureCount,
        lastFailureTime: now,
        nextRetryTime: now + backoffTime,
        state: 'open'
      });

      logSystemEvent({
        log_type: 'error',
        component: 'circuit_breaker',
        message: `Circuit breaker opened after ${newFailureCount} failures. Next retry in ${backoffTime}ms`,
        metadata: { failureCount: newFailureCount, backoffTime, nextRetryTime: now + backoffTime }
      });
    } else {
      setCircuitBreaker(prev => ({
        ...prev,
        failureCount: newFailureCount,
        lastFailureTime: now
      }));
    }
  };

  const checkDatabaseHealth = async (): Promise<{ ok: boolean; time: number }> => {
    if (!shouldAttemptRequest()) {
      return { ok: false, time: 0 };
    }

    const startTime = Date.now();
    try {
      const { data, error } = await supabase.from('vendors').select('count').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (error) {
        recordFailure();
        await aiMonitor("error", {
          message: `Database health check failed: ${error.message}`,
          context: "db-health-check",
          severity: "high"
        });
        return { ok: false, time: responseTime };
      }
      
      recordSuccess();
      return { ok: true, time: responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      recordFailure();
      await aiMonitor("error", {
        message: `Database connectivity error: ${error}`,
        context: "db-connectivity",
        severity: "critical"
      });
      return { ok: false, time: responseTime };
    }
  };

  const checkEdgeFunctionHealth = async (): Promise<{ ok: boolean; time: number }> => {
    if (!shouldAttemptRequest()) {
      return { ok: false, time: 0 };
    }

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

  const attemptServiceRecovery = async () => {
    console.log('🔄 Attempting service recovery...');
    
    // Log recovery attempt
    await logSystemEvent({
      log_type: 'info',
      component: 'service_recovery',
      message: 'Attempting automatic service recovery',
      metadata: { 
        circuitBreakerState: circuitBreaker,
        timestamp: new Date().toISOString()
      }
    });

    // Try to recover services
    const recoveryResults = await Promise.allSettled([
      checkDatabaseHealth(),
      checkEdgeFunctionHealth(),
      checkAuthHealth()
    ]);

    const successfulRecoveries = recoveryResults.filter(result => 
      result.status === 'fulfilled' && result.value.ok
    ).length;

    if (successfulRecoveries > 0) {
      console.log(`✅ Successfully recovered ${successfulRecoveries} services`);
      
      await logSystemEvent({
        log_type: 'info',
        component: 'service_recovery',
        message: `Service recovery successful: ${successfulRecoveries} services restored`,
        metadata: { 
          recoveredServices: successfulRecoveries,
          totalServices: recoveryResults.length
        }
      });

      // Reset circuit breaker if enough services are recovered
      if (successfulRecoveries >= 2) {
        recordSuccess();
      }
    }

    return successfulRecoveries;
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

      // Enhanced metrics calculation
      const cpuUsage = 30 + Math.random() * 15; // Mock CPU usage
      const memoryUsage = 45 + Math.random() * 20; // Mock memory usage
      const uptime = 99.9; // Mock uptime

      const newMetrics: ProductionMetrics = {
        systemHealth,
        errorRate,
        responseTime: totalResponseTime,
        lastAuditScore: 85,
        activeIssues: errorCount || 0,
        timestamp: new Date().toISOString(),
        dbConnectivity: dbHealth.ok,
        edgeFunctionHealth: edgeHealth.ok,
        uptime,
        memoryUsage,
        cpuUsage
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
        lastError: !dbHealth.ok ? 'Database' : !edgeHealth.ok ? 'Edge Functions' : !authHealth.ok ? 'Authentication' : undefined,
        failureCount: circuitBreaker.failureCount,
        circuitBreakerOpen: circuitBreaker.isOpen,
        lastRecoveryAttempt: circuitBreaker.state === 'half-open' ? new Date().toISOString() : undefined
      };

      setMetrics(newMetrics);
      setServiceHealth(newServiceHealth);

      // Log metrics to system_logs
      await logSystemEvent({
        log_type: systemHealth > 80 ? 'info' : systemHealth > 60 ? 'warning' : 'error',
        component: 'production_monitoring',
        message: `System health: ${systemHealth.toFixed(1)}%, Error rate: ${errorRate}`,
        metadata: {
          ...newMetrics,
          circuitBreakerState: circuitBreaker.state,
          servicesHealthy: healthyServices
        }
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

      // Attempt recovery if circuit breaker is open and it's time to retry
      if (circuitBreaker.isOpen && Date.now() > circuitBreaker.nextRetryTime) {
        await attemptServiceRecovery();
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

    // Monitor system health every 5 minutes (production optimized)
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

  const forceServiceRecovery = async () => {
    return await attemptServiceRecovery();
  };

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, []);

  return {
    metrics,
    serviceHealth,
    isMonitoring,
    circuitBreaker,
    collectMetrics,
    runQuickHealthCheck,
    forceServiceRecovery
  };
};
