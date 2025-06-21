
import React from 'react';
import PWAOptimization from '@/components/PWAOptimization';
import MobileOrderingInterface from '@/components/mobile/MobileOrderingInterface';
import PushNotificationManager from '@/components/notifications/PushNotificationManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Bell, 
  WifiOff, 
  Settings 
} from 'lucide-react';

const PWADashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-green-600 to-blue-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">PWA Mobile Optimization</h1>
              <p className="text-green-100">Enhanced mobile experience with offline capabilities</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Smartphone className="h-4 w-4 mr-1" />
                Mobile-First
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <WifiOff className="h-4 w-4 mr-1" />
                Offline Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger value="mobile-ui" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Mobile UI</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center space-x-2">
              <WifiOff className="h-4 w-4" />
              <span>Offline Mode</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <PWAOptimization />
          </TabsContent>

          <TabsContent value="mobile-ui">
            <MobileOrderingInterface />
          </TabsContent>

          <TabsContent value="notifications">
            <PushNotificationManager />
          </TabsContent>

          <TabsContent value="offline">
            <div className="text-center py-12">
              <WifiOff className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Offline Mode Demo</h3>
              <p className="text-muted-foreground">
                Disconnect your internet to see offline capabilities in action
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PWADashboard;
