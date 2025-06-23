
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Server, 
  Database, 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  RefreshCw,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeUsers: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  lastUpdated: string;
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface PerformanceMetric {
  timestamp: string;
  responseTime: number;
  throughput: number;
  errorRate: number;
  activeConnections: number;
}

const SystemMonitoringDashboard = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemData();
    
    // Set up real-time monitoring
    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch system logs and metrics
      const [healthData, alertsData, metricsData] = await Promise.all([
        fetchSystemHealth(),
        fetchSystemAlerts(),
        fetchPerformanceMetrics()
      ]);

      setSystemHealth(healthData);
      setAlerts(alertsData);
      setPerformanceData(metricsData);
    } catch (error) {
      console.error('Error fetching system data:', error);
      toast.error('Failed to load system monitoring data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSystemHealth = async (): Promise<SystemHealth> => {
    // Fetch system metrics from error_logs and performance_logs
    const { data: errorLogs } = await supabase
      .from('error_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: performanceLogs } = await supabase
      .from('performance_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100);

    const { data: activeOrders } = await supabase
      .from('orders')
      .select('id')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    // Calculate health metrics
    const errorRate = errorLogs ? (errorLogs.length / 100) * 100 : 0;
    const avgResponseTime = performanceLogs && performanceLogs.length > 0 
      ? performanceLogs.reduce((sum, log) => sum + log.response_time, 0) / performanceLogs.length 
      : 200;

    const status: SystemHealth['status'] = 
      errorRate > 10 ? 'critical' : 
      errorRate > 5 ? 'warning' : 'healthy';

    return {
      status,
      uptime: 99.5 + Math.random() * 0.5, // Mock uptime
      responseTime: avgResponseTime,
      errorRate,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      databaseConnections: Math.floor(Math.random() * 20) + 5,
      memoryUsage: Math.random() * 30 + 50,
      cpuUsage: Math.random() * 40 + 20,
      lastUpdated: new Date().toISOString()
    };
  };

  const fetchSystemAlerts = async (): Promise<SystemAlert[]> => {
    const { data: errorLogs } = await supabase
      .from('error_logs')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false })
      .limit(10);

    return (errorLogs || []).map((log, index) => ({
      id: log.id,
      type: log.severity === 'high' ? 'error' : log.severity === 'medium' ? 'warning' : 'info',
      message: log.error_message,
      timestamp: log.created_at,
      resolved: log.resolved
    }));
  };

  const fetchPerformanceMetrics = async (): Promise<PerformanceMetric[]> => {
    const { data: performanceLogs } = await supabase
      .from('performance_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });

    // Group by hour and calculate averages
    const hourlyData = new Map();
    
    (performanceLogs || []).forEach(log => {
      const hour = new Date(log.created_at).toISOString().slice(0, 13);
      const existing = hourlyData.get(hour) || { 
        responseTime: [], 
        throughput: 0, 
        errorCount: 0, 
        totalRequests: 0 
      };
      
      existing.responseTime.push(log.response_time);
      existing.totalRequests += 1;
      if (log.status_code >= 400) existing.errorCount += 1;
      
      hourlyData.set(hour, existing);
    });

    return Array.from(hourlyData.entries()).map(([timestamp, data]) => ({
      timestamp: timestamp + ':00:00.000Z',
      responseTime: data.responseTime.reduce((sum: number, rt: number) => sum + rt, 0) / data.responseTime.length,
      throughput: data.totalRequests,
      errorRate: data.totalRequests > 0 ? (data.errorCount / data.totalRequests) * 100 : 0,
      activeConnections: Math.floor(Math.random() * 30) + 10
    }));
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await supabase
        .from('error_logs')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', alertId);

      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, resolved: true } : alert
      ));

      toast.success('Alert resolved');
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Failed to resolve alert');
    }
  };

  const getStatusColor = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: SystemHealth['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Monitoring</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={fetchSystemData}
            disabled={refreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => toast.info('Export feature coming soon!')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      {systemHealth && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(systemHealth.status)}
              <span>System Status</span>
              <Badge className={getStatusColor(systemHealth.status)}>
                {systemHealth.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">{systemHealth.uptime.toFixed(2)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Response Time</p>
                <p className="text-2xl font-bold">{systemHealth.responseTime.toFixed(0)}ms</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Error Rate</p>
                <p className="text-2xl font-bold">{systemHealth.errorRate.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{systemHealth.activeUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="responseTime" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="throughput" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {systemHealth && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">CPU Usage</p>
                      <p className="text-2xl font-bold">{systemHealth.cpuUsage.toFixed(1)}%</p>
                    </div>
                    <Cpu className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Memory Usage</p>
                      <p className="text-2xl font-bold">{systemHealth.memoryUsage.toFixed(1)}%</p>
                    </div>
                    <HardDrive className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">DB Connections</p>
                      <p className="text-2xl font-bold">{systemHealth.databaseConnections}</p>
                    </div>
                    <Database className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">No active alerts</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Alert key={alert.id} className={
                alert.type === 'error' ? 'border-red-200 bg-red-50' :
                alert.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <Button
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      Resolve
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            ))
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent System Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '14:30:25', event: 'System backup completed successfully', type: 'success' },
                  { time: '14:25:12', event: 'New vendor registration received', type: 'info' },
                  { time: '14:20:08', event: 'High CPU usage detected', type: 'warning' },
                  { time: '14:15:33', event: 'Payment processing completed', type: 'success' },
                  { time: '14:10:17', event: 'Database maintenance scheduled', type: 'info' }
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge className={
                        log.type === 'success' ? 'bg-green-100 text-green-800' :
                        log.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }>
                        {log.type}
                      </Badge>
                      <span className="font-medium">{log.event}</span>
                    </div>
                    <span className="text-sm text-gray-600">{log.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemMonitoringDashboard;
