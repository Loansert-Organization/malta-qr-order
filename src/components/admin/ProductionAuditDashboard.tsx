
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
  Brain
} from 'lucide-react';
import { productionAuditService, AuditReport, AuditIssue } from '@/services/productionAudit';
import { useAISupervision } from '@/hooks/useAISupervision';

const ProductionAuditDashboard: React.FC = () => {
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [isFixingIssues, setIsFixingIssues] = useState(false);
  const { reviewTask, logSystemEvent } = useAISupervision();

  const runFullAudit = async () => {
    setIsRunningAudit(true);
    try {
      await logSystemEvent('audit_started', 'Production readiness audit initiated');
      
      const report = await productionAuditService.performFullAudit();
      setAuditReport(report);
      
      await logSystemEvent('audit_completed', `Audit completed with ${report.summary.productionReadinessScore}% readiness score`);
      
      // Trigger AI task review
      await reviewTask('Production Audit', JSON.stringify(report.summary), {
        description: 'Comprehensive production readiness audit completed',
        screenName: 'Production Audit Dashboard'
      });
      
    } catch (error) {
      console.error('Audit failed:', error);
      await logSystemEvent('audit_failed', `Audit failed: ${error}`);
    } finally {
      setIsRunningAudit(false);
    }
  };

  const fixCriticalIssues = async () => {
    if (!auditReport) return;
    
    setIsFixingIssues(true);
    try {
      await productionAuditService.fixCriticalIssues(auditReport);
      await productionAuditService.applyUXRecommendations();
      
      // Re-run audit after fixes
      await runFullAudit();
    } catch (error) {
      console.error('Failed to fix issues:', error);
    } finally {
      setIsFixingIssues(false);
    }
  };

  const getStatusIcon = (status: AuditIssue['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'needs_fixing':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'broken':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getSeverityBadge = (severity: AuditIssue['severity']) => {
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
      case 'aiIntegration':
        return <Brain className="h-6 w-6" />;
      case 'errorHandling':
        return <Shield className="h-6 w-6" />;
      case 'deployment':
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
          <h1 className="text-3xl font-bold">Production Readiness Audit</h1>
          <p className="text-gray-600">Comprehensive fullstack system analysis</p>
        </div>
        <div className="flex space-x-4">
          <Button 
            onClick={runFullAudit}
            disabled={isRunningAudit}
            variant="outline"
          >
            {isRunningAudit ? 'Running Audit...' : 'Run New Audit'}
          </Button>
          {auditReport && auditReport.summary.criticalIssues > 0 && (
            <Button 
              onClick={fixCriticalIssues}
              disabled={isFixingIssues}
              variant="destructive"
            >
              {isFixingIssues ? 'Fixing Issues...' : 'Fix Critical Issues'}
            </Button>
          )}
        </div>
      </div>

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
                      {auditReport.summary.totalIssues}
                    </div>
                    <div className="text-sm text-gray-600">Total Items</div>
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
            {Object.entries(auditReport.categories).map(([category, issues]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span className="capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <Badge variant="outline">{issues.length}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {issues.filter(i => i.status === 'ready').length} ready, {' '}
                    {issues.filter(i => i.status === 'broken').length} broken
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {issues.slice(0, 10).map((issue) => (
                      <div key={issue.id} className="flex items-start space-x-3 p-3 border rounded">
                        {getStatusIcon(issue.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {issue.location}
                            </p>
                            {getSeverityBadge(issue.severity)}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            {issue.description}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Fix: {issue.proposedFix}
                          </p>
                        </div>
                      </div>
                    ))}
                    {issues.length > 10 && (
                      <div className="text-center text-sm text-gray-500">
                        +{issues.length - 10} more items...
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Final Report */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Summary & Recommendations</CardTitle>
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
                      🟡 {auditReport.summary.totalIssues - auditReport.summary.readyItems - auditReport.summary.brokenItems} Need Fixing
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

      {isRunningAudit && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-lg">Running comprehensive production audit...</p>
          <p className="text-sm text-gray-600">Checking frontend, backend, AI integration, and deployment readiness</p>
        </div>
      )}
    </div>
  );
};

export default ProductionAuditDashboard;
