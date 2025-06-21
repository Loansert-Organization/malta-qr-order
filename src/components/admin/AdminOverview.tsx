
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro
} from 'lucide-react';

interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalOrders: number;
  todayRevenue: number;
  aiInteractions: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    activeVendors: 0,
    pendingVendors: 0,
    totalOrders: 0,
    todayRevenue: 0,
    aiInteractions: 0,
    systemHealth: 'good'
  });
  const [loading, setLoading] = useState(true);
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardStats();
    loadRealtimeOrders();
  }, []);

  const loadDashboardStats = async () => {
    try {
      // Get vendor stats
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, status, created_at');

      // Get today's orders
      const today = new Date().toISOString().split('T')[0];
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .gte('created_at', today);

      // Get AI interactions count
      const { data: aiLogs } = await supabase
        .from('ai_waiter_logs')
        .select('id')
        .gte('created_at', today);

      const totalVendors = vendors?.length || 0;
      const activeVendors = vendors?.filter(v => v.status === 'active').length || 0;
      const pendingVendors = vendors?.filter(v => v.status === 'pending').length || 0;
      const todayRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalVendors,
        activeVendors,
        pendingVendors,
        totalOrders: orders?.length || 0,
        todayRevenue,
        aiInteractions: aiLogs?.length || 0,
        systemHealth: pendingVendors > 5 ? 'warning' : 'good'
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRealtimeOrders = async () => {
    try {
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          vendors (name, location)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRealtimeOrders(orders || []);
    } catch (error) {
      console.error('Error loading realtime orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthIcon = () => {
    switch (stats.systemHealth) {
      case 'good': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ICUPA Admin Dashboard</h1>
          <p className="text-gray-600">Real-time overview of your hospitality platform</p>
        </div>
        <div className="flex items-center space-x-2">
          {getHealthIcon()}
          <span className="text-sm font-medium">System Health</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeVendors} active, {stats.pendingVendors} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Across all venues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Platform revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Interactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiInteractions}</div>
            <p className="text-xs text-muted-foreground">
              Kai conversations today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Recent Orders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {realtimeOrders.map((order, index) => (
              <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium">
                    Order #{order.id.slice(-8)}
                  </div>
                  <Badge variant="outline">
                    {order.vendors?.name || 'Unknown Venue'}
                  </Badge>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">€{order.total_amount.toFixed(2)}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Vendor Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Review Pending Vendors ({stats.pendingVendors})
            </Button>
            <Button className="w-full" variant="outline">
              Manage Active Vendors
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              View AI Performance
            </Button>
            <Button className="w-full" variant="outline">
              Check Model Usage
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline">
              Run Diagnostics
            </Button>
            <Button className="w-full" variant="outline">
              View Error Logs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
