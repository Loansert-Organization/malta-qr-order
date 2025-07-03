import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Package, Home, Phone, MapPin, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface OrderItem {
  item_id: string;
  item_name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  bar_id: string;
  items: OrderItem[];
  total_price: number;
  customer_phone?: string;
  payment_status: string;
  status: string;
  currency: string;
  order_notes?: string;
  created_at: string;
  updated_at: string;
}

interface Bar {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
  logo_url?: string;
}

const OrderStatus = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      // Subscribe to real-time updates
      const subscription = subscribeToOrderUpdates();
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      setOrder(orderData);

      // Fetch bar details
      if (orderData?.bar_id) {
        const { data: barData, error: barError } = await supabase
          .from('bars')
          .select('*')
          .eq('id', orderData.bar_id)
          .single();

        if (!barError && barData) {
          setBar(barData);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToOrderUpdates = () => {
    if (!orderId) return;

    return supabase
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
          setOrder(payload.new as Order);
          
          // Show toast for status changes
          if (payload.new.status !== payload.old.status) {
            toast({
              title: "Order Updated",
              description: `Your order is now ${payload.new.status}`,
            });
          }
        }
      )
      .subscribe();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'confirmed':
        return <Package className="h-5 w-5" />;
      case 'preparing':
        return <Package className="h-5 w-5 animate-pulse" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => navigate('/')}>
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  const currency = order.currency === 'RWF' ? 'RWF' : '€';
  const isRwanda = currency === 'RWF';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Order Status</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Success Animation */}
        {order.payment_status === 'confirmed' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-green-800 mb-2">Order Confirmed!</h2>
                  <p className="text-green-700">Your order has been received and is being prepared</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Order Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Order #{order.id.slice(0, 8).toUpperCase()}</CardTitle>
              <div className="flex gap-2">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{order.status}</span>
                </Badge>
                <Badge className={getPaymentStatusColor(order.payment_status)}>
                  Payment {order.payment_status}
                </Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </CardHeader>
          <CardContent>
            {/* Bar Info */}
            {bar && (
              <div className="mb-6">
                <div className="flex items-start gap-4">
                  {bar.logo_url && (
                    <img
                      src={bar.logo_url}
                      alt={bar.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{bar.name}</h3>
                    {bar.address && (
                      <p className="text-sm text-gray-600 flex items-start gap-1 mt-1">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        {bar.address}
                      </p>
                    )}
                    {bar.contact_number && (
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Phone className="h-4 w-4" />
                        {bar.contact_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <Separator className="mb-6" />

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold mb-3">Order Items</h4>
              {order.items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex justify-between items-center py-2"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {currency} {item.price.toFixed(isRwanda ? 0 : 2)}
                    </p>
                  </div>
                  <span className="font-medium">
                    {currency} {item.subtotal.toFixed(isRwanda ? 0 : 2)}
                  </span>
                </motion.div>
              ))}
            </div>

            <Separator className="mb-4" />

            {/* Total */}
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>{currency} {order.total_price.toFixed(isRwanda ? 0 : 2)}</span>
            </div>

            {/* Order Notes */}
            {order.order_notes && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-2">Order Notes</h4>
                  <p className="text-sm text-gray-600">{order.order_notes}</p>
                </div>
              </>
            )}

            {/* Customer Info */}
            {order.customer_phone && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-2">Contact</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {order.customer_phone}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['pending', 'confirmed', 'preparing', 'ready'].map((status, index) => {
                const isActive = order.status === status;
                const isPast = ['pending', 'confirmed', 'preparing', 'ready'].indexOf(order.status) > index;
                
                return (
                  <motion.div
                    key={status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 ${!isActive && !isPast ? 'opacity-50' : ''}`}
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      isActive || isPast ? 'bg-primary text-white' : 'bg-gray-200'
                    }`}>
                      {isPast ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-semibold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium capitalize ${isActive ? 'text-primary' : ''}`}>
                        {status.replace('_', ' ')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {status === 'pending' && 'Order received'}
                        {status === 'confirmed' && 'Payment confirmed'}
                        {status === 'preparing' && 'Your order is being prepared'}
                        {status === 'ready' && 'Your order is ready!'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          {bar && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/menu/${bar.id}`)}
            >
              Order Again
            </Button>
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus; 