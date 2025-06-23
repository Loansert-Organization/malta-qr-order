
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Activity,
  Shield,
  Database,
  Globe,
  Zap,
  Brain,
  Bug,
  Code,
  Users,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AuditFinding {
  id: string;
  category: 'frontend' | 'backend' | 'database' | 'ai' | 'security' | 'performance';
  location: string;
  type: 'bug' | 'missing' | 'ux' | 'integration' | 'error' | 'incomplete';
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'ready' | 'needs_fixing' | 'broken';
  description: string;
  proposedFix: string;
  impact: string;
}

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

const FullstackAuditReport: React.FC = () => {
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  const runFullAudit = async () => {
    setIsRunningAudit(true);
    setAuditProgress(0);

    try {
      console.log('🔍 Starting comprehensive fullstack audit...');
      
      // Initialize findings array
      const findings: AuditFinding[] = [];

      // FRONTEND AUDIT
      setAuditProgress(10);
      console.log('🖥️ Auditing Frontend...');
      
      // Check critical routes
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

      // Check database connectivity
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

      // Authentication check
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

      // Check for global error handlers
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
      
      // Calculate production readiness score
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

  const getStatusIcon = (status: AuditFinding['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs_fixing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'broken':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getSeverityBadge = (severity: AuditFinding['severity']) => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500', 
      medium: 'bg-yellow-500',
      low: 'bg-blue-500'
    };
    
    return (
      <Badge className={`${colors[severity]} text-white`}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'frontend':
        return <Globe className="h-6 w-6" />;
      case 'backend':
        return <Database className="h-6 w-6" />;
      case 'database':
        return <Database className="h-6 w-6" />;
      case 'ai':
        return <Brain className="h-6 w-6" />;
      case 'security':
        return <Shield className="h-6 w-6" />;
      case 'performance':
        return <Zap className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  useEffect(() => {
    // Auto-run audit on component mount
    runFullAudit();
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ICUPA Malta Fullstack Audit Report</h1>
          <p className="text-gray-600">Comprehensive production readiness analysis</p>
        </div>
        <Button onClick={runFullAudit} disabled={isRunningAudit}>
          {isRunningAudit ? 'Running Audit...' : 'Run New Audit'}
        </Button>
      </div>

      {/* Progress */}
      {isRunningAudit && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Activity className="h-6 w-6 animate-spin text-blue-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">Running comprehensive audit...</p>
                <Progress value={auditProgress} className="mt-2" />
              </div>
              <span className="text-sm text-gray-500">{auditProgress}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      {auditReport && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {auditReport.summary.productionReadinessScore}%
                  </div>
                  <div className="text-sm text-gray-600">Production Ready</div>
                  <Progress 
                    value={auditReport.summary.productionReadinessScore} 
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {auditReport.summary.criticalIssues}
                    </div>
                    <div className="text-sm text-gray-600">Critical Issues</div>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {auditReport.summary.readyItems}
                    </div>
                    <div className="text-sm text-gray-600">Ready Items</div>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">
                      {auditReport.summary.totalFindings}
                    </div>
                    <div className="text-sm text-gray-600">Total Findings</div>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Production Readiness Alert */}
          {auditReport.summary.productionReadinessScore < 80 && (
            <Alert className="border-yellow-500 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Production Readiness Warning</AlertTitle>
              <AlertDescription>
                System readiness score is {auditReport.summary.productionReadinessScore}%. 
                Recommended minimum is 80% for production deployment. 
                Please address critical and high-priority issues.
              </AlertDescription>
            </Alert>
          )}

          {/* Audit Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Object.entries(auditReport.categories).map(([category, findings]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span className="capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant="outline">{findings.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {findings.filter(i => i.status === 'ready').length} ready, {' '}
                    {findings.filter(i => i.status === 'broken').length} broken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {findings.map((finding) => (
                      <div key={finding.id} className="flex items-start space-x-3 p-3 border rounded">
                        {getStatusIcon(finding.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {finding.location}
                            </p>
                            {getSeverityBadge(finding.severity)}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {finding.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Fix: {finding.proposedFix}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Impact: {finding.impact}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final Report */}
          <Card>
            <CardHeader>
              <CardTitle>Final Production Readiness Assessment</CardTitle>
              <CardDescription>Generated at {new Date(auditReport.timestamp).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <div className="text-lg font-semibold text-green-600">
                      ✅ {auditReport.summary.readyItems} Ready
                    </div>
                    <div className="text-sm text-gray-600">Fully functional</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-lg font-semibold text-yellow-600">
                      🟡 {auditReport.summary.totalFindings - auditReport.summary.readyItems - auditReport.summary.brokenItems} Need Fixing
                    </div>
                    <div className="text-sm text-gray-600">Minor improvements</div>
                  </div>
                  <div className="text-center p-4 border rounded">
                    <div className="text-lg font-semibold text-red-600">
                      🔴 {auditReport.summary.brokenItems} Broken
                    </div>
                    <div className="text-sm text-gray-600">Critical issues</div>
                  </div>
                </div>

                {auditReport.summary.productionReadinessScore >= 90 ? (
                  <Alert className="border-green-500 bg-green-50">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>🎉 Production Ready!</AlertTitle>
                    <AlertDescription>
                      System achieved {auditReport.summary.productionReadinessScore}% readiness score. 
                      ICUPA Malta is ready for production deployment.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="border-orange-500 bg-orange-50">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                      {auditReport.summary.criticalIssues > 0 && `${auditReport.summary.criticalIssues} critical issues must be resolved. `}
                      System needs {90 - auditReport.summary.productionReadinessScore}% improvement to reach production readiness.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default FullstackAuditReport;
