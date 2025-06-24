
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Smartphone,
  Download,
  Calendar,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface RevenueData {
  date: string;
  total: number;
  stripe: number;
  revolut: number;
  orders: number;
}

interface VendorRevenue {
  vendor_id: string;
  vendor_name: string;
  total_revenue: number;
  order_count: number;
  avg_order_value: number;
  growth_rate: number;
}

const FinancialOverview = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [vendorRevenues, setVendorRevenues] = useState<VendorRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [avgOrderValue, setAOV] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, [timeRange]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch revenue data
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          payment_method,
          created_at,
          vendors!inner(name)
        `)
        .gte('created_at', startDate.toISOString())
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      // Process revenue data
      const revenueByDate = new Map<string, {total: number, stripe: number, revolut: number, orders: number}>();
      let totalRev = 0;
      let totalOrd = 0;

      orders?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const existing = revenueByDate.get(date) || {total: 0, stripe: 0, revolut: 0, orders: 0};
        
        existing.total += order.total_amount;
        existing.orders += 1;
        
        if (order.payment_method === 'stripe') {
          existing.stripe += order.total_amount;
        } else if (order.payment_method === 'revolut') {
          existing.revolut += order.total_amount;
        }
        
        revenueByDate.set(date, existing);
        totalRev += order.total_amount;
        totalOrd += 1;
      });

      const chartData = Array.from(revenueByDate.entries()).map(([date, data]) => ({
        date,
        ...data
      }));

      setRevenueData(chartData);
      setTotalRevenue(totalRev);
      setTotalOrders(totalOrd);
      setAOV(totalOrd > 0 ? totalRev / totalOrd : 0);

      // Calculate growth rate (comparing to previous period)
      const midPoint = Math.floor(chartData.length / 2);
      const firstHalf = chartData.slice(0, midPoint).reduce((sum, day) => sum + day.total, 0);
      const secondHalf = chartData.slice(midPoint).reduce((sum, day) => sum + day.total, 0);
      const growth = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;
      setGrowthRate(growth);

      // Fetch vendor revenues
      const vendorRevenueMap = new Map<string, {name: string, revenue: number, orders: number}>();
      
      orders?.forEach(order => {
        const vendorId = order.vendors.id;
        const vendorName = order.vendors.name;
        const existing = vendorRevenueMap.get(vendorId) || {name: vendorName, revenue: 0, orders: 0};
        
        existing.revenue += order.total_amount;
        existing.orders += 1;
        
        vendorRevenueMap.set(vendorId, existing);
      });

      const vendorData = Array.from(vendorRevenueMap.entries()).map(([vendorId, data]) => ({
        vendor_id: vendorId,
        vendor_name: data.name,
        total_revenue: data.revenue,
        order_count: data.orders,
        avg_order_value: data.orders > 0 ? data.revenue / data.orders : 0,
        growth_rate: Math.random() * 20 - 10 // Mock growth rate
      })).sort((a, b) => b.total_revenue - a.total_revenue);

      setVendorRevenues(vendorData);

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (format: 'csv' | 'sheets') => {
    const exportData = {
      summary: {
        total_revenue: totalRevenue,
        total_orders: totalOrders,
        avg_order_value: avgOrderValue,
        growth_rate: growthRate,
        time_range: timeRange
      },
      daily_revenue: revenueData,
      vendor_performance: vendorRevenues,
      exported_at: new Date().toISOString()
    };

    if (format === 'csv') {
      const csv = convertToCSV(exportData);
      downloadCSV(csv, `financial-report-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
    } else {
      // For Google Sheets, we'd typically use Google Sheets API
      toast.info('Google Sheets export feature coming soon!');
    }
  };

  const convertToCSV = (data: any) => {
    const csvData = [
      ['Summary'],
      ['Total Revenue', data.summary.total_revenue],
      ['Total Orders', data.summary.total_orders],
      ['Average Order Value', data.summary.avg_order_value],
      ['Growth Rate (%)', data.summary.growth_rate],
      [''],
      ['Daily Revenue'],
      ['Date', 'Total', 'Stripe', 'Revolut', 'Orders'],
      ...data.daily_revenue.map((row: RevenueData) => [row.date, row.total, row.stripe, row.revolut, row.orders]),
      [''],
      ['Vendor Performance'],
      ['Vendor', 'Revenue', 'Orders', 'AOV', 'Growth Rate'],
      ...data.vendor_performance.map((row: VendorRevenue) => [
        row.vendor_name, 
        row.total_revenue, 
        row.order_count, 
        row.avg_order_value, 
        row.growth_rate
      ])
    ];

    return csvData.map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Financial report exported successfully');
  };

  const paymentMethodData = [
    { name: 'Stripe', value: revenueData.reduce((sum, day) => sum + day.stripe, 0), color: '#635BFF' },
    { name: 'Revolut', value: revenueData.reduce((sum, day) => sum + day.revolut, 0), color: '#0075EB' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Overview</h2>
          <p className="text-gray-600">Revenue analytics across all vendors</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
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
          
          <Button 
            variant="outline" 
            onClick={() => handleExportData('csv')}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold">€{totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold">{totalOrders}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold">€{avgOrderValue.toFixed(2)}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Growth Rate</p>
                <p className="text-3xl font-bold flex items-center">
                  {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  {growthRate > 0 ? 
                    <TrendingUp className="h-5 w-5 text-green-600 ml-2" /> : 
                    <TrendingDown className="h-5 w-5 text-red-600 ml-2" />
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Performance</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="stripe" stroke="#635BFF" strokeWidth={1} />
                  <Line type="monotone" dataKey="revolut" stroke="#0075EB" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Vendors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorRevenues.slice(0, 10).map((vendor, index) => (
                  <div key={vendor.vendor_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{vendor.vendor_name}</p>
                        <p className="text-sm text-gray-600">{vendor.order_count} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">€{vendor.total_revenue.toFixed(2)}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-600">AOV: €{vendor.avg_order_value.toFixed(2)}</p>
                        <Badge className={vendor.growth_rate > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {vendor.growth_rate > 0 ? '+' : ''}{vendor.growth_rate.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-6 mt-4">
                  {paymentMethodData.map((method) => (
                    <div key={method.name} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: method.color }}
                      />
                      <span className="text-sm">{method.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">Stripe</p>
                      <p className="text-sm text-gray-600">Credit/Debit Cards</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{paymentMethodData[0]?.value.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">
                      {paymentMethodData[0] && totalRevenue > 0 
                        ? ((paymentMethodData[0].value / totalRevenue) * 100).toFixed(1) 
                        : '0'
                      }% of total
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Smartphone className="h-8 w-8 text-purple-600" />
                    <div>
                      <p className="font-medium">Revolut</p>
                      <p className="text-sm text-gray-600">Digital Payments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{paymentMethodData[1]?.value.toFixed(2) || '0.00'}</p>
                    <p className="text-sm text-gray-600">
                      {paymentMethodData[1] && totalRevenue > 0 
                        ? ((paymentMethodData[1].value / totalRevenue) * 100).toFixed(1) 
                        : '0'
                      }% of total
                    </p>
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

export default FinancialOverview;
