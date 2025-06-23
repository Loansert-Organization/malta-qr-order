
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, ChefHat, Bell, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OrderDetails {
  id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  created_at: string;
  customer_name?: string;
  vendors: {
    name: string;
    location?: string;
  };
  order_items: Array<{
    quantity: number;
    menu_items: {
      name: string;
      price: number;
    };
  }>;
}

interface RealTimeOrderTrackerProps {
  orderId: string;
  guestSessionId: string;
  onClose?: () => void;
}

const RealTimeOrderTracker: React.FC<RealTimeOrderTrackerProps> = ({
  orderId,
  guestSessionId,
  onClose
}) => {
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchOrderDetails();
    
    // Set up real-time subscription for order updates
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          fetchOrderDetails();
          
          // Show notification for status changes
          if (payload.new.status !== payload.old.status) {
            toast({
              title: "Order Status Updated",
              description: `Your order is now ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendors (name, location),
          order_items (
            quantity,
            menu_items (name, price)
          )
        `)
        .eq('id', orderId)
        .eq('guest_session_id', guestSessionId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrderDetails();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Order Received',
          description: 'Your order has been received and is being reviewed',
          progress: 25,
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'confirmed':
        return {
          label: 'Order Confirmed',
          description: 'Your order has been confirmed and will be prepared soon',
          progress: 50,
          icon: CheckCircle,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'preparing':
        return {
          label: 'Preparing Your Order',
          description: 'Your order is being prepared with care',
          progress: 75,
          icon: ChefHat,
          color: 'bg-orange-100 text-orange-800'
        };
      case 'ready':
        return {
          label: 'Ready for Pickup',
          description: 'Your order is ready! Please come to collect it',
          progress: 90,
          icon: Bell,
          color: 'bg-green-100 text-green-800'
        };
      case 'completed':
        return {
          label: 'Order Completed',
          description: 'Thank you for your order! We hope you enjoyed it',
          progress: 100,
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800'
        };
      default:
        return {
          label: 'Unknown Status',
          description: 'Please contact the restaurant for updates',
          progress: 0,
          icon: Clock,
          color: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const getEstimatedTime = () => {
    if (!order) return null;
    
    if (order.actual_ready_time) {
      return `Completed at ${new Date(order.actual_ready_time).toLocaleTimeString()}`;
    }
    
    if (order.estimated_ready_time) {
      return `Estimated ready: ${new Date(order.estimated_ready_time).toLocaleTimeString()}`;
    }
    
    // Calculate estimated time based on status and order time
    const orderTime = new Date(order.created_at);
    const now = new Date();
    const elapsed = (now.getTime() - orderTime.getTime()) / 1000 / 60; // minutes
    
    switch (order.status) {
      case 'pending':
        return `Estimated ready in ${Math.max(15 - Math.floor(elapsed), 5)} minutes`;
      case 'confirmed':
        return `Estimated ready in ${Math.max(12 - Math.floor(elapsed), 3)} minutes`;
      case 'preparing':
        return `Estimated ready in ${Math.max(8 - Math.floor(elapsed), 2)} minutes`;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Order not found</p>
          {onClose && (
            <Button onClick={onClose} className="mt-4">
              Go Back
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6 w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <StatusIcon className="h-5 w-5 mr-2" />
              Order Tracking
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Badge className={statusInfo.color} variant="secondary">
              {statusInfo.label}
            </Badge>
            <p className="text-sm text-gray-600 mt-2">
              {statusInfo.description}
            </p>
          </div>

          <Progress value={statusInfo.progress} className="w-full" />

          {getEstimatedTime() && (
            <div className="text-center text-sm text-gray-600">
              <Clock className="h-4 w-4 inline mr-1" />
              {getEstimatedTime()}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Order #{order.id.slice(-8)}</span>
              <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'}>
                {order.payment_status}
              </Badge>
            </div>
            
            <div className="text-sm text-gray-600 mb-3">
              {order.vendors.name} • {new Date(order.created_at).toLocaleString()}
            </div>

            <div className="space-y-2">
              {order.order_items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menu_items?.name}</span>
                  <span>€{((item.menu_items?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t mt-2 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>€{order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {order.status === 'ready' && (
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <Bell className="h-5 w-5 inline text-green-600 mr-2" />
              <span className="text-green-800 font-medium">
                Your order is ready for pickup!
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeOrderTracker;
