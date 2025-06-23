
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
      setLoading(true);
      setError(null);
      
      console.log('=== VENDOR DASHBOARD DEBUG ===');
      console.log('Starting vendor data fetch...');
      
      // Fetch the Ta Kris vendor directly
      console.log('Fetching vendor with slug: ta-kris');
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('id, name, slug, location, active, created_at')
        .eq('slug', 'ta-kris')
        .maybeSingle();

      console.log('Vendor query result:', { vendorData, vendorError });

      if (vendorError) {
        console.error('Vendor fetch error:', vendorError);
        throw new Error(`Failed to fetch vendor: ${vendorError.message}`);
      }

      if (!vendorData) {
        console.log('No vendor found with slug ta-kris');
        
        // Let's check what vendors actually exist
        const { data: allVendors, error: allVendorsError } = await supabase
          .from('vendors')
          .select('slug, name')
          .limit(10);
        
        console.log('Available vendors:', { allVendors, allVendorsError });
        
        setError('Vendor "ta-kris" not found. Available vendors: ' + 
                 (allVendors?.map(v => v.slug).join(', ') || 'None'));
        return;
      }

      console.log('Successfully fetched vendor:', vendorData);
      setVendor(vendorData);
      
    } catch (error: any) {
      console.error('=== VENDOR FETCH ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error?.message);
      console.error('Full error:', error);
      
      const errorMessage = error?.message || 'Unknown error occurred';
      setError(`Failed to load vendor data: ${errorMessage}`);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      console.log('=== VENDOR DASHBOARD DEBUG END ===');
    }
  };

  useEffect(() => {
    console.log('VendorDashboard component mounted, starting data fetch...');
    fetchVendorData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vendor dashboard...</p>
          <p className="mt-2 text-sm text-gray-500">Connecting to database...</p>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Database Error' : 'Vendor Not Found'}
          </h2>
          <div className="bg-red-50 p-4 rounded-lg mb-4">
            <p className="text-red-800 text-sm font-mono whitespace-pre-wrap">
              {error || 'Unable to load vendor information.'}
            </p>
          </div>
          <div className="space-x-4">
            <button 
              onClick={fetchVendorData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry Connection
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Go Home
            </button>
          </div>
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
            <p className="text-gray-600 mt-1">Vendor Dashboard - Full Access Mode</p>
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
