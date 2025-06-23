
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  QrCode,
  Settings,
  Bell,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VendorStats {
  todaySales: number;
  currentOrders: number;
  topSellingItems: Array<{
    name: string;
    count: number;
  }>;
  weeklyRevenue: number;
}

interface VendorDashboardProps {
  vendorId: string;
  vendorName: string;
}

const VendorDashboard: React.FC<VendorDashboardProps> = ({
  vendorId,
  vendorName
}) => {
  const { toast } = useToast();
  const [stats, setStats] = useState<VendorStats>({
    todaySales: 0,
    currentOrders: 0,
    topSellingItems: [],
    weeklyRevenue: 0
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchAlerts();
  }, [vendorId]);

  const fetchDashboardData = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Fetch today's sales
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', vendorId)
        .gte('created_at', today)
        .eq('payment_status', 'paid');

      // Fetch current pending orders
      const { data: currentOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('vendor_id', vendorId)
        .in('status', ['pending', 'confirmed', 'preparing']);

      // Fetch weekly revenue
      const { data: weeklyOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', vendorId)
        .gte('created_at', weekAgo)
        .eq('payment_status', 'paid');

      // Fetch top selling items
      const { data: topItems } = await supabase
        .from('order_items')
        .select(`
          menu_item_id,
          quantity,
          menu_items (name)
        `)
        .eq('orders.vendor_id', vendorId)
        .gte('orders.created_at', weekAgo)
        .limit(5);

      setStats({
        todaySales: todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        currentOrders: currentOrders?.length || 0,
        topSellingItems: topItems?.map(item => ({
          name: item.menu_items?.name || 'Unknown',
          count: item.quantity
        })) || [],
        weeklyRevenue: weeklyOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
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

  const fetchAlerts = async () => {
    try {
      const { data: alerts } = await supabase
        .from('vendor_alerts')
        .select('*')
        .eq('vendor_id', vendorId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setAlerts(alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const generateQRCode = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { vendorId, type: 'venue' }
      });

      if (error) throw error;

      toast({
        title: "QR Code Generated",
        description: "Your venue QR code has been created successfully",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Store className="h-8 w-8" />
            {vendorName}
          </h1>
          <p className="text-gray-600 mt-1">Vendor Dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateQRCode} className="flex items-center gap-2">
            <QrCode className="h-4 w-4" />
            Generate QR
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                  <Badge variant={alert.severity === 'error' ? 'destructive' : 'default'}>
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.todaySales.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.weeklyRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-green-600 font-medium">+12% vs last week</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Items (This Week)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topSellingItems.length > 0 ? (
              stats.topSellingItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  <Badge variant="secondary">{item.count} sold</Badge>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No sales data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
