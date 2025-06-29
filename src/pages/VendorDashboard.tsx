import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ShoppingBag, DollarSign, Clock, TrendingUp, Menu, Receipt, Home, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmptyState from '@/components/ui/EmptyState';

interface VendorStats {
  todayOrders: number;
  todaySales: number;
  pendingOrders: number;
  popularItem: string;
}

const VendorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barId, setBarId] = useState<string | null>(null);
  const [barName, setBarName] = useState<string>('');
  const [stats, setStats] = useState<VendorStats>({
    todayOrders: 0,
    todaySales: 0,
    pendingOrders: 0,
    popularItem: 'Loading...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeVendorSession();
  }, []);

  useEffect(() => {
    if (barId) {
      fetchVendorStats();
      // Set up real-time subscription for orders
      const subscription = supabase
        .channel('vendor-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `bar_id=eq.${barId}`
          },
          () => {
            fetchVendorStats();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [barId]);

  const initializeVendorSession = async () => {
    // Check if we have a stored bar_id in localStorage
    let storedBarId = localStorage.getItem('vendorBarId');
    
    if (!storedBarId) {
      // For demo purposes, get the first bar from Malta
      try {
        const { data: bars, error } = await supabase
          .from('bars')
          .select('id, name')
          .eq('country', 'Malta')
          .limit(1)
          .single();

        if (error) throw error;

        if (bars) {
          storedBarId = bars.id;
          localStorage.setItem('vendorBarId', storedBarId);
          setBarName(bars.name);
        }
      } catch (error) {
        console.error('Error fetching demo bar:', error);
        toast({
          title: "Error",
          description: "Failed to initialize vendor session",
          variant: "destructive"
        });
      }
    } else {
      // Fetch bar name for stored ID
      try {
        const { data: bar, error } = await supabase
          .from('bars')
          .select('name')
          .eq('id', storedBarId)
          .single();

        if (error) throw error;
        if (bar) setBarName(bar.name);
      } catch (error) {
        console.error('Error fetching bar name:', error);
      }
    }

    setBarId(storedBarId);
  };

  const fetchVendorStats = async () => {
    if (!barId) return;

    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch today's orders
      const { data: todayOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('bar_id', barId)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (ordersError) throw ordersError;

      // Calculate stats
      const totalOrders = todayOrders?.length || 0;
      const pendingOrders = todayOrders?.filter(order => order.payment_status === 'pending').length || 0;
      const confirmedOrders = todayOrders?.filter(order => order.payment_status === 'confirmed') || [];
      const totalSales = confirmedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Calculate most popular item
      const itemCounts: { [key: string]: number } = {};
      todayOrders?.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            if (item.name) {
              itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
            }
          });
        }
      });

      const popularItem = Object.entries(itemCounts).length > 0
        ? Object.entries(itemCounts).reduce((a, b) => a[1] > b[1] ? a : b)[0]
        : 'No orders yet';

      setStats({
        todayOrders: totalOrders,
        todaySales: totalSales,
        pendingOrders: pendingOrders,
        popularItem: popularItem
      });

    } catch (error) {
      console.error('Error fetching vendor stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard stats",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!loading && stats.todayOrders === 0 && stats.todaySales === 0) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="No orders yet"
        description="Once customers start ordering, you'll see real-time stats here."
        actionText="View Menu"
        onAction={() => navigate('/vendor/menu')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Welcome back!</h1>
                <p className="text-gray-600">{barName || 'Your Bar'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/vendor/settings')}
            >
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Today's Orders"
            value={stats.todayOrders}
            icon={ShoppingBag}
            color="text-blue-600"
          />
          <StatCard
            title="Total Sales (Today)"
            value={`€${stats.todaySales.toFixed(2)}`}
            icon={DollarSign}
            color="text-green-600"
          />
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            color="text-orange-600"
          />
          <StatCard
            title="Popular Item"
            value={stats.popularItem}
            icon={TrendingUp}
            color="text-purple-600"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendor/orders')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                View Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manage incoming orders, confirm payments, and track order status
              </p>
              <Button className="mt-4" variant="default">
                Go to Orders
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/vendor/menu')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Manage Menu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Add new items, update prices, and manage availability
              </p>
              <Button className="mt-4" variant="default">
                Go to Menu
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate('/vendor/payments')}>
              View Payments
            </Button>
            <Button variant="outline" onClick={() => navigate('/vendor/analytics')}>
              Analytics
            </Button>
            <Button variant="outline" onClick={() => navigate('/vendor/qr-generator')}>
              Generate QR Code
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorDashboard;
