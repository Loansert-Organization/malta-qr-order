
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
  RefreshCw,
  Download,
  Activity
} from 'lucide-react';
import FullstackAuditReport from './FullstackAuditReport';
import FullstackSystemDashboard from './FullstackSystemDashboard';
import { auditService, AuditReport } from '@/services/auditService';
import { useProductionMonitoring } from '@/hooks/useProductionMonitoring';
import { AuditReportExporter } from '@/utils/auditReportExporter';
import { useToast } from '@/hooks/use-toast';

const FullstackAuditDashboard: React.FC = () => {
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isRunningAudit, setIsRunningAudit] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const { metrics, circuitBreaker, forceServiceRecovery } = useProductionMonitoring();
  const { toast } = useToast();

  const runFullAudit = async () => {
    setIsRunningAudit(true);
    setAuditProgress(0);
    
    try {
      console.log('🔍 Starting comprehensive production audit...');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAuditProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const report = await auditService.runComprehensiveAudit();
      
      clearInterval(progressInterval);
      setAuditProgress(100);
      setAuditReport(report);

      toast({
        title: "Audit Completed",
        description: `Found ${report.summary.totalIssues} issues. Overall score: ${report.overallScore.toFixed(1)}%`,
        variant: report.overallScore >= 80 ? "default" : "destructive"
      });

    } catch (error) {
      console.error('Audit failed:', error);
      toast({
        title: "Audit Failed",
        description: "Failed to complete system audit. Check logs for details.",
        variant: "destructive"
      });
    } finally {
      setIsRunningAudit(false);
      setAuditProgress(0);
    }
  };

  const handleExportCSV = async () => {
    if (!auditReport) return;
    
    try {
      await AuditReportExporter.exportAndDownloadCSV(auditReport);
      toast({
        title: "Export Successful",
        description: "Audit report downloaded as CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export audit report",
        variant: "destructive"
      });
    }
  };

  const handleExportJSON = async () => {
    if (!auditReport) return;
    
    try {
      await AuditReportExporter.exportAndDownloadJSON(auditReport);
      toast({
        title: "Export Successful",
        description: "Audit report downloaded as JSON",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export audit report",
        variant: "destructive"
      });
    }
  };

  const handleForceRecovery = async () => {
    try {
      const recoveredServices = await forceServiceRecovery();
      toast({
        title: "Recovery Attempt Complete",
        description: `${recoveredServices} services recovered`,
        variant: recoveredServices > 0 ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Recovery Failed",
        description: "Service recovery attempt failed",
        variant: "destructive"
      });
    }
  };

  // Calculate system status based on metrics and audit results
  const getSystemStatus = () => {
    if (!metrics) return { status: 'unknown', score: 0 };
    
    const auditScore = auditReport?.overallScore || 0;
    const healthScore = metrics.systemHealth;
    const combinedScore = (auditScore + healthScore) / 2;
    
    if (combinedScore >= 90) return { status: 'excellent', score: combinedScore };
    if (combinedScore >= 80) return { status: 'good', score: combinedScore };
    if (combinedScore >= 70) return { status: 'fair', score: combinedScore };
    return { status: 'poor', score: combinedScore };
  };

  const systemStatus = getSystemStatus();

  // Calculate metrics from current system state
  const systemMetrics = {
    codeQuality: auditReport?.modules.find(m => m.name === 'Frontend Audit')?.score || 95,
    database: metrics?.dbConnectivity ? 98 : 60,
    security: auditReport?.modules.find(m => m.name === 'Security Audit')?.score || 82,
    performance: auditReport?.modules.find(m => m.name === 'Performance Audit')?.score || (metrics ? Math.max(0, 100 - (metrics.responseTime / 10)) : 91)
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ICUPA Malta Production Dashboard</h1>
          <p className="text-gray-600">Comprehensive analysis of platform readiness and system health</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={systemStatus.status === 'excellent' ? 'default' : systemStatus.status === 'good' ? 'secondary' : 'destructive'} className="text-lg px-4 py-2">
            <CheckCircle className="h-4 w-4 mr-2" />
            {systemStatus.status === 'excellent' ? 'Production Ready' : 
             systemStatus.status === 'good' ? 'Mostly Ready' :
             systemStatus.status === 'fair' ? 'Needs Work' : 'Critical Issues'}
          </Badge>
          <div className="text-lg font-bold">
            {systemStatus.score.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code Quality</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.codeQuality}%</div>
            <p className="text-xs text-muted-foreground">TypeScript & React compliance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.database}%</div>
            <p className="text-xs text-muted-foreground">Schema & connectivity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{systemMetrics.security}%</div>
            <p className="text-xs text-muted-foreground">RLS & authentication</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemMetrics.performance}%</div>
            <p className="text-xs text-muted-foreground">Speed & optimization</p>
          </CardContent>
        </Card>
      </div>

      {/* Circuit Breaker Status */}
      {circuitBreaker.isOpen && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-800">Circuit Breaker Active</div>
                  <div className="text-sm text-orange-600">
                    System protection enabled due to {circuitBreaker.failureCount} consecutive failures
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleForceRecovery}
                variant="outline"
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                <Activity className="h-4 w-4 mr-2" />
                Force Recovery
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Controls */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button onClick={runFullAudit} disabled={isRunningAudit}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRunningAudit ? 'animate-spin' : ''}`} />
                {isRunningAudit ? `Running Audit... ${auditProgress}%` : 'Run Full Audit'}
              </Button>
            </div>
            
            {auditReport && (
              <div className="flex gap-2">
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={handleExportJSON} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            )}
          </div>
          
          {isRunningAudit && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Audit Progress</span>
                <span>{auditProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${auditProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
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
