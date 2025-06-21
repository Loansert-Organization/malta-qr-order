
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, BellOff, Check, X, Settings, Users, Clock, DollarSign } from 'lucide-react';

interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  tableReady: boolean;
  specialOffers: boolean;
}

interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'order' | 'promotion' | 'system';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

const PushNotificationManager = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>({
    orderUpdates: true,
    promotions: false,
    tableReady: true,
    specialOffers: false
  });
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Ready! 🍕',
      body: 'Your Margherita Pizza is ready for pickup at Table 5',
      type: 'order',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      actionUrl: '/order/status/123'
    },
    {
      id: '2',
      title: 'Happy Hour Started! 🍹',
      body: '50% off all cocktails until 8 PM',
      type: 'promotion',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true
    },
    {
      id: '3',
      title: 'Order Confirmed ✅',
      body: 'Your order #456 has been confirmed. Estimated time: 20 minutes',
      type: 'order',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: true
    }
  ]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        // Register service worker for push notifications
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // In a real implementation, you would subscribe to push notifications here
            console.log('Service worker ready for push notifications', registration);
          } catch (error) {
            console.error('Service worker registration failed:', error);
          }
        }
      }
    }
  };

  const updateSetting = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from ICUPA Malta',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'test-notification',
        requireInteraction: true
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'promotion':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {permission === 'granted' ? (
              <Bell className="mr-2 h-5 w-5 text-green-600" />
            ) : (
              <BellOff className="mr-2 h-5 w-5 text-red-600" />
            )}
            Push Notification Status
          </CardTitle>
          <CardDescription>
            Manage your notification preferences and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Browser Permission</span>
              <Badge variant={permission === 'granted' ? 'default' : 'destructive'}>
                {permission === 'granted' ? 'Allowed' : permission === 'denied' ? 'Blocked' : 'Not Set'}
              </Badge>
            </div>
            
            {permission === 'default' && (
              <Button onClick={requestPermission} className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </Button>
            )}
            
            {permission === 'granted' && (
              <div className="space-y-2">
                <Button onClick={sendTestNotification} variant="outline" size="sm">
                  Send Test Notification
                </Button>
                <p className="text-xs text-muted-foreground">
                  Notifications are enabled. You'll receive order updates and other important alerts.
                </p>
              </div>
            )}
            
            {permission === 'denied' && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  Notifications are blocked. To enable them, click the notification icon in your browser's address bar.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose what types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Order Updates</div>
                <div className="text-sm text-muted-foreground">
                  Confirmation, preparation, and ready notifications
                </div>
              </div>
              <Switch
                checked={settings.orderUpdates}
                onCheckedChange={(value) => updateSetting('orderUpdates', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Table Ready</div>
                <div className="text-sm text-muted-foreground">
                  When your table is ready for seating
                </div>
              </div>
              <Switch
                checked={settings.tableReady}
                onCheckedChange={(value) => updateSetting('tableReady', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Promotions</div>
                <div className="text-sm text-muted-foreground">
                  Happy hours, daily specials, and discounts
                </div>
              </div>
              <Switch
                checked={settings.promotions}
                onCheckedChange={(value) => updateSetting('promotions', value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Special Offers</div>
                <div className="text-sm text-muted-foreground">
                  Exclusive deals and member-only offers
                </div>
              </div>
              <Switch
                checked={settings.specialOffers}
                onCheckedChange={(value) => updateSetting('specialOffers', value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Recent Notifications
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Your latest notification history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 opacity-30" />
                <p className="mt-2">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-blue-900' : ''}`}>
                          {notification.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.body}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PushNotificationManager;
