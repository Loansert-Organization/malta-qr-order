import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Store, Menu, ShoppingBag, DollarSign, FileCheck, Users, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import SystemHealthMonitor from '@/components/admin/SystemHealthMonitor';

interface AdminStats {
  totalBars: number;
  totalOrdersToday: number;
  salesToday: { rwf: number; eur: number };
  pendingMenus: number;
  activeVendors: number;
}

const AdminPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalBars: 0,
    totalOrdersToday: 0,
    salesToday: { rwf: 0, eur: 0 },
    pendingMenus: 0,
    activeVendors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchAdminStats();
      })
      .subscribe();

    const barsSubscription = supabase
      .channel('admin-bars')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bars' }, () => {
        fetchAdminStats();
      })
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      barsSubscription.unsubscribe();
    };
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Get today's date range
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Fetch total bars
      const { count: barsCount } = await supabase
        .from('bars')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch active vendors (bars with orders in last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: activeVendorData } = await supabase
        .from('orders')
        .select('bar_id')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .eq('payment_status', 'confirmed');

      const uniqueActiveVendors = new Set(activeVendorData?.map(order => order.bar_id) || []);

      // Fetch today's orders
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      const totalOrdersToday = todayOrders?.length || 0;

      // Calculate sales by currency
      const salesToday = { rwf: 0, eur: 0 };
      todayOrders?.forEach(order => {
        if (order.payment_status === 'confirmed') {
          if (order.currency === 'RWF') {
            salesToday.rwf += order.total_amount || 0;
          } else {
            salesToday.eur += order.total_amount || 0;
          }
        }
      });

      // Count pending menus (items not yet reviewed)
      const { count: pendingMenusCount } = await supabase
        .from('menus')
        .select('*', { count: 'exact', head: true })
        .eq('is_reviewed', false);

      setStats({
        totalBars: barsCount || 0,
        totalOrdersToday,
        salesToday,
        pendingMenus: pendingMenusCount || 0,
        activeVendors: uniqueActiveVendors.size
      });

    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string;
    subtitle?: string;
  }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
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
                <h1 className="text-2xl font-bold">ICUPA Admin Panel</h1>
                <p className="text-gray-600">System Control Center</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/admin/settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Bars"
            value={stats.totalBars}
            icon={Store}
            color="text-blue-600"
            subtitle={`${stats.activeVendors} active`}
          />
          <StatCard
            title="Orders Today"
            value={stats.totalOrdersToday}
            icon={ShoppingBag}
            color="text-green-600"
          />
          <StatCard
            title="Sales (EUR)"
            value={`€${stats.salesToday.eur.toFixed(2)}`}
            icon={DollarSign}
            color="text-purple-600"
          />
          <StatCard
            title="Sales (RWF)"
            value={`RWF ${stats.salesToday.rwf.toFixed(0)}`}
            icon={DollarSign}
            color="text-orange-600"
          />
          <StatCard
            title="Pending Menus"
            value={stats.pendingMenus}
            icon={FileCheck}
            color="text-red-600"
          />
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bar Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/bars')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Bar Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Manage bars and vendors, onboard new locations, update status
              </p>
              <Button className="w-full">
                Manage Bars
              </Button>
            </CardContent>
          </Card>

          {/* Menu Moderation */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/menus')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="h-5 w-5" />
                Menu Moderation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review and approve menu items, add images, edit descriptions
              </p>
              <Button className="w-full">
                Review Menus
              </Button>
            </CardContent>
          </Card>

          {/* Order Monitoring */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/orders')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Order Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Monitor all orders, resolve issues, force confirmations
              </p>
              <Button className="w-full">
                View Orders
              </Button>
            </CardContent>
          </Card>

          {/* Payment Analytics */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/payments')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Payment Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Track payments by country and method, export reports
              </p>
              <Button className="w-full">
                View Payments
              </Button>
            </CardContent>
          </Card>

          {/* Country Management */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/countries')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Country Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Add bars by country, manage regional settings
              </p>
              <Button className="w-full">
                Manage Countries
              </Button>
            </CardContent>
          </Card>

          {/* AI Tools */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/tools')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Manual Actions & AI Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Trigger AI discovery, manual interventions, system tools
              </p>
              <Button className="w-full">
                Access Tools
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Health Monitor */}
        <div className="mt-8">
          <SystemHealthMonitor />
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/bars/add')}>
              Add New Bar
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/audit')}>
              System Audit
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/analytics')}>
              Analytics Dashboard
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/logs')}>
              System Logs
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/accessibility')}>
              Accessibility Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPanel;
