import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Bell, 
  Shield, 
  Globe, 
  Palette, 
  Smartphone, 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle,
  Trash2,
  Download,
  Upload
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  notifications: {
    orderUpdates: boolean;
    promotions: boolean;
    marketing: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    shareLocation: boolean;
    shareAnalytics: boolean;
    publicProfile: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
    language: string;
  };
  location: {
    defaultCountry: string;
    defaultCity: string;
    autoDetectLocation: boolean;
  };
  data: {
    autoBackup: boolean;
    exportData: boolean;
    clearData: boolean;
  };
}

const ClientSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      orderUpdates: true,
      promotions: false,
      marketing: false,
      pushNotifications: true,
    },
    privacy: {
      shareLocation: true,
      shareAnalytics: true,
      publicProfile: false,
    },
    appearance: {
      theme: 'system',
      fontSize: 'medium',
      language: 'en',
    },
    location: {
      defaultCountry: 'Malta',
      defaultCity: '',
      autoDetectLocation: true,
    },
    data: {
      autoBackup: true,
      exportData: false,
      clearData: false,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Load settings from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('settings')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error loading settings:', profileError);
        setError('Failed to load settings');
      } else if (profileData?.settings) {
        setSettings(prev => ({
          ...prev,
          ...profileData.settings
        }));
      }

      // Load settings from localStorage as fallback
      const localSettings = localStorage.getItem('icupa_settings');
      if (localSettings) {
        try {
          const parsedSettings = JSON.parse(localSettings);
          setSettings(prev => ({
            ...prev,
            ...parsedSettings
          }));
        } catch (e) {
          console.error('Error parsing local settings:', e);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "User not authenticated",
          variant: "destructive"
        });
        return;
      }

      // Save to database
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          settings: settings,
          updated_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      // Save to localStorage as backup
      localStorage.setItem('icupa_settings', JSON.stringify(settings));

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof UserSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const exportUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Fetch user data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id);

      const exportData = {
        profile,
        orders,
        settings,
        exportDate: new Date().toISOString()
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `icupa-user-data-${user.id}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "User data exported successfully",
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive"
      });
    }
  };

  const clearUserData = async () => {
    if (!confirm('Are you sure you want to clear all your data? This action cannot be undone.')) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Clear orders
      await supabase
        .from('orders')
        .delete()
        .eq('user_id', user.id);

      // Clear profile data
      await supabase
        .from('profiles')
        .update({
          first_name: null,
          last_name: null,
          phone: null,
          settings: null
        })
        .eq('id', user.id);

      // Clear localStorage
      localStorage.removeItem('icupa_settings');
      localStorage.removeItem('icupa_favorites');
      localStorage.removeItem('icupa_cart');

      toast({
        title: "Success",
        description: "All user data cleared successfully",
      });

      // Reset settings to defaults
      setSettings({
        notifications: {
          orderUpdates: true,
          promotions: false,
          marketing: false,
          pushNotifications: true,
        },
        privacy: {
          shareLocation: true,
          shareAnalytics: true,
          publicProfile: false,
        },
        appearance: {
          theme: 'system',
          fontSize: 'medium',
          language: 'en',
        },
        location: {
          defaultCountry: 'Malta',
          defaultCity: '',
          autoDetectLocation: true,
        },
        data: {
          autoBackup: true,
          exportData: false,
          clearData: false,
        },
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      toast({
        title: "Error",
        description: "Failed to clear data",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={loadSettings}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/client')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Settings</h1>
                <p className="text-sm text-gray-600">Customize your experience</p>
              </div>
            </div>
            
            <Button
              onClick={saveSettings}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Order Updates</Label>
                  <p className="text-xs text-gray-600">Get notified about order status changes</p>
                </div>
                <Switch
                  checked={settings.notifications.orderUpdates}
                  onCheckedChange={(checked) => updateSetting('notifications', 'orderUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Promotional Offers</Label>
                  <p className="text-xs text-gray-600">Receive special deals and discounts</p>
                </div>
                <Switch
                  checked={settings.notifications.promotions}
                  onCheckedChange={(checked) => updateSetting('notifications', 'promotions', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Marketing Communications</Label>
                  <p className="text-xs text-gray-600">Receive newsletters and updates</p>
                </div>
                <Switch
                  checked={settings.notifications.marketing}
                  onCheckedChange={(checked) => updateSetting('notifications', 'marketing', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-gray-600">Receive notifications on your device</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control your privacy settings and data sharing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Share Location</Label>
                  <p className="text-xs text-gray-600">Allow location-based recommendations</p>
                </div>
                <Switch
                  checked={settings.privacy.shareLocation}
                  onCheckedChange={(checked) => updateSetting('privacy', 'shareLocation', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Analytics Sharing</Label>
                  <p className="text-xs text-gray-600">Help improve the app with usage data</p>
                </div>
                <Switch
                  checked={settings.privacy.shareAnalytics}
                  onCheckedChange={(checked) => updateSetting('privacy', 'shareAnalytics', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Public Profile</Label>
                  <p className="text-xs text-gray-600">Make your profile visible to others</p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of the app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <Select 
                  value={settings.appearance.theme} 
                  onValueChange={(value) => updateSetting('appearance', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Font Size</Label>
                <Select 
                  value={settings.appearance.fontSize} 
                  onValueChange={(value) => updateSetting('appearance', 'fontSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Language</Label>
                <Select 
                  value={settings.appearance.language} 
                  onValueChange={(value) => updateSetting('appearance', 'language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="mt">Maltese</SelectItem>
                    <SelectItem value="rw">Kinyarwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Location
            </CardTitle>
            <CardDescription>
              Set your default location preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Default Country</Label>
                <Select 
                  value={settings.location.defaultCountry} 
                  onValueChange={(value) => updateSetting('location', 'defaultCountry', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Malta">Malta</SelectItem>
                    <SelectItem value="Rwanda">Rwanda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Default City</Label>
                <Input
                  value={settings.location.defaultCity}
                  onChange={(e) => updateSetting('location', 'defaultCity', e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-detect Location</Label>
                <p className="text-xs text-gray-600">Automatically detect your location</p>
              </div>
              <Switch
                checked={settings.location.autoDetectLocation}
                onCheckedChange={(checked) => updateSetting('location', 'autoDetectLocation', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Data Management
            </CardTitle>
            <CardDescription>
              Manage your data and account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Auto Backup</Label>
                  <p className="text-xs text-gray-600">Automatically backup your data</p>
                </div>
                <Switch
                  checked={settings.data.autoBackup}
                  onCheckedChange={(checked) => updateSetting('data', 'autoBackup', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Export Data</Label>
                  <p className="text-xs text-gray-600">Download all your data</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportUserData}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Clear All Data</Label>
                  <p className="text-xs text-gray-600 text-red-600">Permanently delete all your data</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={clearUserData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientSettings; 