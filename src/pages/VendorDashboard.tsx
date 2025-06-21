import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShoppingCart, BarChart3, QrCode, FileText, Settings } from 'lucide-react';
import { toast } from 'sonner';
import MenuBuilder from '@/components/vendor/MenuBuilder';
import OrderManagement from '@/components/vendor/OrderManagement';
import QRGenerator from '@/components/vendor/QRGenerator';
import AIAnalytics from '@/components/vendor/AIAnalytics';

const VendorDashboard: React.FC = () => {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendorAndMenuIds = async () => {
      try {
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('id')
          .limit(1)
          .single();

        if (vendorError) {
          throw vendorError;
        }

        if (vendorData) {
          setVendorId(vendorData.id);

          const { data: menuData, error: menuError } = await supabase
            .from('menus')
            .select('id')
            .eq('vendor_id', vendorData.id)
            .limit(1)
            .single();

          if (menuError) {
            throw menuError;
          }

          if (menuData) {
            setMenuId(menuData.id);
          } else {
            toast.error('No menu found for this vendor.');
          }
        } else {
          toast.error('No vendor found.');
        }
      } catch (error: any) {
        console.error('Error fetching vendor and menu IDs:', error);
        toast.error(`Error: ${error.message}`);
      }
    };

    fetchVendorAndMenuIds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your restaurant operations</p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">€248.50</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Menu Items</p>
                  <p className="text-2xl font-bold text-gray-900">24</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">QR Scans</p>
                  <p className="text-2xl font-bold text-gray-900">156</p>
                </div>
                <QrCode className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="qr">QR Codes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            {vendorId && (
              <OrderManagement 
                vendorId={vendorId} 
                orders={[]} 
                onUpdateOrderStatus={() => {}}
              />
            )}
          </TabsContent>

          <TabsContent value="menu">
            {vendorId && menuId && (
              <MenuBuilder 
                vendorId={vendorId}
                menuId={menuId}
              />
            )}
          </TabsContent>

          <TabsContent value="qr">
            {vendorId && <QRGenerator vendorId={vendorId} />}
          </TabsContent>

          <TabsContent value="analytics">
            {vendorId && <AIAnalytics vendorId={vendorId} />}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
