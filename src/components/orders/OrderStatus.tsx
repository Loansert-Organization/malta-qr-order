
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, ChefHat, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { OrderStatus as OrderStatusType } from '@/lib/constants';
import { withErrorBoundary } from '@/components/ErrorBoundary';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  status: OrderStatusType;
  total_amount: number;
  estimated_time?: number;
  items: OrderItem[];
  created_at: string;
}

interface OrderStatusProps {
  orderId: string;
  guestSessionId: string;
}

const OrderStatusComponent: React.FC<OrderStatusProps> = ({ orderId, guestSessionId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('order-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          // Transform the payload to match our Order interface
          const updatedOrder: Order = {
            ...payload.new as any,
            status: (payload.new.status as OrderStatusType) || 'pending',
            items: payload.new.items || []
          };
          setOrder(updatedOrder);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      // Fetch order with items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menu_items (name)
          )
        `)
        .eq('id', orderId)
        .eq('guest_session_id', guestSessionId)
        .single();

      if (orderError) throw orderError;

      // Transform the data to match our Order interface
      const transformedOrder: Order = {
        ...orderData,
        status: (orderData.status as OrderStatusType) || 'pending',
        items: orderData.order_items?.map((item: any) => ({
          name: item.menu_items?.name || 'Unknown Item',
          quantity: item.quantity,
          price: item.unit_price
        })) || []
      };

      setOrder(transformedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: OrderStatusType) => {
    switch (status) {
      case 'pending':
        return { 
          label: 'Order Received', 
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          progress: 25
        };
      case 'confirmed':
        return { 
          label: 'Order Confirmed', 
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle,
          progress: 50
        };
      case 'preparing':
        return { 
          label: 'Preparing', 
          color: 'bg-orange-100 text-orange-800',
          icon: ChefHat,
          progress: 75
        };
      case 'ready':
        return { 
          label: 'Ready for Pickup', 
          color: 'bg-green-100 text-green-800',
          icon: Truck,
          progress: 90
        };
      case 'completed':
        return { 
          label: 'Completed', 
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          progress: 100
        };
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          color: 'bg-red-100 text-red-800',
          icon: CheckCircle,
          progress: 0
        };
      default:
        return { 
          label: 'Unknown', 
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          progress: 0
        };
    }
  };

  if (loading) {
    return (
      <Card>
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
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">Order not found</p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <StatusIcon className="h-5 w-5 mr-2" />
            Order Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge className={statusInfo.color}>
              {statusInfo.label}
            </Badge>
            <span className="text-sm text-gray-600">
              Order #{order.id.slice(-8)}
            </span>
          </div>

          <Progress value={statusInfo.progress} className="w-full" />

          {order.estimated_time && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Estimated time: {order.estimated_time} minutes</span>
            </div>
          )}

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Order Details</h4>
            <div className="space-y-2">
              {order.items?.map((item: OrderItem, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.name}</span>
                  <span>€{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t mt-2 pt-2 flex justify-between font-medium">
              <span>Total</span>
              <span>€{order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Ordered at {new Date(order.created_at).toLocaleTimeString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withErrorBoundary(OrderStatusComponent, 'OrderStatus');
