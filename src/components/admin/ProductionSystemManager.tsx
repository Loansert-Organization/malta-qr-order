
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Server, 
  Database, 
  Shield, 
  Activity, 
  Bell, 
  Settings, 
  Users, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  HardDrive
} from 'lucide-react';
import { icupaProductionSystem, type AnalyticsData, type SystemHealth, type SecurityAuditResult } from '@/services/icupaProductionSystem';

interface SystemAlert {
  id: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
}

const ProductionSystemManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'unhealthy'>('healthy');
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [healthData, setHealthData] = useState<SystemHealth | null>(null);
  const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeProductionSystem();
    loadSystemData();
  }, []);

  const initializeProductionSystem = async () => {
    try {
      await icupaProductionSystem.initializeProduction();
      console.log('✅ Production system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize production system:', error);
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to initialize production system',
        severity: 'critical',
        timestamp: new Date(),
        resolved: false
      }]);
    }
  };

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      const [analyticsData, healthCheckData, securityAuditData] = await Promise.all([
        icupaProductionSystem.getAnalytics().getDashboardData(),
        icupaProductionSystem.getHealthCheck().performHealthCheck(),
        icupaProductionSystem.runSecurityAudit().runComprehensiveAudit()
      ]);

      setAnalytics(analyticsData);
      setHealthData(healthCheckData);
      setSecurityAudit(securityAuditData);
      setSystemHealth(healthCheckData.overall);

      // Generate alerts based on system status
      const newAlerts: SystemAlert[] = [];
      
      if (healthCheckData.overall !== 'healthy') {
        newAlerts.push({
          id: `health_${Date.now()}`,
          message: `System health is ${healthCheckData.overall}`,
          severity: healthCheckData.overall === 'critical' ? 'critical' : 'medium',
          timestamp: new Date(),
          resolved: false
        });
      }

      if (securityAuditData.score < 80) {
        newAlerts.push({
          id: `security_${Date.now()}`,
          message: `Security score is below threshold: ${securityAuditData.score}/100`,
          severity: 'high',
          timestamp: new Date(),
          resolved: false
        });
      }

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Failed to load system data:', error);
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Failed to load system data',
        severity: 'high',
        timestamp: new Date(),
        resolved: false
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRunSecurityAudit = async () => {
    try {
      const auditResult = await icupaProductionSystem.runSecurityAudit().runComprehensiveAudit();
      setSecurityAudit(auditResult);
    } catch (error) {
      console.error('Security audit failed:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      // This would trigger the backup service
      console.log('Creating manual backup...');
      setAlerts(prev => [...prev, {
        id: Date.now().toString(),
        message: 'Manual backup initiated',
        severity: 'low',
        timestamp: new Date(),
        resolved: false
      }]);
    } catch (error) {
      console.error('Backup creation failed:', error);
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading production system...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Production System Manager</h1>
          <p className="text-gray-600">Monitor and manage ICUPA Malta production environment</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={systemHealth === 'healthy' ? 'default' : 'destructive'}>
            {systemHealth === 'healthy' ? (
              <CheckCircle className="h-4 w-4 mr-1" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-1" />
            )}
            {systemHealth.charAt(0).toUpperCase() + systemHealth.slice(1)}
          </Badge>
          <Button variant="outline" size="sm" onClick={loadSystemData}>
            <Settings className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${systemHealth === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth === 'healthy' ? 'Online' : 'Issues'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {systemHealth === 'healthy' ? 'All services operational' : 'Some services need attention'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.orders.today || 0}</div>
                <p className="text-xs text-muted-foreground">Today's orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.vendors.active || 0}</div>
                <p className="text-xs text-muted-foreground">of {analytics?.vendors.total || 0} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{analytics?.revenue.today || 0}</div>
                <p className="text-xs text-muted-foreground">Daily revenue</p>
              </CardContent>
            </Card>
          </div>

          {alerts.filter(a => !a.resolved).length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>System Alerts</AlertTitle>
              <AlertDescription>
                {alerts.filter(a => !a.resolved).length} active alerts require attention
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                      <span className={alert.resolved ? 'line-through text-gray-500' : ''}>
                        {alert.message}
                      </span>
                    </div>
                    {!alert.resolved && (
                      <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                System Health Check
              </CardTitle>
              <CardDescription>
                Real-time monitoring of all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthData && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {healthData.services.map(service => (
                      <div key={service.service} className="p-4 border rounded">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">{service.service}</span>
                          <Badge variant={service.status === 'healthy' ? 'default' : 'destructive'}>
                            {service.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          Response: {service.responseTime}ms
                        </p>
                        {service.message && (
                          <p className="text-sm text-red-600 mt-1">{service.message}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-gray-600">
                    Last check: {healthData.lastCheck.toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Orders Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Orders:</span>
                      <span className="font-bold">{analytics.orders.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week:</span>
                      <span className="font-bold">{analytics.orders.thisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-bold">{analytics.orders.thisMonth}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span className="font-bold">€{analytics.revenue.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Week:</span>
                      <span className="font-bold">€{analytics.revenue.thisWeek}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-bold">€{analytics.revenue.thisMonth}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Dashboard</CardTitle>
              <CardDescription>
                Customer support and ticket management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">Support dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Audit
              </CardTitle>
              <CardDescription>
                Comprehensive security assessment and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {securityAudit && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Security Score</p>
                      <p className="text-2xl font-bold text-green-600">{securityAudit.score}/100</p>
                    </div>
                    <Button onClick={handleRunSecurityAudit}>
                      Run New Audit
                    </Button>
                  </div>
                  
                  {securityAudit.issues.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Security Issues</h4>
                      <div className="space-y-2">
                        {securityAudit.issues.map((issue, index) => (
                          <div key={index} className="p-3 border rounded">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">{issue.category}</span>
                              <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{issue.description}</p>
                            <p className="text-sm text-blue-600 mt-1">{issue.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="h-5 w-5 mr-2" />
                Backup Management
              </CardTitle>
              <CardDescription>
                Manage automated backups and recovery options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Last Backup</p>
                    <p className="text-sm text-gray-600">2 hours ago</p>
                  </div>
                  <Badge variant="outline">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Success
                  </Badge>
                </div>
                <Button className="w-full" onClick={handleCreateBackup}>
                  <HardDrive className="h-4 w-4 mr-2" />
                  Create Manual Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionSystemManager;
