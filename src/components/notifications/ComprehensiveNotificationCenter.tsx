// ✨ Comprehensive Notification Center with Real-time Updates
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Bell, 
  Check, 
  Clock, 
  ShoppingCart, 
  Star, 
  Gift,
  Volume2,
  VolumeX,
  Settings,
  Trash2,
  MarkAsUnread,
  Filter,
  X,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationMetadata {
  orderId?: string;
  barId?: string;
  itemId?: string;
  action?: string;
  timestamp?: string;
  priority?: 'low' | 'medium' | 'high';
  category?: 'order' | 'payment' | 'system' | 'promo';
}

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'promo' | 'system' | 'payment';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
  read: boolean;
  metadata?: NotificationMetadata;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_until: string;
  image_url?: string;
}

interface OrderUpdate {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'closed';
  total_local: number;
  currency: string;
  table_number?: string;
  created_at: string;
  updated_at: string;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  orderUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface ComprehensiveNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  promotions?: Promotion[];        // from CarouselPromo
  orderUpdates?: OrderUpdate[];    // Supabase realtime channel 'orders'
}

const ComprehensiveNotificationCenter: React.FC<ComprehensiveNotificationCenterProps> = ({
  isOpen,
  onClose,
  userId,
  promotions = [],
  orderUpdates = []
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: true,
    sound: true,
    vibration: true,
    orderUpdates: true,
    promotions: false,
    systemAlerts: true,
    emailNotifications: true,
    pushNotifications: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Mark notifications as seen when drawer opens
  useEffect(() => {
    if (isOpen) {
      markAllAsSeen();
      loadNotifications();
      loadSettings();
      setupRealtimeSubscription();
      requestNotificationPermission();
      // Focus the modal for accessibility
      modalRef.current?.focus();
    }
  }, [isOpen, userId]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Tab') {
        // Allow default tab behavior for cycling through elements
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Transform promotions into notifications
  useEffect(() => {
    if (promotions.length > 0 && settings.promotions) {
      const promoNotifications: Notification[] = promotions.map(promo => ({
        id: `promo-${promo.id}`,
        title: `🎉 ${promo.title}`,
        message: promo.description,
        type: 'promo',
        timestamp: new Date(),
        read: false,
        metadata: { 
          promotionId: promo.id,
          discount: promo.discount_percentage || promo.discount_amount,
          validUntil: promo.valid_until
        },
        soundEnabled: false
      }));

      setNotifications(prev => {
        // Remove existing promo notifications and add new ones
        const withoutPromos = prev.filter(n => !n.id.startsWith('promo-'));
        return [...promoNotifications, ...withoutPromos];
      });
    }
  }, [promotions, settings.promotions]);

  // Transform order updates into notifications
  useEffect(() => {
    if (orderUpdates.length > 0 && settings.orderUpdates) {
      const orderNotifications: Notification[] = orderUpdates.map(order => {
        const statusMessages = {
          pending: `Order #${order.id.slice(-4)} received and pending confirmation`,
          confirmed: `Order #${order.id.slice(-4)} confirmed! Preparation starting`,
          preparing: `Your order is being prepared with care 👨‍🍳`,
          ready: `🔔 Order #${order.id.slice(-4)} is ready for pickup!`,
          served: `Order #${order.id.slice(-4)} served. Enjoy your meal! 🍽️`,
          closed: `Order #${order.id.slice(-4)} completed. Thank you!`
        };

        const priorities = {
          pending: 'low' as const,
          confirmed: 'medium' as const,
          preparing: 'medium' as const,
          ready: 'high' as const,
          served: 'low' as const,
          closed: 'low' as const
        };

        return {
          id: `order-${order.id}`,
          title: 'Order Update',
          message: statusMessages[order.status],
          type: 'order',
          timestamp: new Date(order.updated_at),
          read: false,
          metadata: {
            orderId: order.id,
            status: order.status,
            total: order.total_local,
            currency: order.currency,
            table: order.table_number
          },
          soundEnabled: order.status === 'ready'
        };
      });

      setNotifications(prev => {
        // Remove existing order notifications and add new ones
        const withoutOrders = prev.filter(n => !n.id.startsWith('order-'));
        return [...orderNotifications, ...withoutOrders];
      });
    }
  }, [orderUpdates, settings.orderUpdates]);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Try to fetch real notifications from Supabase
      const { data: realNotifications, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn('Error loading from database, using fallback data:', error);
        // Fall back to enhanced mock data if database isn't ready
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Welcome to ICUPA! 🎉',
            message: 'Your notification center is ready. Order updates and promotions will appear here.',
            type: 'system',
            timestamp: new Date(Date.now() - 5 * 60 * 1000),
            read: false,
            metadata: { setupStatus: 'complete' }
          }
        ];
        setNotifications(prev => [...mockNotifications, ...prev]);
      } else {
        // Transform database notifications to component format
        const transformedNotifications: Notification[] = realNotifications.map(dbNotif => ({
          id: dbNotif.id,
          title: dbNotif.title,
          message: dbNotif.body,
          type: dbNotif.type as NotificationType,
          timestamp: new Date(dbNotif.created_at),
          read: dbNotif.read_at ? true : false,
          metadata: dbNotif.metadata || {}
        }));

        setNotifications(prev => [...transformedNotifications, ...prev]);
        console.log(`✅ Loaded ${transformedNotifications.length} notifications from database`);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast({
        title: "Connection Issue",
        description: "Unable to load notifications. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  };

  const saveSettings = (newSettings: NotificationSettings) => {
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
  };

  const setupRealtimeSubscription = () => {
    const sessionId = localStorage.getItem('icupa_session_id');
    if (!sessionId) return;

    // Subscribe to orders for the current session
    const orderSubscription = supabase
      .channel('order_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
        filter: `session_id=eq.${sessionId}`
      }, (payload) => {
        handleOrderUpdate(payload);
      })
      .subscribe();

    return () => {
      orderSubscription.unsubscribe();
    };
  };

  const handleOrderUpdate = (payload: any) => {
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const order = payload.new as OrderUpdate;
      
      const orderNotification: Notification = {
        id: `realtime-order-${order.id}`,
        title: 'Order Update',
        message: `Your order status: ${order.status}`,
        type: 'order',
        timestamp: new Date(),
        read: false,
        metadata: { orderId: order.id, status: order.status },
        soundEnabled: order.status === 'ready'
      };

      setNotifications(prev => [orderNotification, ...prev]);
      setUnseenCount(prev => prev + 1);

      // Play sound and vibrate for new notifications
      if (settings.sound && orderNotification.soundEnabled && audioRef.current) {
        audioRef.current.play().catch(console.error);
      }

      if (settings.vibration && navigator.vibrate && order.status === 'ready') {
        navigator.vibrate([200, 100, 200]);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive real-time order updates!",
        });
      }
    }
  };

  const markAllAsSeen = () => {
    setUnseenCount(0);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAsUnread = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: false } : notif
      )
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'unread' && notif.read) return false;
    if (filter !== 'all' && notif.type !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (notification: Notification) => {
    if (notification.metadata?.icon) return notification.metadata.icon;
    
    switch (notification.type) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-600" />;
      case 'promo':
        return <Gift className="h-5 w-5 text-green-600" />;
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'system':
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950';
      case 'high':
        return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950';
      case 'medium':
        return 'border-l-blue-500 bg-blue-50 dark:bg-blue-950';
      default:
        return 'border-l-gray-300 bg-gray-50 dark:bg-gray-800';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return timestamp.toLocaleDateString();
  };

  const updateSettings = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Audio element for notification sounds */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/notification.mp3" type="audio/mpeg" />
        <source src="/sounds/notification.ogg" type="audio/ogg" />
      </audio>

      {/* Notification Center Modal */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden focus:outline-none"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-center-title"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6" />
                <div>
                  <h2 id="notification-center-title" className="text-xl font-bold">
                    Notifications
                  </h2>
                  <p className="text-orange-100 text-sm">
                    {unreadCount} unread • {notifications.length} total
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-white hover:bg-white/20"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20"
                  aria-label="Close notification center"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread" className="relative">
                  Unread
                  {unreadCount > 0 && (
                    <Badge className="ml-2 bg-orange-500 text-white text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`border-l-4 rounded-lg p-4 ${getPriorityColor(notification.metadata?.priority || 'medium')}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {notification.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                                {notification.read && (
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                )}
                              </div>
                              
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                <div className="flex items-center space-x-2">
                                  {notification.metadata?.orderId && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => window.location.href = `/orders/${notification.metadata.orderId}`}
                                    >
                                      View Order
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => 
                                      notification.read 
                                        ? markAsUnread(notification.id)
                                        : markAsRead(notification.id)
                                    }
                                    className="text-xs"
                                  >
                                    {notification.read ? (
                                      <MarkAsUnread className="h-3 w-3" />
                                    ) : (
                                      <Check className="h-3 w-3" />
                                    )}
                                  </Button>
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteNotification(notification.id)}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No notifications
                      </h3>
                      <p className="text-gray-500">
                        {activeTab === 'unread' 
                          ? "All caught up! No unread notifications."
                          : "You'll see order updates and promotions here."}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="unread" className="mt-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {filteredNotifications.map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`border-l-4 rounded-lg p-4 ${getPriorityColor(notification.metadata?.priority || 'medium')}`}
                      >
                        {/* Same content as "all" tab */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon(notification)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {notification.title}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {notification.type}
                                </Badge>
                                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              </div>
                              
                              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                <div className="flex items-center space-x-2">
                                  {notification.metadata?.orderId && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => window.location.href = `/orders/${notification.metadata.orderId}`}
                                    >
                                      View Order
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {filteredNotifications.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        All caught up!
                      </h3>
                      <p className="text-gray-500">
                        No unread notifications. Great job staying on top of things!
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">General Settings</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Enable Notifications</label>
                            <p className="text-xs text-gray-500">Turn all notifications on/off</p>
                          </div>
                          <Switch
                            checked={settings.enabled}
                            onCheckedChange={(checked) => updateSettings('enabled', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Sound Alerts</label>
                            <p className="text-xs text-gray-500">Play sound for important notifications</p>
                          </div>
                          <Switch
                            checked={settings.sound}
                            onCheckedChange={(checked) => updateSettings('sound', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Vibration</label>
                            <p className="text-xs text-gray-500">Vibrate for high priority alerts</p>
                          </div>
                          <Switch
                            checked={settings.vibration}
                            onCheckedChange={(checked) => updateSettings('vibration', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Notification Types</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Order Updates</label>
                            <p className="text-xs text-gray-500">Status changes for your orders</p>
                          </div>
                          <Switch
                            checked={settings.orderUpdates}
                            onCheckedChange={(checked) => updateSettings('orderUpdates', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">Promotions</label>
                            <p className="text-xs text-gray-500">Special offers and deals</p>
                          </div>
                          <Switch
                            checked={settings.promotions}
                            onCheckedChange={(checked) => updateSettings('promotions', checked)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-medium">System Alerts</label>
                            <p className="text-xs text-gray-500">Important system messages</p>
                          </div>
                          <Switch
                            checked={settings.systemAlerts}
                            onCheckedChange={(checked) => updateSettings('systemAlerts', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const testNotification: Notification = {
                          id: Date.now().toString(),
                          title: 'Test Notification 🧪',
                          message: 'This is a test to check your notification settings',
                          type: 'system',
                          timestamp: new Date(),
                          read: false,
                          metadata: {}
                        };
                        
                        setNotifications(prev => [testNotification, ...prev]);
                        
                        if (settings.sound && audioRef.current) {
                          audioRef.current.play().catch(console.error);
                        }

                        if (settings.vibration && navigator.vibrate) {
                          navigator.vibrate([200, 100, 200]);
                        }
                        
                        toast({
                          title: "Test Notification Sent",
                          description: "Check the 'All' tab to see your test notification"
                        });
                      }}
                      className="w-full"
                    >
                      Send Test Notification
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </>
  );
};

// Export the unseen count for the bell badge
export const useNotificationBadge = (notifications: Notification[]) => {
  const [unseenCount, setUnseenCount] = useState(0);
  
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setUnseenCount(unreadCount);
  }, [notifications]);
  
  return unseenCount;
};

export default ComprehensiveNotificationCenter; 