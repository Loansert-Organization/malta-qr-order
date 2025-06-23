
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Database, 
  Server, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Zap,
  Clock,
  Users,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

const SystemHealth = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      // Simulate fetching system metrics
      const mockMetrics: SystemMetric[] = [
        {
          name: 'CPU Usage',
          value: Math.random() * 100,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        },
        {
          name: 'Memory Usage',
          value: Math.random() * 100,
          unit: '%',
          status: Math.random() > 0.9 ? 'critical' : 'healthy',
          trend: 'stable'
        },
        {
          name: 'Database Connections',
          value: Math.floor(Math.random() * 100),
          unit: 'active',
          status: 'healthy',
          trend: 'up'
        },
        {
          name: 'API Response Time',
          value: Math.random() * 1000,
          unit: 'ms',
          status: Math.random() > 0.7 ? 'warning' : 'healthy',
          trend: 'down'
        },
        {
          name: 'Error Rate',
          value: Math.random() * 5,
          unit: '%',
          status: Math.random() > 0.8 ? 'warning' : 'healthy',
          trend: 'down'
        },
        {
          name: 'Storage Usage',
          value: Math.random() * 100,
          unit: '%',
          status: 'healthy',
          trend: 'up'
        }
      ];

      const mockServices: ServiceStatus[] = [
        {
          name: 'Database',
          status: Math.random() > 0.95 ? 'offline' : 'online',
          uptime: 99.9,
          responseTime: Math.random() * 50,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'AI Router',
          status: Math.random() > 0.9 ? 'degraded' : 'online',
          uptime: 99.5,
          responseTime: Math.random() * 200,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Payment Gateway',
          status: 'online',
          uptime: 99.8,
          responseTime: Math.random() * 100,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'Edge Functions',
          status: 'online',
          uptime: 99.7,
          responseTime: Math.random() * 150,
          lastCheck: new Date().toISOString()
        },
        {
          name: 'File Storage',
          status: 'online',
          uptime: 99.9,
          responseTime: Math.random() * 75,
          lastCheck: new Date().toISOString()
        }
      ];

      setMetrics(mockMetrics);
      setServices(mockServices);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching system health:', error);
      toast.error('Failed to fetch system health data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-600 rotate-180" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const runSystemMaintenance = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('system-maintenance', {
        body: { operation: 'full_maintenance' }
      });

      if (error) throw error;

      toast.success('System maintenance completed successfully');
      fetchSystemHealth();
    } catch (error) {
      console.error('Maintenance error:', error);
      toast.error('Failed to run system maintenance');
    } finally {
      setLoading(false);
    }
  };

  const overallHealthScore = metrics.reduce((acc, metric) => {
    const score = metric.status === 'healthy' ? 100 : metric.status === 'warning' ? 75 : 25;
    return acc + score;
  }, 0) / metrics.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">System Health</h2>
          <p className="text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={fetchSystemHealth}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          <Button
            onClick={runSystemMaintenance}
            disabled={loading}
            className="flex items-center space-x-2"
          >
            <Zap className="h-4 w-4" />
            <span>Run Maintenance</span>
          </Button>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Overall System Health</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Health Score</span>
              <span className="text-2xl font-bold">{Math.round(overallHealthScore)}%</span>
            </div>
            <Progress value={overallHealthScore} className="h-3" />
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{metrics.filter(m => m.status === 'healthy').length} Healthy</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span>{metrics.filter(m => m.status === 'warning').length} Warning</span>
              </div>
              <div className="flex items-center space-x-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span>{metrics.filter(m => m.status === 'critical').length} Critical</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">System Metrics</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(metric.trend)}
                      {getStatusIcon(metric.status)}
                    </div>
                  </div>
                  <div className="text-2xl font-bold mb-1">
                    {metric.value.toFixed(metric.unit === '%' ? 1 : 0)}
                    <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                  </div>
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4">
            {services.map((service, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {service.name === 'Database' && <Database className="h-5 w-5" />}
                        {service.name === 'AI Router' && <Zap className="h-5 w-5" />}
                        {service.name === 'Payment Gateway' && <Users className="h-5 w-5" />}
                        {service.name === 'Edge Functions' && <Server className="h-5 w-5" />}
                        {service.name === 'File Storage' && <Database className="h-5 w-5" />}
                        <span className="font-medium">{service.name}</span>
                      </div>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{service.uptime}% uptime</div>
                      <div className="text-gray-500">{service.responseTime.toFixed(0)}ms</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>Last checked: {new Date(service.lastCheck).toLocaleTimeString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>API Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Response Time</span>
                    <span className="font-medium">
                      {(metrics.find(m => m.name === 'API Response Time')?.value || 0).toFixed(0)}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Error Rate</span>
                    <span className="font-medium">
                      {(metrics.find(m => m.name === 'Error Rate')?.value || 0).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Connections</span>
                    <span className="font-medium">
                      {metrics.find(m => m.name === 'Database Connections')?.value || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resource Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>CPU Usage</span>
                      <span>{(metrics.find(m => m.name === 'CPU Usage')?.value || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.find(m => m.name === 'CPU Usage')?.value || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Memory Usage</span>
                      <span>{(metrics.find(m => m.name === 'Memory Usage')?.value || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.find(m => m.name === 'Memory Usage')?.value || 0} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Storage Usage</span>
                      <span>{(metrics.find(m => m.name === 'Storage Usage')?.value || 0).toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.find(m => m.name === 'Storage Usage')?.value || 0} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealth;
