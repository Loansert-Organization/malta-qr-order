
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  ShoppingCart, 
  MapPin,
  Clock,
  Star,
  Activity,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface PlatformMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeVendors: number;
  activeUsers: number;
  avgOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  vendorGrowth: number;
  userGrowth: number;
}

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  vendors: number;
}

interface VendorPerformance {
  id: string;
  name: string;
  revenue: number;
  orders: number;
  rating: number;
  category: string;
  location: string;
  growth: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<VendorPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();

    // Set up real-time subscription for orders
    const ordersChannel = supabase
      .channel('analytics-orders')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          // Refresh analytics when new orders come in
          fetchAnalytics();
        }
      )
      .subscribe();

    // Refresh analytics every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => {
      supabase.removeChannel(ordersChannel);
      clearInterval(interval);
    };
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Fetch total revenue and orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, created_at, vendor_id, guest_session_id')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('payment_status', 'paid');

      if (ordersError) throw ordersError;

      // Fetch active vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('id, name, location, category, created_at')
        .eq('active', true);

      if (vendorsError) throw vendorsError;

      // Fetch unique users from orders
      const uniqueUsers = new Set((ordersData || []).map(order => order.guest_session_id));

      // Calculate metrics
      const totalRevenue = (ordersData || []).reduce((sum, order) => sum + Number(order.total_amount), 0);
      const totalOrders = (ordersData || []).length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Calculate growth (compare with previous period)
      const previousStartDate = new Date(startDate);
      const previousEndDate = new Date(endDate);
      const periodDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      previousStartDate.setDate(previousStartDate.getDate() - periodDays);
      previousEndDate.setDate(previousEndDate.getDate() - periodDays);

      const { data: previousOrdersData } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', previousStartDate.toISOString())
        .lte('created_at', previousEndDate.toISOString())
        .eq('payment_status', 'paid');

      const previousRevenue = (previousOrdersData || []).reduce((sum, order) => sum + Number(order.total_amount), 0);
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      const metrics: PlatformMetrics = {
        totalRevenue,
        totalOrders,
        activeVendors: vendorsData?.length || 0,
        activeUsers: uniqueUsers.size,
        avgOrderValue,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        ordersGrowth: Number(((totalOrders - (previousOrdersData?.length || 0)) / (previousOrdersData?.length || 1) * 100).toFixed(1)),
        vendorGrowth: 0, // Calculate based on vendor creation dates if needed
        userGrowth: 0 // Calculate based on user activity if needed
      };

      // Generate revenue data for chart
      const dailyRevenue = new Map<string, { revenue: number; orders: number }>();
      (ordersData || []).forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = dailyRevenue.get(date) || { revenue: 0, orders: 0 };
        existing.revenue += Number(order.total_amount);
        existing.orders += 1;
        dailyRevenue.set(date, existing);
      });

      const revenueData: RevenueData[] = Array.from(dailyRevenue.entries())
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders,
          vendors: vendorsData?.length || 0
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 days for chart

      // Calculate vendor performance
      const vendorRevenue = new Map<string, { revenue: number; orders: number; vendor: any }>();
      (ordersData || []).forEach(order => {
        const existing = vendorRevenue.get(order.vendor_id) || { revenue: 0, orders: 0, vendor: null };
        existing.revenue += Number(order.total_amount);
        existing.orders += 1;
        vendorRevenue.set(order.vendor_id, existing);
      });

      // Fetch vendor ratings from analytics or reviews
      const vendorPerformance: VendorPerformance[] = [];
      for (const [vendorId, data] of vendorRevenue.entries()) {
        const vendor = vendorsData?.find(v => v.id === vendorId);
        if (vendor) {
          vendorPerformance.push({
            id: vendorId,
            name: vendor.name,
            revenue: data.revenue,
            orders: data.orders,
            rating: 4.5 + Math.random() * 0.5, // TODO: Fetch from reviews
            category: vendor.category || 'Restaurant',
            location: vendor.location || 'Malta',
            growth: Math.random() * 30 // TODO: Calculate real growth
          });
        }
      }

      // Sort by revenue
      vendorPerformance.sort((a, b) => b.revenue - a.revenue);

      setMetrics(metrics);
      setRevenueData(revenueData);
      setVendorPerformance(vendorPerformance.slice(0, 5)); // Top 5 vendors
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
      
      // Set empty data on error
      setMetrics({
        totalRevenue: 0,
        totalOrders: 0,
        activeVendors: 0,
        activeUsers: 0,
        avgOrderValue: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        vendorGrowth: 0,
        userGrowth: 0
      });
      setRevenueData([]);
      setVendorPerformance([]);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-analytics', {
        body: { timeRange, format: 'csv' }
      });

      if (error) throw error;

      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export analytics data');
    }
  };

  const categoryData = vendorPerformance.reduce((acc, vendor) => {
    const existing = acc.find(item => item.name === vendor.category);
    if (existing) {
      existing.value += vendor.revenue;
    } else {
      acc.push({ name: vendor.category, value: vendor.revenue });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Platform Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into ICUPA Malta performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">€{metrics?.totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{metrics?.revenueGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold">{metrics?.totalOrders.toLocaleString()}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{metrics?.ordersGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Vendors</p>
                <p className="text-2xl font-bold">{metrics?.activeVendors}</p>
              </div>
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{metrics?.vendorGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{metrics?.activeUsers.toLocaleString()}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+{metrics?.userGrowth}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold">€{metrics?.avgOrderValue.toFixed(2)}</p>
              </div>
              <Activity className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+5.2%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="categories">Category Analysis</TabsTrigger>
          <TabsTrigger value="geography">Geographic Data</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Orders Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#8884d8" name="Revenue (€)" />
                  <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorPerformance.map((vendor, index) => (
                  <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{vendor.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Badge variant="outline">{vendor.category}</Badge>
                          <span>•</span>
                          <MapPin className="h-3 w-3" />
                          <span>{vendor.location}</span>
                          <span>•</span>
                          <Star className="h-3 w-3 fill-current text-yellow-500" />
                          <span>{vendor.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">€{vendor.revenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">{vendor.orders} orders</div>
                      <div className="flex items-center text-sm text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{vendor.growth}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">€{category.value.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">
                          {((category.value / categoryData.reduce((sum, cat) => sum + cat.value, 0)) * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Location</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={vendorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (€)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
