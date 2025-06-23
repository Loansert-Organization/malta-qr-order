
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  Store, 
  AlertTriangle,
  TrendingUp,
  Database,
  Brain,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalVendors: number;
  activeVendors: number;
  pendingApprovals: number;
  totalOrders: number;
  todayRevenue: number;
  systemAlerts: number;
}

const AdminDashboard: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalVendors: 0,
    activeVendors: 0,
    pendingApprovals: 0,
    totalOrders: 0,
    todayRevenue: 0,
    systemAlerts: 0
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    fetchSystemAlerts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch vendor statistics
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, active');

      const { data: approvals } = await supabase
        .from('vendor_approvals')
        .select('id')
        .eq('status', 'pending');

      // Fetch order statistics
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', today)
        .eq('payment_status', 'paid');

      const { data: totalOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact' });

      setStats({
        totalVendors: vendors?.length || 0,
        activeVendors: vendors?.filter(v => v.active).length || 0,
        pendingApprovals: approvals?.length || 0,
        totalOrders: totalOrders?.length || 0,
        todayRevenue: todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        systemAlerts: 3 // Mock data
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemAlerts = async () => {
    // Mock system alerts
    setAlerts([
      {
        id: 1,
        type: 'security',
        message: 'High number of failed login attempts detected',
        severity: 'high',
        timestamp: new Date().toISOString()
      },
      {
        id: 2,
        type: 'performance',
        message: 'AI response time above threshold',
        severity: 'medium',
        timestamp: new Date().toISOString()
      },
      {
        id: 3,
        type: 'system',
        message: 'Database cleanup completed successfully',
        severity: 'info',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const runSystemMaintenance = async () => {
    try {
      const { error } = await supabase.functions.invoke('system-maintenance', {
        body: { operation: 'cleanup' }
      });

      if (error) throw error;

      toast({
        title: "Maintenance Complete",
        description: "System maintenance tasks completed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run system maintenance",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            ICUPA Admin Panel
          </h1>
          <p className="text-gray-600 mt-1">System Administration Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runSystemMaintenance} variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Run Maintenance
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeVendors} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Require review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalOrders} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              {stats.systemAlerts} alerts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Sections */}
      <Tabs defaultValue="vendors" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="ai">AI System</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Vendor Approvals</h4>
                    <p className="text-sm text-gray-600">Review and approve new vendor applications</p>
                  </div>
                  <Button>Review ({stats.pendingApprovals})</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Menu QA</h4>
                    <p className="text-sm text-gray-600">Quality assurance for vendor menus</p>
                  </div>
                  <Button variant="outline">View Issues</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Bulk Operations</h4>
                    <p className="text-sm text-gray-600">Perform operations on multiple vendors</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">89</div>
                    <div className="text-sm text-gray-600">Active Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1,247</div>
                    <div className="text-sm text-gray-600">Completed Today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-gray-600">Failed Orders</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">GPT-4o Status</h4>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">Claude-4 Status</h4>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">Gemini 2.5 Pro</h4>
                    <Badge className="bg-green-100 text-green-800">Online</Badge>
                  </div>
                  <div>
                    <h4 className="font-medium">AI Waiter Chats</h4>
                    <div className="text-lg font-semibold">2,847</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600">Analytics dashboard will be implemented here</p>
                <Button className="mt-4">View Full Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Database Maintenance</h4>
                    <p className="text-sm text-gray-600">Clean up old logs and optimize tables</p>
                  </div>
                  <Button onClick={runSystemMaintenance}>Run Now</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Security Audit</h4>
                    <p className="text-sm text-gray-600">Run comprehensive security checks</p>
                  </div>
                  <Button variant="outline">Start Audit</Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Backup System</h4>
                    <p className="text-sm text-gray-600">Create and manage data backups</p>
                  </div>
                  <Button variant="outline">Manage Backups</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
