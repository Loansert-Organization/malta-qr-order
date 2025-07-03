import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, MapPin, Phone, Receipt } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface OrderDetails {
  id: string;
  bar_id: string;
  items: any[];
  total_amount: number;
  status: string;
  customer_name?: string;
  customer_phone?: string;
  table_number?: string;
  special_instructions?: string;
  created_at: string;
  bars: {
    name: string;
    address: string;
    contact_number: string;
  };
}

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      // Set up real-time subscription for order updates
      const subscription = supabase
        .channel(`order-${orderId}`)
        .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => {
            setOrder(prev => prev ? { ...prev, ...payload.new } : null);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          bars (name, address, contact_number)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Order not found</p>
          <Button onClick={() => navigate('/client')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-orange-500';
      case 'ready': return 'bg-green-500';
      case 'delivered': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5" />;
      case 'preparing': return <Clock className="h-5 w-5 animate-spin" />;
      case 'ready': return <CheckCircle className="h-5 w-5" />;
      case 'delivered': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex justify-center pt-8 pb-4"
      >
        <div className="bg-green-100 rounded-full p-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
      </motion.div>

      <div className="container mx-auto px-4 pb-8 max-w-2xl">
        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your order</p>
          <p className="text-sm text-gray-500 mt-2">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Order Status</span>
                <Badge className={`${getStatusColor(order.status)} text-white`}>
                  <span className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Estimated preparation time</p>
                  <p className="text-lg font-semibold">15-20 minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Restaurant Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{order.bars.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                <p className="text-sm">{order.bars.address}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <p className="text-sm">{order.bars.contact_number}</p>
              </div>
              {order.table_number && (
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-gray-500" />
                  <p className="text-sm">Table {order.table_number}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.quantity}x {item.name}</p>
                    </div>
                    <p className="font-medium">
                      {order.currency || 'RWF'} {(item.price * item.quantity).toFixed(0)}
                    </p>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{order.currency || 'RWF'} {order.total_amount.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Special Instructions */}
        {order.special_instructions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{order.special_instructions}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex gap-4"
        >
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/client')}
          >
            Back to Home
          </Button>
          <Button 
            className="flex-1"
            onClick={() => navigate(`/menu/${order.bar_id}`)}
          >
            Order Again
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage; 