
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Download,
  RefreshCw
} from 'lucide-react';
import { AuditReport } from '@/services/auditService';

interface FullstackAuditReportProps {
  report?: AuditReport;
  onRunAudit?: () => void;
  isRunning?: boolean;
}

const FullstackAuditReport: React.FC<FullstackAuditReportProps> = ({ 
  report, 
  onRunAudit, 
  isRunning = false 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const exportReport = () => {
    if (!report) return;
    
    const exportData = {
      reportId: report.id,
      timestamp: report.timestamp,
      overallScore: report.overallScore,
      summary: report.summary,
      modules: report.modules.map(module => ({
        name: module.name,
        status: module.status,
        score: module.score,
        issues: module.issues.length,
        duration: module.duration
      }))
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `icupa-audit-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (!report) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Report</CardTitle>
          <CardDescription>No audit report available</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onRunAudit} disabled={isRunning}>
            {isRunning ? 'Running Audit...' : 'Run Audit'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(report.status)}
                ICUPA Fullstack Audit Report
              </CardTitle>
              <CardDescription>
                Generated on {new Date(report.timestamp).toLocaleString()}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={exportReport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button onClick={onRunAudit} disabled={isRunning}>
                <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
                {isRunning ? 'Running...' : 'Re-run Audit'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {report.overallScore.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {report.summary.criticalIssues}
              </div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {report.summary.highIssues}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {report.modules.filter(m => m.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">Modules Passed</div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.modules.map((module) => (
                  <Card key={module.name}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{module.name}</CardTitle>
                        {getStatusIcon(module.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center mb-2">
                        <span>Score: {module.score}%</span>
                        <span>Issues: {module.issues.length}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {module.duration}ms
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-4">
              {report.modules.map((module) => (
                <Card key={module.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(module.status)}
                      {module.name}
                    </CardTitle>
                    <CardDescription>{module.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="text-lg font-semibold">{module.score}%</div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{module.issues.length}</div>
                        <div className="text-sm text-gray-600">Issues Found</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{module.duration}ms</div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Last run: {module.lastRun}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {report.modules.flatMap(module => module.issues).map((issue) => (
                <Card key={issue.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{issue.location}</CardTitle>
                      <Badge className={getSeverityColor(issue.severity)}>
                        {issue.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <strong>Issue:</strong> {issue.description}
                      </div>
                      <div>
                        <strong>Category:</strong> {issue.category}
                      </div>
                      <div>
                        <strong>Recommendation:</strong> {issue.recommendation}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong>
                        <Badge variant={issue.status === 'resolved' ? 'default' : 'secondary'}>
                          {issue.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FullstackAuditReport;
