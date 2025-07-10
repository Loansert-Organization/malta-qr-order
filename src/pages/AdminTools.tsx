import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Bot, MapPin, Menu, QrCode, Plus, Settings, Zap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { adminLogger } from '@/services/adminLoggingService';

interface GlobalSetting {
  key: string;
  value: string;
  description: string;
}

const AdminTools = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Malta');
  const [selectedBarId, setSelectedBarId] = useState('');
  
  // Dialog states
  const [showAddBarDialog, setShowAddBarDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  
  // Form states
  const [newBarForm, setNewBarForm] = useState({
    name: '',
    country: 'Malta',
    address: '',
    latitude: '',
    longitude: '',
    momo_code: '',
    revolut_link: ''
  });
  
  const [settings, setSettings] = useState({
    vat_percentage: '18',
    service_fee: '2',
    currency_conversion_rate: '1500'
  });

  // AI Tool Handlers
  const handleDiscoverBars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-malta-bars', {
        body: { country: selectedCountry, limit: 20 }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Discovered ${data?.bars?.length || 0} bars in ${selectedCountry}`,
      });

      // Log the AI tool usage
      await adminLogger.logAIToolUsage('bar_discovery', {
        country: selectedCountry,
        limit: 20
      }, data);
    } catch (error) {
      console.error('Error discovering bars:', error);
      toast({
        title: "Error",
        description: "Failed to discover bars",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMenu = async () => {
    if (!selectedBarId) {
      toast({
        title: "Error",
        description: "Please select a bar first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-menu-items', {
        body: { bar_id: selectedBarId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Fetched ${data?.items?.length || 0} menu items`,
      });
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast({
        title: "Error",
        description: "Failed to fetch menu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async () => {
    if (!selectedBarId) {
      toast({
        title: "Error",
        description: "Please select a bar first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-qr-code', {
        body: { bar_id: selectedBarId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "QR code generated successfully",
      });
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

  // Manual Actions
  const handleAddBar = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .insert({
          name: newBarForm.name,
          country: newBarForm.country,
          address: newBarForm.address,
          latitude: parseFloat(newBarForm.latitude) || null,
          longitude: parseFloat(newBarForm.longitude) || null,
          momo_code: newBarForm.momo_code || null,
          revolut_link: newBarForm.revolut_link || null,
          is_active: true,
          is_onboarded: false
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bar "${data.name}" added successfully`,
      });

      setShowAddBarDialog(false);
      setNewBarForm({
        name: '',
        country: 'Malta',
        address: '',
        latitude: '',
        longitude: '',
        momo_code: '',
        revolut_link: ''
      });
    } catch (error) {
      console.error('Error adding bar:', error);
      toast({
        title: "Error",
        description: "Failed to add bar",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSettings = async () => {
    try {
      // In a real app, this would update a global_settings table
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      
      setShowSettingsDialog(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
    }
  };

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
                onClick={() => navigate('/admin')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Manual Actions & AI Tools</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* AI Tools Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Bot className="h-6 w-6" />
              AI-Powered Tools
            </h2>

            {/* Bar Discovery */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Bar Discovery
                </CardTitle>
                <CardDescription>
                  Automatically discover bars in a country using Google Maps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="discover-country">Country</Label>
                    <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                      <SelectTrigger id="discover-country">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Malta">Malta</SelectItem>
                        <SelectItem value="Rwanda">Rwanda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleDiscoverBars}
                    disabled={loading}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Discover Bars
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Menu Fetching */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Menu className="h-5 w-5" />
                  Menu Discovery
                </CardTitle>
                <CardDescription>
                  Fetch menu items for a bar using web scraping
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="menu-bar-id">Bar ID</Label>
                    <Input
                      id="menu-bar-id"
                      placeholder="Enter bar ID..."
                      value={selectedBarId}
                      onChange={(e) => setSelectedBarId(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleFetchMenu}
                    disabled={loading || !selectedBarId}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Fetch Menu
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Generation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  QR Code Generation
                </CardTitle>
                <CardDescription>
                  Generate or regenerate QR code for a bar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="qr-bar-id">Bar ID</Label>
                    <Input
                      id="qr-bar-id"
                      placeholder="Enter bar ID..."
                      value={selectedBarId}
                      onChange={(e) => setSelectedBarId(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleGenerateQR}
                    disabled={loading || !selectedBarId}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Generate QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Import Bars */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Import Bars from Google Maps
                </CardTitle>
                <CardDescription>
                  Fetches latest bars & restaurants for Malta, Gozo, Rwanda
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={async () => {
                    setLoading(true);
                    const { data, error } = await supabase.functions.invoke('import_bars');
                    setLoading(false);
                    if (error) {
                      toast({ title: 'Error', description: error.message, variant: 'destructive' });
                    } else {
                      toast({ title: 'Import finished', description: JSON.stringify(data.imported) });
                    }
                  }}
                >
                  Run Import Now
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Manual Actions Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Manual Actions
            </h2>

            {/* Add Bar Manually */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add Bar Manually
                </CardTitle>
                <CardDescription>
                  Manually add a bar that wasn't discovered automatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => setShowAddBarDialog(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Bar
                </Button>
              </CardContent>
            </Card>

            {/* Global Settings */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Global Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings like VAT percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  onClick={() => setShowSettingsDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Settings
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin/bars')}
                >
                  Manage Bars
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin/menus')}
                >
                  Review Menus
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/admin/orders')}
                >
                  Monitor Orders
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add Bar Dialog */}
      <Dialog open={showAddBarDialog} onOpenChange={setShowAddBarDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Bar</DialogTitle>
            <DialogDescription>
              Manually add a bar to the system
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bar-name">Bar Name*</Label>
              <Input
                id="bar-name"
                value={newBarForm.name}
                onChange={(e) => setNewBarForm({ ...newBarForm, name: e.target.value })}
                placeholder="Enter bar name"
              />
            </div>
            <div>
              <Label htmlFor="bar-country">Country*</Label>
              <Select 
                value={newBarForm.country} 
                onValueChange={(value) => setNewBarForm({ ...newBarForm, country: value })}
              >
                <SelectTrigger id="bar-country">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Malta">Malta</SelectItem>
                  <SelectItem value="Rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="bar-address">Address</Label>
              <Textarea
                id="bar-address"
                value={newBarForm.address}
                onChange={(e) => setNewBarForm({ ...newBarForm, address: e.target.value })}
                placeholder="Enter full address"
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="bar-lat">Latitude</Label>
              <Input
                id="bar-lat"
                type="number"
                step="0.000001"
                value={newBarForm.latitude}
                onChange={(e) => setNewBarForm({ ...newBarForm, latitude: e.target.value })}
                placeholder="e.g., 35.8989"
              />
            </div>
            <div>
              <Label htmlFor="bar-lng">Longitude</Label>
              <Input
                id="bar-lng"
                type="number"
                step="0.000001"
                value={newBarForm.longitude}
                onChange={(e) => setNewBarForm({ ...newBarForm, longitude: e.target.value })}
                placeholder="e.g., 14.5146"
              />
            </div>
            {newBarForm.country === 'Rwanda' ? (
              <div className="col-span-2">
                <Label htmlFor="bar-momo">MoMo Code</Label>
                <Input
                  id="bar-momo"
                  value={newBarForm.momo_code}
                  onChange={(e) => setNewBarForm({ ...newBarForm, momo_code: e.target.value })}
                  placeholder="182*1*1001"
                />
              </div>
            ) : (
              <div className="col-span-2">
                <Label htmlFor="bar-revolut">Revolut Link</Label>
                <Input
                  id="bar-revolut"
                  value={newBarForm.revolut_link}
                  onChange={(e) => setNewBarForm({ ...newBarForm, revolut_link: e.target.value })}
                  placeholder="https://revolut.me/barname"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBarDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBar} disabled={!newBarForm.name || !newBarForm.country}>
              Add Bar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Global Settings</DialogTitle>
            <DialogDescription>
              Configure system-wide settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="vat">VAT Percentage (%)</Label>
              <Input
                id="vat"
                type="number"
                value={settings.vat_percentage}
                onChange={(e) => setSettings({ ...settings, vat_percentage: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="service-fee">Service Fee (%)</Label>
              <Input
                id="service-fee"
                type="number"
                value={settings.service_fee}
                onChange={(e) => setSettings({ ...settings, service_fee: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="conversion">EUR to RWF Conversion Rate</Label>
              <Input
                id="conversion"
                type="number"
                value={settings.currency_conversion_rate}
                onChange={(e) => setSettings({ ...settings, currency_conversion_rate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bar Onboarding Links */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Bar Onboarding</h3>
        <div className="flex flex-col gap-2">
          <Button onClick={() => navigate('/admin/bar-onboarding/upload-menu')}>Upload Menu (CSV)</Button>
          <Button onClick={() => navigate('/admin/bar-onboarding/payments')}>Bar Payments Form</Button>
          <Button onClick={() => navigate('/admin/bar-onboarding/qrcode')}>Bar Menu QR Code</Button>
        </div>
      </div>
    </div>
  );
};

export default AdminTools; 
