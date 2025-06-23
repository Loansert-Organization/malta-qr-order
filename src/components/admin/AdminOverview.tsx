
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Store, 
  DollarSign, 
  Activity,
  TrendingUp,
  MapPin,
  Clock,
  CheckCircle
} from 'lucide-react';

const AdminOverview = () => {
  // Mock data - in a real app, this would come from your database
  const stats = {
    totalVendors: 12,
    activeVendors: 10,
    pendingApprovals: 2,
    totalRevenue: 45234,
    monthlyGrowth: 12.5,
    totalOrders: 1456,
    avgOrderValue: 31.50,
    systemHealth: 98.5
  };

  const recentActivity = [
    { id: 1, type: 'vendor_approval', message: 'New vendor "Ta\' Kris Restaurant" approved', time: '2 hours ago' },
    { id: 2, type: 'order', message: '15 new orders processed', time: '4 hours ago' },
    { id: 3, type: 'system', message: 'AI Waiter system updated', time: '1 day ago' },
    { id: 4, type: 'payment', message: 'Weekly payments processed', time: '2 days ago' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome to the ICUPA Malta admin panel. Here's what's happening today.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeVendors} active, {stats.pendingApprovals} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Avg. €{stats.avgOrderValue} per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.systemHealth}%</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="inline h-3 w-3 mr-1 text-green-500" />
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {activity.type === 'vendor_approval' && <Store className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'order' && <Users className="h-4 w-4 text-green-500" />}
                    {activity.type === 'system' && <Activity className="h-4 w-4 text-purple-500" />}
                    {activity.type === 'payment' && <DollarSign className="h-4 w-4 text-yellow-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Malta Locations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Valletta</span>
                <Badge variant="secondary">3 venues</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">St. Julian's</span>
                <Badge variant="secondary">4 venues</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sliema</span>
                <Badge variant="secondary">2 venues</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Mdina</span>
                <Badge variant="secondary">2 venues</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Gozo</span>
                <Badge variant="secondary">1 venue</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
