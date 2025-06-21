
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { usePWA } from '@/hooks/usePWA';
import { offlineService } from '@/services/offlineService';
import { 
  Smartphone, 
  WifiOff, 
  Bell, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  Globe,
  Users
} from 'lucide-react';

const PWAOptimization = () => {
  const { isInstalled, isOnline, installApp, isInstallable } = usePWA();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [offlineMode, setOfflineMode] = React.useState(false);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const handleOfflineModeToggle = async () => {
    if (!offlineMode) {
      await offlineService.init();
      setOfflineMode(true);
    } else {
      setOfflineMode(false);
    }
  };

  const pwaMetrics = {
    installRate: 68,
    offlineUsage: 23,
    pushEngagement: 45,
    mobilePerformance: 92
  };

  return (
    <div className="space-y-6">
      {/* PWA Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PWA Install Rate</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pwaMetrics.installRate}%</div>
            <Progress value={pwaMetrics.installRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Usage</CardTitle>
            <WifiOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pwaMetrics.offlineUsage}%</div>
            <Progress value={pwaMetrics.offlineUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push Engagement</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pwaMetrics.pushEngagement}%</div>
            <Progress value={pwaMetrics.pushEngagement} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pwaMetrics.mobilePerformance}%</div>
            <Progress value={pwaMetrics.mobilePerformance} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* PWA Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="mr-2 h-5 w-5" />
              PWA Installation
            </CardTitle>
            <CardDescription>
              App installation status and management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>App Installed</span>
              <Badge variant={isInstalled ? "default" : "secondary"}>
                {isInstalled ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Installable</span>
              <Badge variant={isInstallable ? "default" : "secondary"}>
                {isInstallable ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Online Status</span>
              <Badge variant={isOnline ? "default" : "destructive"}>
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            {isInstallable && !isInstalled && (
              <Button onClick={installApp} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Install ICUPA App
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Real-time order updates and notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Notifications Enabled</span>
              <Switch 
                checked={notificationsEnabled}
                onCheckedChange={handleEnableNotifications}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Order confirmations
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Preparation updates
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                Ready for pickup
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <AlertCircle className="mr-2 h-4 w-4 text-yellow-600" />
                Special offers
              </div>
            </div>
            {!notificationsEnabled && (
              <Button onClick={handleEnableNotifications} variant="outline" className="w-full">
                Enable Notifications
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <WifiOff className="mr-2 h-5 w-5" />
            Offline Capabilities
          </CardTitle>
          <CardDescription>
            Browse menus and place orders even without internet connection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Offline Mode</span>
                <Switch 
                  checked={offlineMode}
                  onCheckedChange={handleOfflineModeToggle}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Menu browsing offline
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Order queue when offline
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Auto-sync when back online
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                  Cached images and content
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Storage Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Menu Data</span>
                  <span>2.3 MB</span>
                </div>
                <Progress value={35} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Images Cache</span>
                  <span>8.7 MB</span>
                </div>
                <Progress value={65} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Pending Orders</span>
                  <span>0.2 MB</span>
                </div>
                <Progress value={5} className="h-2" />
              </div>
              <Button variant="outline" size="sm" className="w-full">
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile UX Enhancements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Smartphone className="mr-2 h-5 w-5" />
            Mobile UX Enhancements
          </CardTitle>
          <CardDescription>
            Optimized mobile experience features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Performance
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Loading Speed</span>
                  <Badge variant="default">Fast</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Image Optimization</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Lazy Loading</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Accessibility
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Touch Targets</span>
                  <Badge variant="default">Optimized</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Screen Reader</span>
                  <Badge variant="default">Support</Badge>
                </div>
                <div className="flex justify-between">
                  <span>High Contrast</span>
                  <Badge variant="secondary">Available</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                Security
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>HTTPS</span>
                  <Badge variant="default">Secured</Badge>
                </div>
                <div className="flex justify-between">
                  <span>CSP Headers</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Data Encryption</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            Integration Opportunities
          </CardTitle>
          <CardDescription>
            External services and platform integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Available Integrations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Google Pay</div>
                    <div className="text-sm text-muted-foreground">Mobile payments</div>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Apple Pay</div>
                    <div className="text-sm text-muted-foreground">iOS payments</div>
                  </div>
                  <Badge variant="secondary">Available</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Firebase Cloud Messaging</div>
                    <div className="text-sm text-muted-foreground">Push notifications</div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Future Integrations</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                  <div>
                    <div className="font-medium">Geolocation Services</div>
                    <div className="text-sm text-muted-foreground">Location-based features</div>
                  </div>
                  <Badge variant="outline">Planned</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                  <div>
                    <div className="font-medium">Bluetooth Beacons</div>
                    <div className="text-sm text-muted-foreground">Proximity ordering</div>
                  </div>
                  <Badge variant="outline">Planned</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg opacity-60">
                  <div>
                    <div className="font-medium">AR Menu Preview</div>
                    <div className="text-sm text-muted-foreground">Augmented reality</div>
                  </div>
                  <Badge variant="outline">Research</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAOptimization;
