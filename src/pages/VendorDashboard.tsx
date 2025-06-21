
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
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVendorData = async () => {
    try {
      console.log('Fetching vendor data for ta-kris...');
      
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', 'ta-kris')
        .maybeSingle();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        console.log('No vendor found with slug ta-kris');
        setError('Vendor not found. Please check if the vendor exists.');
        return;
      }

      console.log('Vendor data fetched:', data);
      setVendor(data);
      
    } catch (error) {
      console.error('Error fetching vendor data:', error);
      setError('Failed to load vendor data. Please try again.');
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

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Vendor Not Found'}
          </h2>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load vendor information.'}
          </p>
          <button 
            onClick={fetchVendorData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
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
            <MenuBuilder vendorId={vendor.id} menuId="default" />
          </TabsContent>

          <TabsContent value="orders">
            <OrderManagement />
          </TabsContent>

          <TabsContent value="qr">
            <QRGenerator />
          </TabsContent>

          <TabsContent value="analytics">
            <AIAnalytics vendorId={vendor.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorDashboard;
