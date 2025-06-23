
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye,
  Calendar,
  Download,
  Filter,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  revenueChange: number;
  ordersChange: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    value: number;
    color: string;
  }>;
}

interface VendorAnalyticsDashboardProps {
  vendorId: string;
}

const VendorAnalyticsDashboard: React.FC<VendorAnalyticsDashboardProps> = ({ vendorId }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnalytics();
  }, [vendorId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Fetch orders and order items for analytics
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            menu_items(name, category, price)
          )
        `)
        .eq('vendor_id', vendorId)
        .gte('created_at', getDateRange(timeRange));

      if (ordersError) throw ordersError;

      // Calculate metrics from orders data
      const calculatedMetrics = calculateMetrics(orders || []);
      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (range: string): string => {
    const now = new Date();
    switch (range) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const calculateMetrics = (orders: any[]): DashboardMetrics => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Unique customers (based on guest session or customer info)
    const uniqueCustomers = new Set(orders.map(order => 
      order.customer_email || order.guest_session_id
    )).size;

    // Calculate daily revenue
    const dailyRevenueMap = new Map();
    orders.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      const existing = dailyRevenueMap.get(date) || { revenue: 0, orders: 0 };
      dailyRevenueMap.set(date, {
        revenue: existing.revenue + order.total_amount,
        orders: existing.orders + 1
      });
    });

    const dailyRevenue = Array.from(dailyRevenueMap.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Top selling items
    const itemSales = new Map();
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const itemName = item.menu_items?.name || 'Unknown Item';
        const existing = itemSales.get(itemName) || { quantity: 0, revenue: 0 };
        itemSales.set(itemName, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.unit_price * item.quantity)
        });
      });
    });

    const topSellingItems = Array.from(itemSales.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Category breakdown
    const categoryMap = new Map();
    orders.forEach(order => {
      order.order_items?.forEach((item: any) => {
        const category = item.menu_items?.category || 'Other';
        const existing = categoryMap.get(category) || 0;
        categoryMap.set(category, existing + (item.unit_price * item.quantity));
      });
    });

    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6'];
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, value], index) => ({
        category,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value);

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      customerCount: uniqueCustomers,
      revenueChange: Math.random() * 20 - 10, // Mock change percentage
      ordersChange: Math.random() * 30 - 15, // Mock change percentage
      topSellingItems,
      dailyRevenue,
      categoryBreakdown
    };
  };

  const handleExportData = () => {
    if (!metrics) return;
    
    const exportData = {
      timeRange,
      metrics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${vendorId}-${timeRange}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Analytics data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          
          <Button
            variant="outline"
            onClick={handleExportData}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">€{metrics.totalRevenue.toFixed(2)}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {metrics.revenueChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${metrics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.revenueChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{metrics.totalOrders}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {metrics.ordersChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${metrics.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(metrics.ordersChange).toFixed(1)}%
                  </span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">€{metrics.averageOrderValue.toFixed(2)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold">{metrics.customerCount}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.dailyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={metrics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {metrics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topSellingItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{item.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={metrics.dailyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VendorAnalyticsDashboard;
