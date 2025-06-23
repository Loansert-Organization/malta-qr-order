
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Server, 
  TestTube, 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  Shield,
  Monitor
} from 'lucide-react';
import { useProductionMonitoring } from '@/hooks/useProductionMonitoring';
import CoreAppTester from './CoreAppTester';
import ICUPAProductionValidator from './ICUPAProductionValidator';
import DatabaseExpansionPlanner from './DatabaseExpansionPlanner';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  lastCheck: string;
  responseTime?: number;
  details?: string;
}

const FullstackSystemDashboard: React.FC = () => {
  const { metrics, serviceHealth, runQuickHealthCheck } = useProductionMonitoring();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'default';
      case 'degraded':
        return 'secondary';
      case 'unhealthy':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await runQuickHealthCheck();
    setIsRefreshing(false);
  };

  // Convert monitoring data to system status format
  const systemStatus: SystemStatus[] = [
    {
      component: 'Database',
      status: serviceHealth.db ? 'healthy' : 'unhealthy',
      score: serviceHealth.db ? 100 : 0,
      lastCheck: 'Just now',
      responseTime: serviceHealth.responseTimes.db,
      details: serviceHealth.db ? 'All connections stable' : 'Connection issues detected'
    },
    {
      component: 'API Services',
      status: serviceHealth.api ? 'healthy' : 'unhealthy',
      score: serviceHealth.api ? 100 : 0,
      lastCheck: 'Just now',
      responseTime: serviceHealth.responseTimes.api,
      details: serviceHealth.api ? 'All endpoints responding' : 'API endpoints unavailable'
    },
    {
      component: 'Edge Functions',
      status: serviceHealth.edge ? 'healthy' : 'degraded',
      score: serviceHealth.edge ? 95 : 60,
      lastCheck: 'Just now',
      responseTime: serviceHealth.responseTimes.edge,
      details: serviceHealth.edge ? 'Functions operational' : 'Some functions may be slow'
    },
    {
      component: 'Authentication',
      status: serviceHealth.auth ? 'healthy' : 'unhealthy',
      score: serviceHealth.auth ? 100 : 0,
      lastCheck: 'Just now',
      responseTime: serviceHealth.responseTimes.auth,
      details: serviceHealth.auth ? 'Auth services active' : 'Authentication issues'
    }
  ];

  const overallScore = Math.round(
    systemStatus.reduce((acc, status) => acc + status.score, 0) / systemStatus.length
  );

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                ICUPA Fullstack System Status
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all system components
              </CardDescription>
            </div>
            <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overallScore}%</div>
              <div className="text-sm text-gray-600">Overall Health</div>
              <Progress value={overallScore} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {systemStatus.filter(s => s.status === 'healthy').length}
              </div>
              <div className="text-sm text-gray-600">Healthy Components</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {systemStatus.filter(s => s.status === 'degraded').length}
              </div>
              <div className="text-sm text-gray-600">Degraded Components</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {systemStatus.filter(s => s.status === 'unhealthy').length}
              </div>
              <div className="text-sm text-gray-600">Unhealthy Components</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemStatus.map((status) => (
              <Card key={status.component}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(status.status)}
                      <div>
                        <div className="font-medium">{status.component}</div>
                        <div className="text-sm text-gray-600">{status.details}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={getStatusColor(status.status)}>
                        {status.status}
                      </Badge>
                      <div className="text-sm font-medium">{status.score}%</div>
                    </div>
                  </div>
                  {status.responseTime && (
                    <div className="text-xs text-gray-500">
                      Response time: {status.responseTime}ms
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {metrics && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Performance</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
                  <div className="text-sm text-gray-600">Avg Response Time</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Security</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.lastAuditScore}%</div>
                  <div className="text-sm text-gray-600">Security Score</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-orange-600" />
                    <span className="font-medium">Issues</span>
                  </div>
                  <div className="text-2xl font-bold">{metrics.activeIssues}</div>
                  <div className="text-sm text-gray-600">Active Issues</div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Components */}
      <Tabs defaultValue="core-testing" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="core-testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Core App Testing
          </TabsTrigger>
          <TabsTrigger value="production-validation" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Production Validation
          </TabsTrigger>
          <TabsTrigger value="database-planning" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Planning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core-testing">
          <CoreAppTester />
        </TabsContent>

        <TabsContent value="production-validation">
          <ICUPAProductionValidator />
        </TabsContent>

        <TabsContent value="database-planning">
          <DatabaseExpansionPlanner />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FullstackSystemDashboard;
