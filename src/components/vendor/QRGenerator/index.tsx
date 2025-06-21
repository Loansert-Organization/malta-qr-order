import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { QrCode, Download, Eye, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeData {
  id: string;
  vendor_id: string;
  code_type: 'venue' | 'table' | 'section';
  table_number: string | null;
  qr_data: string;
  generated_url: string;
  active: boolean;
  scan_count: number;
  created_at: string;
  updated_at: string;
}

const QRGenerator = () => {
  const [qrCodes, setQrCodes] = useState<QRCodeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code_type: 'venue' as QRCodeData['code_type'],
    table_number: ''
  });
  const { toast } = useToast();

  const fetchQRCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type-safe mapping to ensure code_type values match the union type
      const typedQRCodes = data?.map(qr => ({
        ...qr,
        code_type: qr.code_type as QRCodeData['code_type']
      })) || [];

      setQrCodes(typedQRCodes);
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch QR codes",
        variant: "destructive"
      });
    }
  };

  const generateQRCode = async () => {
    if (!formData.code_type) {
      toast({
        title: "Error",
        description: "Please select a QR code type",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Get current vendor (for demo, using the first vendor)
      const { data: vendors } = await supabase
        .from('vendors')
        .select('id, slug')
        .limit(1);

      if (!vendors || vendors.length === 0) {
        throw new Error('No vendor found');
      }

      const vendor = vendors[0];
      const baseUrl = window.location.origin;
      const qrUrl = `${baseUrl}/order/${vendor.slug}${
        formData.table_number ? `?table=${formData.table_number}` : ''
      }`;

      const response = await supabase.functions.invoke('generate-qr-code', {
        body: {
          vendor_id: vendor.id,
          code_type: formData.code_type,
          table_number: formData.table_number || null,
          url: qrUrl
        }
      });

      if (response.error) throw response.error;

      toast({
        title: "Success",
        description: "QR code generated successfully!",
      });

      // Reset form and refresh list
      setFormData({ code_type: 'venue', table_number: '' });
      fetchQRCodes();
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQRCode = (qrImageUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewQRCode = (url: string) => {
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchQRCodes();
  }, []);

  const getTypeColor = (type: QRCodeData['code_type']) => {
    switch (type) {
      case 'venue': return 'bg-blue-100 text-blue-800';
      case 'table': return 'bg-green-100 text-green-800';
      case 'section': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">QR Code Generator</h2>
        <QrCode className="h-8 w-8 text-blue-600" />
      </div>

      {/* QR Code Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code_type">QR Code Type</Label>
              <Select
                value={formData.code_type}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, code_type: value as QRCodeData['code_type'] }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="venue">Venue (General)</SelectItem>
                  <SelectItem value="table">Table Specific</SelectItem>
                  <SelectItem value="section">Section Specific</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.code_type === 'table' || formData.code_type === 'section') && (
              <div>
                <Label htmlFor="table_number">
                  {formData.code_type === 'table' ? 'Table Number' : 'Section Name'}
                </Label>
                <Input
                  id="table_number"
                  value={formData.table_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, table_number: e.target.value }))}
                  placeholder={formData.code_type === 'table' ? 'e.g., Table 5' : 'e.g., Terrace'}
                />
              </div>
            )}
          </div>

          <Button
            onClick={generateQRCode}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {loading ? 'Generating...' : 'Generate QR Code'}
          </Button>
        </CardContent>
      </Card>

      {/* Existing QR Codes */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Your QR Codes ({qrCodes.length})</h3>
        
        {qrCodes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <QrCode className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No QR codes generated yet</p>
              <p className="text-sm text-gray-400 mt-1">Create your first QR code above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {qrCodes.map((qr) => (
              <Card key={qr.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(qr.code_type)}>
                      {qr.code_type}
                    </Badge>
                    <Badge variant="outline">
                      {qr.scan_count} scans
                    </Badge>
                  </div>
                  {qr.table_number && (
                    <p className="text-sm font-medium">{qr.table_number}</p>
                  )}
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border flex items-center justify-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qr.qr_data)}`}
                      alt="QR Code"
                      className="w-24 h-24"
                    />
                  </div>

                  <div className="text-xs text-gray-500 break-all">
                    {qr.qr_data}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => previewQRCode(qr.qr_data)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadQRCode(
                        `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qr.qr_data)}`,
                        `qr-${qr.code_type}-${qr.id.slice(-8)}.png`
                      )}
                      className="flex-1"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>

                  <div className="text-xs text-gray-400">
                    Created: {new Date(qr.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
