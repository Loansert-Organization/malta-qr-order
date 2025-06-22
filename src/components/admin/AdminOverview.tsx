
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorMessage } from '@/components/ui/error-message';
import { useAISupervision } from '@/hooks/useAISupervision';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Store, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Euro,
  Bot,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalVendors: number;
  activeVendors: number;
  pendingVendors: number;
  totalOrders: number;
  todayRevenue: number;
  aiInteractions: number;
  systemHealth: 'good' | 'warning' | 'critical';
  activeBars: number;
}

const AdminOverview = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalVendors: 0,
    activeVendors: 0,
    pendingVendors: 0,
    totalOrders: 0,
    todayRevenue: 0,
    aiInteractions: 0,
    systemHealth: 'good',
    activeBars: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeOrders, setRealtimeOrders] = useState<any[]>([]);
  const { reviewTask, fixError, getUXRecommendations } = useAISupervision();

  useEffect(() => {
    loadDashboardData();
    initializeAISupervision();
  }, []);

  const initializeAISupervision = async () => {
    try {
      // Request UX recommendations for admin dashboard
      await getUXRecommendations('AdminOverview', '', {
        userContext: { user_role: 'admin_user', device_type: 'desktop' },
        maltaPreferences: { currency: 'EUR', timezone: 'CET' }
      });
    } catch (error) {
      console.error('AI supervision initialization failed:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load vendors data
      const { data: vendors, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, active, created_at');

      if (vendorsError) throw vendorsError;

      // Load today's orders
      const today = new Date().toISOString().split('T')[0];
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', today);

      if (ordersError) throw ordersError;

      // Load AI interactions
      const { data: aiLogs, error: aiError } = await supabase
        .from('ai_waiter_logs')
        .select('id')
        .gte('created_at', today);

      if (aiError) throw aiError;

      // Load bars data
      const { data: bars, error: barsError } = await supabase
        .from('bars')
        .select('id');

      if (barsError) throw barsError;

      // Load recent orders for display
      const { data: recentOrders, error: recentError } = await supabase
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

      if (recentError) throw recentError;

      const totalVendors = vendors?.length || 0;
      const activeVendors = vendors?.filter(v => v.active).length || 0;
      const pendingVendors = vendors?.filter(v => !v.active).length || 0;
      const todayRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
      
      setStats({
        totalVendors,
        activeVendors,
        pendingVendors,
        totalOrders: orders?.length || 0,
        todayRevenue,
        aiInteractions: aiLogs?.length || 0,
        systemHealth: pendingVendors > 5 ? 'warning' : 'good',
        activeBars: bars?.length || 0
      });

      setRealtimeOrders(recentOrders || []);

      // Log successful data load
      await supabase.from('system_logs').insert({
        log_type: 'admin_dashboard_load',
        component: 'AdminOverview',
        message: 'Dashboard data loaded successfully',
        metadata: {
          vendors_count: totalVendors,
          orders_count: orders?.length || 0,
          bars_count: bars?.length || 0,
          timestamp: new Date().toISOString()
        },
        severity: 'info'
      });

      // AI task review
      await reviewTask('AdminDashboard Data Load', '', {
        screenName: 'AdminOverview',
        description: 'Successfully loaded dashboard statistics and recent orders',
        dataLoaded: {
          vendors: totalVendors,
          orders: orders?.length || 0,
          bars: bars?.length || 0
        }
      });

    } catch (loadError: any) {
      console.error('Error loading dashboard data:', loadError);
      setError(loadError.message || 'Failed to load dashboard data');
      
      // AI error analysis
      await fixError(loadError, 'AdminOverview', {
        userAction: 'Loading dashboard data',
        code: 'loadDashboardData function'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        title="Dashboard Error"
        message={error}
        className="m-6"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ICUPA Malta Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time overview of your hospitality platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2" role="status">
            {getHealthIcon()}
            <span className="text-sm font-medium">System Health</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Bot className="h-3 w-3 mr-1" />
            AI-Supervised
          </Badge>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Malta Bars</CardTitle>
            <Store className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.activeBars}</div>
            <p className="text-xs text-gray-500 mt-1">Active establishments</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Vendors</CardTitle>
            <Users className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalVendors}</div>
            <p className="text-xs text-gray-500 mt-1">
              <span className="text-green-600 font-medium">{stats.activeVendors} active</span>
              {stats.pendingVendors > 0 && (
                <span className="text-orange-600 font-medium ml-2">{stats.pendingVendors} pending</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Today's Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500 mt-1">€{stats.todayRevenue.toFixed(2)} revenue</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">AI Interactions</CardTitle>
            <Activity className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stats.aiInteractions}</div>
            <p className="text-xs text-gray-500 mt-1">Kai conversations today</p>
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
          {realtimeOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No recent orders found
            </div>
          ) : (
            <div className="space-y-4">
              {realtimeOrders.map((order) => (
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
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Vendor Management</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              disabled={stats.pendingVendors === 0}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Review Pending ({stats.pendingVendors})
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <CheckCircle className="h-4 w-4 mr-2" />
              Manage Active Vendors
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5" />
              <span>AI Monitoring</span>
            </CardTitle>
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
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>System Health</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="outline" onClick={loadDashboardData}>
              <Activity className="h-4 w-4 mr-2" />
              Refresh Data
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
