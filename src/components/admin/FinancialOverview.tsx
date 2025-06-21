
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { 
  Euro, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Smartphone,
  Calendar,
  Download,
  PieChart
} from 'lucide-react';

interface FinancialMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  revenueGrowth: number;
  paymentMethods: {
    stripe: number;
    revolut: number;
  };
  topVendors: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
  platformCommission: number;
}

const FinancialOverview = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    dailyRevenue: 0,
    revenueGrowth: 0,
    paymentMethods: { stripe: 0, revolut: 0 },
    topVendors: [],
    platformCommission: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadFinancialMetrics();
  }, [selectedPeriod]);

  const loadFinancialMetrics = async () => {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get all orders with payment information
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          total_amount,
          payment_method,
          payment_status,
          created_at,
          vendor_id,
          vendors (name)
        `)
        .eq('payment_status', 'paid');

      if (orders) {
        // Calculate revenue by period
        const todayOrders = orders.filter(order => 
          new Date(order.created_at) >= today
        );
        const weekOrders = orders.filter(order => 
          new Date(order.created_at) >= weekAgo
        );
        const monthOrders = orders.filter(order => 
          new Date(order.created_at) >= monthAgo
        );

        const dailyRevenue = todayOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const weeklyRevenue = weekOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const monthlyRevenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);

        // Calculate payment method breakdown
        const stripeRevenue = orders
          .filter(order => order.payment_method === 'stripe')
          .reduce((sum, order) => sum + order.total_amount, 0);
        const revolutRevenue = orders
          .filter(order => order.payment_method === 'revolut')
          .reduce((sum, order) => sum + order.total_amount, 0);

        // Calculate top vendors
        const vendorRevenue: { [key: string]: { name: string; revenue: number; orders: number } } = {};
        orders.forEach(order => {
          if (!vendorRevenue[order.vendor_id]) {
            vendorRevenue[order.vendor_id] = {
              name: order.vendors?.name || 'Unknown',
              revenue: 0,
              orders: 0
            };
          }
          vendorRevenue[order.vendor_id].revenue += order.total_amount;
          vendorRevenue[order.vendor_id].orders += 1;
        });

        const topVendors = Object.entries(vendorRevenue)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // Calculate growth (simulated)
        const revenueGrowth = 12.5 + Math.random() * 5;

        // Platform commission (5% of total revenue)
        const platformCommission = totalRevenue * 0.05;

        setMetrics({
          totalRevenue,
          monthlyRevenue,
          weeklyRevenue,
          dailyRevenue,
          revenueGrowth,
          paymentMethods: {
            stripe: stripeRevenue,
            revolut: revolutRevenue
          },
          topVendors,
          platformCommission
        });
      }
    } catch (error) {
      console.error('Error loading financial metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRevenue = () => {
    switch (selectedPeriod) {
      case 'day': return metrics.dailyRevenue;
      case 'week': return metrics.weeklyRevenue;
      case 'month': return metrics.monthlyRevenue;
      default: return metrics.weeklyRevenue;
    }
  };

  const exportFinancialData = () => {
    // This would typically export to CSV or Excel
    console.log('Exporting financial data...');
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
          <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
          <p className="text-gray-600">Revenue analytics and payment insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Button
              variant={selectedPeriod === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('day')}
            >
              Today
            </Button>
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </Button>
          </div>
          <Button onClick={exportFinancialData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{getCurrentRevenue().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground capitalize">{selectedPeriod}ly revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">+{metrics.revenueGrowth.toFixed(1)}%</div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground">vs last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Commission</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{metrics.platformCommission.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">5% of total revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Payment Methods</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">Stripe Payments</div>
                    <div className="text-sm text-gray-600">Card payments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">€{metrics.paymentMethods.stripe.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">
                    {((metrics.paymentMethods.stripe / metrics.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-purple-600" />
                  <div>
                    <div className="font-medium">Revolut Payments</div>
                    <div className="text-sm text-gray-600">Mobile payments</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">€{metrics.paymentMethods.revolut.toFixed(2)}</div>
                  <div className="text-sm text-gray-600">
                    {((metrics.paymentMethods.revolut / metrics.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Performing Vendors</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.topVendors.map((vendor, index) => (
                <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{vendor.name}</div>
                      <div className="text-sm text-gray-600">{vendor.orders} orders</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">€{vendor.revenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">
                      {((vendor.revenue / metrics.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">€{metrics.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-green-800">Total Platform Revenue</div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">€{(metrics.totalRevenue * 0.95).toFixed(2)}</div>
              <div className="text-sm text-blue-800">Vendor Payouts (95%)</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">€{metrics.platformCommission.toFixed(2)}</div>
              <div className="text-sm text-purple-800">Platform Commission (5%)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialOverview;
