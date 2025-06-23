
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Server, 
  TestTube, 
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import CoreAppTester from './CoreAppTester';
import ICUPAProductionValidator from './ICUPAProductionValidator';
import DatabaseExpansionPlanner from './DatabaseExpansionPlanner';

interface SystemStatus {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  score: number;
  lastCheck: string;
}

const FullstackSystemDashboard: React.FC = () => {
  const [systemStatus] = useState<SystemStatus[]>([
    {
      component: 'Core App Functionality',
      status: 'healthy',
      score: 95,
      lastCheck: '2 minutes ago'
    },
    {
      component: 'Production System',
      status: 'degraded',
      score: 78,
      lastCheck: '5 minutes ago'
    },
    {
      component: 'Database Performance',
      status: 'healthy',
      score: 92,
      lastCheck: '1 minute ago'
    }
  ]);

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

  const overallScore = Math.round(
    systemStatus.reduce((acc, status) => acc + status.score, 0) / systemStatus.length
  );

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            ICUPA Fullstack System Status
          </CardTitle>
          <CardDescription>
            Comprehensive monitoring of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">{overallScore}%</div>
              <div className="text-sm text-gray-600">Overall Health</div>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {systemStatus.map((status) => (
              <div key={status.component} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <div className="font-medium">{status.component}</div>
                    <div className="text-sm text-gray-600">{status.lastCheck}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={getStatusColor(status.status)}>
                    {status.status}
                  </Badge>
                  <div className="text-sm font-medium">{status.score}%</div>
                </div>
              </div>
            ))}
          </div>
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
