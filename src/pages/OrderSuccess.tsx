import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Home, MessageCircle, Package, ChefHat } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

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
  status: string;
  currency: string;
  created_at: string;
}

interface Bar {
  id: string;
  name: string;
  address?: string;
  contact_number?: string;
}

const OrderSuccess = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [bar, setBar] = useState<Bar | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      // Trigger confetti animation
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
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

  const handleWhatsAppShare = () => {
    const whatsappLink = localStorage.getItem('pendingWhatsApp');
    if (whatsappLink) {
      window.open(whatsappLink, '_blank');
      localStorage.removeItem('pendingWhatsApp');
    } else if (bar?.contact_number) {
      // Generate WhatsApp link if not stored
      const orderSummary = encodeURIComponent(
        `🍽️ Order #${order?.id.slice(0, 8).toUpperCase()}\n` +
        `📍 ${bar.name}\n` +
        `━━━━━━━━━━━━━━━\n` +
        order?.items.map(item => `${item.quantity}x ${item.item_name}`).join('\n') +
        `\n━━━━━━━━━━━━━━━\n` +
        `💰 Total: ${order?.currency} ${order?.total_price.toFixed(order?.currency === 'RWF' ? 0 : 2)}`
      );
      const link = `https://wa.me/${bar.contact_number.replace(/\D/g, '')}?text=${orderSummary}`;
      window.open(link, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Message */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Placed!</h1>
          <p className="text-gray-600">Your order has been received</p>
          <p className="text-sm text-gray-500 mt-2">Order #{order.id.slice(0, 8).toUpperCase()}</p>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <CardTitle>{bar?.name}</CardTitle>
                    {bar?.address && (
                      <p className="text-sm text-gray-600">{bar.address}</p>
                    )}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <Package className="h-4 w-4 mr-1" />
                  Confirmed
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Order Items */}
              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × {currency} {item.price.toFixed(isRwanda ? 0 : 2)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {currency} {item.subtotal.toFixed(isRwanda ? 0 : 2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center text-lg font-bold pt-4 border-t">
                <span>Total</span>
                <span>{currency} {order.total_price.toFixed(isRwanda ? 0 : 2)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3"
        >
          {bar?.contact_number && (
            <Button
              className="w-full"
              size="lg"
              onClick={handleWhatsAppShare}
              variant="default"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Share on WhatsApp
            </Button>
          )}

          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => navigate(`/order-status/${order.id}`)}
          >
            <Package className="h-5 w-5 mr-2" />
            Track Order
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate(`/menu/${bar?.id}`)}
          >
            Order Again
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-600"
        >
          <p>You'll receive updates about your order status</p>
          {order.customer_phone && (
            <p>Contact number: {order.customer_phone}</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess; 