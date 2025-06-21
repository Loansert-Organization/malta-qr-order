
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Import vendor components
import MenuBuilder from '@/components/vendor/MenuBuilder';
import OrderManagement from '@/components/vendor/OrderManagement';
import QRGenerator from '@/components/vendor/QRGenerator';
import AIAnalytics from '@/components/vendor/AIAnalytics';

interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  active: boolean;
  created_at: string;
}

const VendorDashboard = () => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock vendor for demonstration - in production this would come from auth/routing
  const mockVendorId = 'ta-kris-vendor-id';

  const fetchVendorData = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', 'ta-kris')
        .single();

      if (error) throw error;
      setVendor(data);
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
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Vendor Not Found</h2>
          <p className="text-gray-600">Unable to load vendor information.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
            <p className="text-gray-600 mt-1">Vendor Dashboard</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Location: {vendor.location}</p>
            <p className="text-sm text-gray-500">Status: {vendor.active ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="menu" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="menu">Menu Builder</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="qr">QR Codes</TabsTrigger>
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
