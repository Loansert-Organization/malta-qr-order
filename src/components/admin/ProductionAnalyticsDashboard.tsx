
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, DollarSign, Clock, MapPin, Star, AlertCircle, CheckCircle, Shield, Activity, Database, Zap } from 'lucide-react';
import { icupaProductionSystem, type AnalyticsData, type SystemHealth, type SecurityAuditResult } from '@/services/icupaProductionSystem';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  trend: 'up' | 'down';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, trend }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </span>
          </div>
        </div>
        <div className="p-3 bg-blue-50 rounded-full">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const ProductionAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analytics, health, security] = await Promise.all([
          icupaProductionSystem.getAnalytics().getDashboardData(),
          icupaProductionSystem.getHealthCheck().performHealthCheck(),
          icupaProductionSystem.getSecurityAudit().runComprehensiveAudit()
        ]);

        setAnalyticsData(analytics);
        setSystemHealth(health);
        setSecurityAudit(security);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading production analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">ICUPA Malta Production Dashboard</h1>
              <p className="text-blue-100">Complete system monitoring and analytics</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Activity className="h-4 w-4 mr-1" />
                Live
              </Badge>
              <Badge 
                variant="secondary" 
                className={`${
                  systemHealth?.overall === 'healthy' 
                    ? 'bg-green-500/20 text-green-100' 
                    : systemHealth?.overall === 'degraded'
                    ? 'bg-yellow-500/20 text-yellow-100'
                    : 'bg-red-500/20 text-red-100'
                }`}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {systemHealth?.overall || 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Total Orders"
                  value={analyticsData?.orders.total.toString() || '0'}
                  change="+12.5%"
                  icon={ShoppingCart}
                  trend="up"
                />
                <MetricCard
                  title="Revenue"
                  value={`€${analyticsData?.revenue.total.toLocaleString() || '0'}`}
                  change="+8.2%"
                  icon={DollarSign}
                  trend="up"
                />
                <MetricCard
                  title="Active Vendors"
                  value={analyticsData?.vendors.active.toString() || '0'}
                  change="+3.1%"
                  icon={MapPin}
                  trend="up"
                />
                <MetricCard
                  title="Customer Satisfaction"
                  value="4.8"
                  change="+0.2"
                  icon={Star}
                  trend="up"
                />
              </div>

              {/* System Health Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="h-5 w-5 mr-2" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {systemHealth?.services.map((service) => (
                        <div key={service.service} className="flex items-center justify-between">
                          <span className="font-medium capitalize">{service.service}</span>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                service.status === 'healthy' ? 'default' : 
                                service.status === 'degraded' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {service.status}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {service.responseTime}ms
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      Security Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {securityAudit?.score || 0}/100
                      </div>
                      <p className="text-gray-600 mb-4">Security Score</p>
                      <div className="space-y-2">
                        {securityAudit?.issues.slice(0, 3).map((issue, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                            <span>{issue.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analyticsData?.orders.today || 0}
                      </div>
                      <p className="text-gray-600">Orders Today</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        €{analyticsData?.revenue.today.toLocaleString() || '0'}
                      </div>
                      <p className="text-gray-600">Revenue Today</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analyticsData?.aiUsage.totalSessions || 0}
                      </div>
                      <p className="text-gray-600">AI Sessions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={[]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#93C5FD" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Vendors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData?.vendors.topPerforming.slice(0, 5).map((vendor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="font-medium">{vendor.name}</span>
                          <div className="text-right">
                            <div className="font-bold">€{vendor.revenue.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">{vendor.orders} orders</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="monitoring">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">CPU Usage</p>
                        <p className="text-2xl font-bold">45%</p>
                      </div>
                      <Database className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Memory Usage</p>
                        <p className="text-2xl font-bold">67%</p>
                      </div>
                      <Activity className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Response Time</p>
                        <p className="text-2xl font-bold">234ms</p>
                      </div>
                      <Zap className="h-8 w-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Error Rate</p>
                        <p className="text-2xl font-bold">0.1%</p>
                      </div>
                      <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Security Audit Results</CardTitle>
                  <CardDescription>
                    Last audit: {securityAudit?.lastAudit ? new Date(securityAudit.lastAudit).toLocaleDateString() : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium">Overall Security Score</span>
                      <div className="text-2xl font-bold text-green-600">
                        {securityAudit?.score || 0}/100
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {securityAudit?.issues.map((issue, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={
                                  issue.severity === 'critical' ? 'destructive' :
                                  issue.severity === 'high' ? 'secondary' :
                                  'default'
                                }>
                                  {issue.severity}
                                </Badge>
                                <span className="font-medium">{issue.category}</span>
                              </div>
                              <p className="text-gray-600 mt-1">{issue.description}</p>
                              <p className="text-sm text-blue-600 mt-1">{issue.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Support Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <p className="text-gray-600">Open Tickets</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <p className="text-gray-600">Resolution Rate</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">2.3h</div>
                      <p className="text-gray-600">Avg Response Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductionAnalyticsDashboard;
