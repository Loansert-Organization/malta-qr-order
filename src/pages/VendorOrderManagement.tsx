
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Settings, QrCode } from 'lucide-react';
import VendorOrderDashboard from '@/components/vendor/VendorOrderDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const VendorOrderManagement = () => {
  const { toast } = useToast();
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorInfo, setVendorInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For demo purposes, we'll use the first vendor
    // In a real app, this would come from auth context
    fetchVendorInfo();
  }, []);

  const fetchVendorInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('active', true)
        .limit(1)
        .single();

      if (error) throw error;
      
      setVendorInfo(data);
      setVendorId(data.id);
    } catch (error) {
      console.error('Error fetching vendor info:', error);
      toast({
        title: "Error",
        description: "Failed to load vendor information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendorId || !vendorInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Vendor Access Required</h2>
            <p className="text-gray-600 mb-4">
              Please log in as a vendor to access the order management dashboard.
            </p>
            <Button onClick={fetchVendorInfo}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{vendorInfo.name}</h1>
              <p className="text-gray-600">Vendor Dashboard</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{vendorInfo.location}</Badge>
              <Badge variant={vendorInfo.active ? "default" : "secondary"}>
                {vendorInfo.active ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Order Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <VendorOrderDashboard vendorId={vendorId} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Sales Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Analytics dashboard coming soon</p>
                  <p className="text-sm">Track your sales, popular items, and customer insights</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Restaurant Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Restaurant Name</label>
                      <p className="text-gray-600">{vendorInfo.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Location</label>
                      <p className="text-gray-600">{vendorInfo.location || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description</label>
                      <p className="text-gray-600">{vendorInfo.description || 'No description'}</p>
                    </div>
                    <Button variant="outline" className="w-full">
                      Edit Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    QR Code & Marketing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm text-gray-600 mb-4">
                      Generate QR codes for table ordering
                    </p>
                    <Button variant="outline" className="w-full">
                      Generate QR Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorOrderManagement;
