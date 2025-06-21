
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Eye, Plus, Edit, Trash2, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeData {
  id: string;
  code_type: 'venue' | 'table' | 'section';
  table_number?: string;
  qr_data: string;
  generated_url: string;
  active: boolean;
  scan_count: number;
}

interface QRGeneratorProps {
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
}

const QRGenerator: React.FC<QRGeneratorProps> = ({ vendorId, vendorName, vendorSlug }) => {
  const { toast } = useToast();
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [newQR, setNewQR] = useState({
    type: 'table' as 'venue' | 'table' | 'section',
    tableNumber: '',
    customData: ''
  });

  useEffect(() => {
    fetchQRCodes();
  }, [vendorId]);

  const fetchQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('vendor_id', vendorId)
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

  const generateQRCode = async () => {
    setGenerating(true);
    try {
      const baseUrl = window.location.origin;
      let qrUrl = `${baseUrl}/order/${vendorSlug}`;
      
      if (newQR.type === 'table' && newQR.tableNumber) {
        qrUrl += `?table=${newQR.tableNumber}`;
      }

      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: {
          vendor_id: vendorId,
          code_type: newQR.type,
          table_number: newQR.tableNumber || null,
          url: qrUrl,
          custom_data: newQR.customData
        }
      });

      if (error) throw error;

      await fetchQRCodes();
      setNewQR({ type: 'table', tableNumber: '', customData: '' });
      
      toast({
        title: "QR Code generated",
        description: "New QR code has been created successfully",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Generation failed",
        description: "Could not generate QR code",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = async (qrCode: QRCodeData) => {
    try {
      const { data, error } = await supabase.functions.invoke('download-qr-code', {
        body: { qr_id: qrCode.id, vendor_name: vendorName }
      });

      if (error) throw error;

      // Create download link
      const link = document.createElement('a');
      link.href = data.download_url;
      link.download = `qr-${qrCode.table_number || qrCode.code_type}-${vendorName.replace(/\s+/g, '-')}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast({
        title: "Download failed",
        description: "Could not download QR code",
        variant: "destructive"
      });
    }
  };

  const toggleQRStatus = async (qrId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .update({ active: !active })
        .eq('id', qrId);

      if (error) throw error;

      setQrCodes(prev => prev.map(qr => 
        qr.id === qrId ? { ...qr, active: !active } : qr
      ));

      toast({
        title: "Status updated",
        description: `QR code ${!active ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating QR status:', error);
      toast({
        title: "Update failed",
        description: "Could not update QR code status",
        variant: "destructive"
      });
    }
  };

  const deleteQR = async (qrId: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', qrId);

      if (error) throw error;

      setQrCodes(prev => prev.filter(qr => qr.id !== qrId));
      
      toast({
        title: "QR code deleted",
        description: "QR code has been removed",
      });
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete QR code",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Generator Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generate New QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={newQR.type}
                onChange={(e) => setNewQR({...newQR, type: e.target.value as any})}
                className="w-full p-2 border rounded-md"
              >
                <option value="venue">Venue QR</option>
                <option value="table">Table QR</option>
                <option value="section">Section QR</option>
              </select>
            </div>
            
            {newQR.type !== 'venue' && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  {newQR.type === 'table' ? 'Table Number' : 'Section Name'}
                </label>
                <Input
                  value={newQR.tableNumber}
                  onChange={(e) => setNewQR({...newQR, tableNumber: e.target.value})}
                  placeholder={newQR.type === 'table' ? 'e.g., A1, B2' : 'e.g., Terrace, Bar'}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-1">Custom Data (Optional)</label>
              <Input
                value={newQR.customData}
                onChange={(e) => setNewQR({...newQR, customData: e.target.value})}
                placeholder="Additional info"
              />
            </div>
          </div>

          <Button 
            onClick={generateQRCode} 
            disabled={generating || (newQR.type !== 'venue' && !newQR.tableNumber)}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            {generating ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {/* QR Codes List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading QR codes...</div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No QR codes generated yet. Create your first one above!
            </div>
          ) : (
            <div className="grid gap-4">
              {qrCodes.map((qr) => (
                <div key={qr.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">
                          {qr.code_type === 'venue' ? vendorName : 
                           qr.code_type === 'table' ? `Table ${qr.table_number}` :
                           `Section ${qr.table_number}`}
                        </h4>
                        <Badge variant={qr.active ? 'default' : 'secondary'}>
                          {qr.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {qr.code_type}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>URL: {qr.generated_url}</p>
                        <p>Scans: {qr.scan_count}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(qr.generated_url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadQR(qr)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleQRStatus(qr.id, qr.active)}
                      >
                        {qr.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteQR(qr.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QRGenerator;
