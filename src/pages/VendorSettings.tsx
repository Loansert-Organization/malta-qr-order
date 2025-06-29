import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Save, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BarDetails {
  id: string;
  name: string;
  momo_code: string | null;
  revolut_link: string | null;
  logo_url: string | null;
  country: string;
}

const VendorSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [barDetails, setBarDetails] = useState<BarDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [barId, setBarId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    momo_code: '',
    revolut_link: '',
    logo_url: ''
  });

  useEffect(() => {
    const storedBarId = localStorage.getItem('vendorBarId');
    if (!storedBarId) {
      navigate('/vendor');
      return;
    }
    setBarId(storedBarId);
  }, [navigate]);

  useEffect(() => {
    if (barId) {
      fetchBarDetails();
    }
  }, [barId]);

  const fetchBarDetails = async () => {
    if (!barId) return;

    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .eq('id', barId)
        .single();

      if (error) throw error;

      if (data) {
        setBarDetails(data);
        setFormData({
          name: data.name || '',
          momo_code: data.momo_code || '',
          revolut_link: data.revolut_link || '',
          logo_url: data.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Error fetching bar details:', error);
      toast({
        title: "Error",
        description: "Failed to load bar details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!barId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('bars')
        .update({
          name: formData.name,
          momo_code: formData.momo_code || null,
          revolut_link: formData.revolut_link || null,
          logo_url: formData.logo_url || null
        })
        .eq('id', barId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bar details updated successfully",
      });

      // Update bar name in dashboard if changed
      if (formData.name !== barDetails?.name) {
        fetchBarDetails();
      }
    } catch (error) {
      console.error('Error updating bar details:', error);
      toast({
        title: "Error",
        description: "Failed to update bar details",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${barId}-logo.${fileExt}`;
      const filePath = `bar-logos/${fileName}`;

      // Delete old logo if exists
      if (formData.logo_url) {
        const oldPath = formData.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('bar-logos')
            .remove([`bar-logos/${oldPath}`]);
        }
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from('bar-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('bar-logos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, logo_url: publicUrl });
      
      toast({
        title: "Success",
        description: "Logo uploaded successfully",
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/vendor')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Bar Settings</h1>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Bar Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your bar name"
              />
            </div>
            
            <div>
              <Label htmlFor="logo">Bar Logo</Label>
              <div className="space-y-2">
                {formData.logo_url && (
                  <img 
                    src={formData.logo_url} 
                    alt="Bar logo" 
                    className="w-32 h-32 rounded-lg object-cover mb-2"
                  />
                )}
                <div className="flex items-center gap-2">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploading}
                  />
                  {uploading && <Loader2 className="h-4 w-4 animate-spin" />}
                </div>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, at least 256x256px
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {barDetails?.country === 'Rwanda' ? (
              <div>
                <Label htmlFor="momo_code">MoMo Merchant Code</Label>
                <Input
                  id="momo_code"
                  value={formData.momo_code}
                  onChange={(e) => setFormData({ ...formData, momo_code: e.target.value })}
                  placeholder="Enter your MoMo merchant code"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This code will be used in the USSD payment format: *182*1*YOUR_CODE*amount#
                </p>
              </div>
            ) : (
              <div>
                <Label htmlFor="revolut_link">Revolut Payment Link</Label>
                <Input
                  id="revolut_link"
                  value={formData.revolut_link}
                  onChange={(e) => setFormData({ ...formData, revolut_link: e.target.value })}
                  placeholder="https://revolut.me/yourusername"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Customers will be redirected to this link to complete payment
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Bar Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Bar ID</span>
                <span className="font-mono">{barId?.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Country</span>
                <span>{barDetails?.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VendorSettings; 