
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  QrCode, 
  BarChart3, 
  ShoppingCart, 
  Settings,
  TrendingUp,
  Users,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Import vendor components
import MenuBuilder from '@/components/vendor/MenuBuilder';
import QRGenerator from '@/components/vendor/QRGenerator';
import OrderManagement from '@/components/vendor/OrderManagement';
import AIAnalytics from '@/components/vendor/AIAnalytics';

interface VendorData {
  id: string;
  name: string;
  slug: string;
  location: string;
  active: boolean;
  created_at: string;
}

interface OrderSummary {
  total_orders: number;
  total_revenue: number;
  pending_orders: number;
  avg_order_value: number;
}

const VendorDashboard = () => {
  const [vendor, setVendor] = useState<VendorData | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock vendor ID for demo purposes
  const vendorId = "demo-vendor-id";

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor data
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('id', vendorId)
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        throw vendorError;
      }

      if (vendorData) {
        setVendor(vendorData);
      } else {
        // Create demo vendor if not exists
        const { data: newVendor, error: createError } = await supabase
          .from('vendors')
          .insert({
            id: vendorId,
            name: 'Demo Restaurant',
            slug: 'demo-restaurant',
            location: 'Valletta, Malta',
            active: true
          })
          .select()
          .single();

        if (createError) throw createError;
        setVendor(newVendor);
      }

      // Fetch order summary
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount, status')
        .eq('vendor_id', vendorId);

      if (ordersError) throw ordersError;

      const summary = {
        total_orders: orders?.length || 0,
        total_revenue: orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0,
        pending_orders: orders?.filter(order => order.status === 'pending').length || 0,
        avg_order_value: orders?.length ? 
          (orders.reduce((sum, order) => sum + Number(order.total_amount), 0) / orders.length) : 0
      };

      setOrderSummary(summary);

    } catch (error) {
      console.error('Error fetching vendor data:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Vendor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              {vendor.name}
            </h1>
            <p className="text-gray-600 mt-1">{vendor.location}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant={vendor.active ? "default" : "secondary"}>
              {vendor.active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orderSummary?.total_orders || 0}
                  </p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {orderSummary?.pending_orders || 0} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">
                    €{orderSummary?.total_revenue?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                  <p className="text-2xl font-bold text-purple-600">
                    €{orderSummary?.avg_order_value?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Per order
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Menus</p>
                  <p className="text-2xl font-bold text-orange-600">1</p>
                </div>
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Main menu active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu">Menu Builder</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="qr">QR & Marketing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <MenuBuilder />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="qr">
            <QRGenerator />
          </TabsContent>

          <TabsContent value="analytics">
            <AIAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
