
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Database, 
  Shield, 
  Zap,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import FullstackAuditReport from './FullstackAuditReport';
import FullstackSystemDashboard from './FullstackSystemDashboard';
import { auditService, AuditReport } from '@/services/auditService';
import { useProductionMonitoring } from '@/hooks/useProductionMonitoring';

const FullstackAuditDashboard: React.FC = () => {
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const { metrics } = useProductionMonitoring();

  const runFullAudit = async () => {
    setIsRunningAudit(true);
    try {
      const report = await auditService.runComprehensiveAudit();
      setAuditReport(report);
    } catch (error) {
      console.error('Audit failed:', error);
    } finally {
      setIsRunningAudit(false);
    }
  };

  // Calculate metrics from current system state
  const systemMetrics = {
    codeQuality: metrics?.systemHealth || 95,
    database: metrics?.dbConnectivity ? 98 : 60,
    security: metrics?.lastAuditScore || 82,
    performance: metrics ? Math.max(0, 100 - (metrics.responseTime / 10)) : 91
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ICUPA Malta Production Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis of platform readiness and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-lg px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            {auditReport && auditReport.overallScore >= 90 ? 'Production Ready' : 'In Development'}
          </Badge>
          <Button onClick={runFullAudit} disabled={isRunningAudit}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunningAudit ? 'animate-spin' : ''}`} />
            {isRunningAudit ? 'Running Audit...' : 'Run Full Audit'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.codeQuality}%</div>
            <p className="text-xs text-muted-foreground">TypeScript compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.database}%</div>
            <p className="text-xs text-muted-foreground">Schema integrity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{systemMetrics.security}%</div>
            <p className="text-xs text-muted-foreground">Security score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.performance}%</div>
            <p className="text-xs text-muted-foreground">Optimization level</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="audit-report" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="audit-report">Audit Report</TabsTrigger>
          <TabsTrigger value="system-dashboard">System Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="audit-report">
          <FullstackAuditReport 
            report={auditReport} 
            onRunAudit={runFullAudit}
            isRunning={isRunningAudit}
          />
        </TabsContent>

        <TabsContent value="system-dashboard">
          <FullstackSystemDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FullstackAuditDashboard;
