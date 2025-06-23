
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { AuditFinding } from './AuditCategoryCard';

interface AuditReport {
  timestamp: string;
  findings: AuditFinding[];
  summary: {
    totalFindings: number;
    criticalIssues: number;
    readyItems: number;
    brokenItems: number;
    productionReadinessScore: number;
  };
  categories: {
    frontend: AuditFinding[];
    backend: AuditFinding[];
    database: AuditFinding[];
    ai: AuditFinding[];
    security: AuditFinding[];
    performance: AuditFinding[];
  };
}

export const useAuditEngine = () => {
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  const runFullAudit = async () => {
    setIsRunningAudit(true);
    setAuditProgress(0);

    try {
      console.log('🔍 Starting comprehensive fullstack audit...');
      
      const findings: AuditFinding[] = [];

      // FRONTEND AUDIT
      setAuditProgress(10);
      console.log('🖥️ Auditing Frontend...');
      
      const routes = [
        { path: '/', name: 'Client App Home' },
        { path: '/vendor', name: 'Vendor Dashboard' },
        { path: '/admin', name: 'Admin Panel' },
        { path: '/production-audit', name: 'Production Audit' },
        { path: '/production-system', name: 'Production System' }
      ];

      routes.forEach(route => {
        findings.push({
          id: `route_${route.path.replace('/', '_') || 'home'}`,
          category: 'frontend',
          location: `Route: ${route.path}`,
          type: 'integration',
          severity: 'high',
          status: 'needs_fixing',
          description: `Route ${route.path} needs verification for proper loading and navigation`,
          proposedFix: 'Test route accessibility and component rendering',
          impact: 'Users may not be able to access key application features'
        });
      });

      // BACKEND AUDIT
      setAuditProgress(30);
      console.log('🔧 Auditing Backend...');

      try {
        const { data: healthCheck, error } = await supabase
          .from('vendors')
          .select('count')
          .limit(1);

        if (error) {
          findings.push({
            id: 'db_connectivity',
            category: 'backend',
            location: 'Supabase Database',
            type: 'error',
            severity: 'critical',
            status: 'broken',
            description: `Database connectivity failed: ${error.message}`,
            proposedFix: 'Check Supabase connection and RLS policies',
            impact: 'Application cannot function without database access'
          });
        } else {
          findings.push({
            id: 'db_connectivity',
            category: 'backend',
            location: 'Supabase Database',
            type: 'integration',
            severity: 'low',
            status: 'ready',
            description: 'Database connectivity is working',
            proposedFix: 'No action needed',
            impact: 'Core functionality is accessible'
          });
        }
      } catch (dbError) {
        findings.push({
          id: 'db_connectivity_critical',
          category: 'backend',
          location: 'Supabase Database',
          type: 'error',
          severity: 'critical',
          status: 'broken',
          description: `Critical database error: ${dbError}`,
          proposedFix: 'Immediate database configuration review required',
          impact: 'Application is completely non-functional'
        });
      }

      // Check critical tables
      setAuditProgress(40);
      const criticalTables = [
        'vendors', 'menus', 'menu_items', 'orders', 'order_items',
        'payments', 'ai_waiter_logs', 'profiles', 'guest_sessions'
      ];

      for (const tableName of criticalTables) {
        try {
          const { data, error } = await supabase
            .from(tableName as any)
            .select('*')
            .limit(1);

          if (error) {
            findings.push({
              id: `table_${tableName}`,
              category: 'database',
              location: `Table: ${tableName}`,
              type: 'error',
              severity: 'critical',
              status: 'broken',
              description: `Table ${tableName} query failed: ${error.message}`,
              proposedFix: 'Check table exists and RLS policies allow access',
              impact: 'Core application functionality may be impaired'
            });
          } else {
            findings.push({
              id: `table_${tableName}`,
              category: 'database',
              location: `Table: ${tableName}`,
              type: 'integration',
              severity: 'low',
              status: 'ready',
              description: `Table ${tableName} is accessible`,
              proposedFix: 'No action needed',
              impact: 'Table functionality is working correctly'
            });
          }
        } catch (tableError) {
          findings.push({
            id: `table_${tableName}_critical`,
            category: 'database',
            location: `Table: ${tableName}`,
            type: 'error',
            severity: 'critical',
            status: 'broken',
            description: `Failed to query table ${tableName}: ${tableError}`,
            proposedFix: 'Verify table exists and permissions are correct',
            impact: 'Critical data operations may fail'
          });
        }
      }

      // AI INTEGRATION AUDIT
      setAuditProgress(60);
      console.log('🤖 Auditing AI Integration...');

      const aiEdgeFunctions = [
        'ai-code-evaluator',
        'ai-task-review', 
        'ai-error-handler',
        'ai-error-fix',
        'ai-ux-recommendation'
      ];

      for (const functionName of aiEdgeFunctions) {
        try {
          const { data, error } = await supabase.functions.invoke(functionName, {
            body: { test: true }
          });

          if (error) {
            findings.push({
              id: `ai_function_${functionName}`,
              category: 'ai',
              location: `Edge Function: ${functionName}`,
              type: 'integration',
              severity: 'high',
              status: 'broken',
              description: `AI edge function ${functionName} returned error: ${error.message}`,
              proposedFix: 'Check function deployment and API key configuration',
              impact: 'AI-powered features may not work correctly'
            });
          } else {
            findings.push({
              id: `ai_function_${functionName}`,
              category: 'ai',
              location: `Edge Function: ${functionName}`,
              type: 'integration',
              severity: 'low',
              status: 'ready',
              description: `AI edge function ${functionName} is deployed and responding`,
              proposedFix: 'No action needed',
              impact: 'AI functionality is operational'
            });
          }
        } catch (functionError) {
          findings.push({
            id: `ai_function_${functionName}_critical`,
            category: 'ai',
            location: `Edge Function: ${functionName}`,
            type: 'error',
            severity: 'critical',
            status: 'broken',
            description: `Failed to invoke ${functionName}: ${functionError}`,
            proposedFix: 'Deploy function and verify configuration',
            impact: 'AI features are completely non-functional'
          });
        }
      }

      // SECURITY AUDIT
      setAuditProgress(80);
      console.log('🔒 Auditing Security...');

      try {
        const { data: session } = await supabase.auth.getSession();
        
        findings.push({
          id: 'auth_system',
          category: 'security',
          location: 'Authentication System',
          type: 'integration',
          severity: 'medium',
          status: 'ready',
          description: 'Authentication system is active',
          proposedFix: 'Verify guest session persistence and vendor email auth',
          impact: 'User authentication is functional'
        });
      } catch (authError) {
        findings.push({
          id: 'auth_system_error',
          category: 'security',
          location: 'Authentication System',
          type: 'error',
          severity: 'critical',
          status: 'broken',
          description: `Authentication system error: ${authError}`,
          proposedFix: 'Fix Supabase auth configuration',
          impact: 'User authentication may fail completely'
        });
      }

      // PERFORMANCE AUDIT
      setAuditProgress(90);
      console.log('⚡ Auditing Performance...');

      if (typeof window !== 'undefined') {
        const hasGlobalErrorHandler = window.onerror !== null;
        const hasUnhandledRejectionHandler = window.onunhandledrejection !== null;

        if (!hasGlobalErrorHandler) {
          findings.push({
            id: 'global_error_handler',
            category: 'performance',
            location: 'Global Error Handling',
            type: 'missing',
            severity: 'high',
            status: 'needs_fixing',
            description: 'Global error handler not configured',
            proposedFix: 'Implement window.onerror handler with AI error reporting',
            impact: 'Unhandled errors may not be captured or reported'
          });
        }

        if (!hasUnhandledRejectionHandler) {
          findings.push({
            id: 'promise_error_handler',
            category: 'performance',
            location: 'Promise Error Handling',
            type: 'missing',
            severity: 'high',
            status: 'needs_fixing',
            description: 'Unhandled promise rejection handler not configured',
            proposedFix: 'Implement window.onunhandledrejection handler',
            impact: 'Promise rejections may go unnoticed'
          });
        }
      }

      setAuditProgress(100);

      // Generate report summary
      const categorizedFindings = {
        frontend: findings.filter(f => f.category === 'frontend'),
        backend: findings.filter(f => f.category === 'backend'),
        database: findings.filter(f => f.category === 'database'),
        ai: findings.filter(f => f.category === 'ai'),
        security: findings.filter(f => f.category === 'security'),
        performance: findings.filter(f => f.category === 'performance')
      };

      const totalFindings = findings.length;
      const criticalIssues = findings.filter(f => f.severity === 'critical').length;
      const readyItems = findings.filter(f => f.status === 'ready').length;
      const brokenItems = findings.filter(f => f.status === 'broken').length;
      
      const productionReadinessScore = Math.max(0, Math.round(
        ((readyItems / totalFindings) * 60) + 
        (((totalFindings - criticalIssues) / totalFindings) * 40)
      ));

      const report: AuditReport = {
        timestamp: new Date().toISOString(),
        findings,
        summary: {
          totalFindings,
          criticalIssues,
          readyItems,
          brokenItems,
          productionReadinessScore
        },
        categories: categorizedFindings
      };

      setAuditReport(report);

      // Log to system
      try {
        await supabase.from('system_logs').insert({
          log_type: 'fullstack_audit',
          component: 'audit_report',
          message: `Fullstack audit completed with ${productionReadinessScore}% readiness score`,
          metadata: {
            total_findings: totalFindings,
            critical_issues: criticalIssues,
            ready_items: readyItems,
            broken_items: brokenItems,
            production_readiness_score: productionReadinessScore,
            timestamp: new Date().toISOString()
          } as any,
          severity: productionReadinessScore >= 80 ? 'info' : productionReadinessScore >= 60 ? 'warning' : 'error'
        });
      } catch (logError) {
        console.warn('Failed to log audit results:', logError);
      }

    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsRunningAudit(false);
    }
  };

  useEffect(() => {
    runFullAudit();
  }, []);

  return {
    auditReport,
    isRunningAudit,
    auditProgress,
    runFullAudit
  };
};
