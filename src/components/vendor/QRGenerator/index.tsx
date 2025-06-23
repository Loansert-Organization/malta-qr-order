
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Share2, Eye, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCode {
  id: string;
  code_type: string;
  table_number?: string;
  generated_url: string;
  scan_count: number;
  active: boolean;
  created_at: string;
}

const QRGenerator: React.FC = () => {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState('');

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const fetchQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQrCodes(data || []);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to load QR codes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (type: 'venue' | 'table') => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { 
          type,
          tableNumber: type === 'table' ? newTableNumber : undefined
        }
      });

      if (error) throw error;

      toast({
        title: "QR Code Generated",
        description: `${type} QR code created successfully`,
      });

      setNewTableNumber('');
      fetchQRCodes();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQR = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code',
          url: url
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Copied",
        description: "QR code URL copied to clipboard",
      });
    }
  };

  const toggleQRStatus = async (qrId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ active: !currentStatus })
        .eq('id', qrId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `QR code ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchQRCodes();
    } catch (error) {
      console.error('Error updating QR status:', error);
      toast({
        title: "Error",
        description: "Failed to update QR code status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading QR codes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">QR Code Generator</h1>
        <div className="flex gap-2">
          <Button onClick={() => generateQRCode('venue')} disabled={generating}>
            <QrCode className="h-4 w-4 mr-2" />
            Generate Venue QR
          </Button>
        </div>
      </div>

      {/* Table QR Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Table QR Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Table number (e.g., 1, 2, 3)"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={() => generateQRCode('table')}
              disabled={generating || !newTableNumber}
            >
              {generating ? 'Generating...' : 'Generate Table QR'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {qrCodes.map((qr) => (
          <Card key={qr.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold capitalize">{qr.code_type} QR</h3>
                  {qr.table_number && (
                    <p className="text-sm text-gray-600">Table {qr.table_number}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Badge variant={qr.active ? 'default' : 'secondary'}>
                    {qr.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {/* QR Code Preview */}
              <div className="bg-white p-4 rounded-lg mb-3 flex items-center justify-center">
                <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-gray-500" />
                  <span className="sr-only">QR Code for {qr.code_type}</span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{qr.scan_count} scans</span>
                </div>
                <p className="text-xs text-gray-500">
                  Created {new Date(qr.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadQR(qr.generated_url, `qr-${qr.code_type}-${qr.table_number || 'venue'}.png`)}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => shareQR(qr.generated_url)}
                >
                  <Share2 className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                >
                  <Printer className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant={qr.active ? 'destructive' : 'default'}
                  onClick={() => toggleQRStatus(qr.id, qr.active)}
                >
                  {qr.active ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {qrCodes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No QR codes yet</h3>
            <p className="text-gray-600 mb-4">Generate your first QR code to get started</p>
            <Button onClick={() => generateQRCode('venue')}>
              Generate Venue QR Code
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRGenerator;
