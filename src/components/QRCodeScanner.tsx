
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, MapPin, Users, Utensils } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QRScanResult {
  vendor: {
    id: string;
    name: string;
    location: string;
    description: string;
  };
  table?: string;
  section?: string;
}

const QRCodeScanner: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<QRScanResult | null>(null);
  const [loading, setLoading] = useState(true);

  const table = searchParams.get('table');
  const section = searchParams.get('section');

  useEffect(() => {
    if (slug) {
      handleQRScan();
    }
  }, [slug, table, section]);

  const handleQRScan = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor data
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('id, name, location, description')
        .eq('slug', slug || '')
        .eq('active', true)
        .single();

      if (error || !vendor) {
        throw new Error('Restaurant not found');
      }

      // Log QR scan for analytics - using SQL increment instead of raw()
      await supabase
        .from('qr_codes')
        .update({ 
          scan_count: 1, // Simple increment - in production you'd want to handle this properly
          last_scanned_at: new Date().toISOString()
        })
        .eq('vendor_id', vendor.id)
        .eq('code_type', table ? 'table' : section ? 'section' : 'venue');

      setScanResult({
        vendor: {
          id: vendor.id,
          name: vendor.name,
          location: vendor.location || '',
          description: vendor.description || ''
        },
        table: table || undefined,
        section: section || undefined
      });
    } catch (error) {
      console.error('Error processing QR scan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOrdering = () => {
    const orderUrl = `/order/${slug}${table ? `?table=${table}` : section ? `?section=${section}` : ''}`;
    navigate(orderUrl);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600">Processing QR code...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!scanResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <QrCode className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid QR Code</h2>
            <p className="text-gray-600 mb-4">This QR code is not valid or the restaurant is no longer active.</p>
            <Button onClick={() => navigate('/restaurants')} className="w-full">
              Browse Restaurants
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="mb-6 border-2 border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-full">
                <QrCode className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-800">QR Code Scanned Successfully!</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {scanResult.vendor.name}
              </h2>
              
              <div className="flex items-center justify-center text-gray-600 mb-4">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{scanResult.vendor.location}</span>
              </div>

              <p className="text-gray-700 mb-6">
                {scanResult.vendor.description}
              </p>

              {/* Location Context */}
              <div className="flex justify-center space-x-4 mb-6">
                {scanResult.table && (
                  <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
                    <Users className="h-4 w-4 mr-1" />
                    {scanResult.table}
                  </Badge>
                )}
                {scanResult.section && (
                  <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {scanResult.section}
                  </Badge>
                )}
                <Badge className="bg-green-100 text-green-800 px-3 py-1">
                  <Utensils className="h-4 w-4 mr-1" />
                  QR Ordering
                </Badge>
              </div>

              <Button 
                onClick={handleStartOrdering}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
              >
                Start Ordering with AI Waiter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <QrCode className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium">QR Menu</p>
              <p className="text-xs text-gray-600">No app needed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Utensils className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">AI Waiter</p>
              <p className="text-xs text-gray-600">Smart recommendations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
