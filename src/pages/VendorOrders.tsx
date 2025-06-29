import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Home, Clock, CheckCircle, XCircle, Phone, DollarSign } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Order {
  id: string;
  bar_id: string;
  items: any[];
  total_amount: number;
  payment_status: string;
  user_phone?: string;
  created_at: string;
  currency: string;
}

const VendorOrders = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [barId, setBarId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'confirm' | 'cancel'>('confirm');

  useEffect(() => {
    const storedBarId = localStorage.getItem('vendorBarId');
    if (!storedBarId) {
      navigate('/vendor');
      return;
    }
    setBarId(storedBarId);
  }, [navigate]);

  useEffect(() => {
    if (barId) {
      fetchOrders();
      
      // Set up real-time subscription
      const subscription = supabase
        .channel('vendor-orders-list')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `bar_id=eq.${barId}`
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [barId]);

  const fetchOrders = async () => {
    if (!barId) return;

    try {
      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('bar_id', barId)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderAction = (order: Order, action: 'confirm' | 'cancel') => {
    setSelectedOrder(order);
    setConfirmAction(action);
    setShowConfirmDialog(true);
  };

  const confirmOrderAction = async () => {
    if (!selectedOrder) return;

    try {
      const newStatus = confirmAction === 'confirm' ? 'confirmed' : 'cancelled';
      
      const { error: orderError } = await supabase
        .from('orders')
        .update({ payment_status: newStatus })
        .eq('id', selectedOrder.id);

      if (orderError) throw orderError;

      // Update payment status as well
      const { error: paymentError } = await supabase
        .from('payments')
        .update({ status: newStatus })
        .eq('order_id', selectedOrder.id);

      if (paymentError) throw paymentError;

      toast({
        title: "Success",
        description: `Order ${confirmAction === 'confirm' ? 'confirmed' : 'cancelled'} successfully`,
      });

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setShowConfirmDialog(false);
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/vendor')}
              >
                <Home className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Orders</h1>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Today: {orders.length} orders
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">No orders yet today</p>
              <p className="text-gray-400 mt-2">Orders will appear here as customers place them</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(order.created_at), 'HH:mm')}
                        </span>
                        {order.user_phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            {order.user_phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(order.payment_status)}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Order Items */}
                  <div className="space-y-2 mb-4">
                    {order.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x {item.name}</span>
                        <span className="text-gray-600">
                          {order.currency === 'RWF' ? 'RWF' : '€'} {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Total */}
                  <div className="border-t pt-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-gray-600" />
                      <span className="font-semibold text-lg">
                        Total: {order.currency === 'RWF' ? 'RWF' : '€'} {order.total_amount.toFixed(2)}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    {order.payment_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleOrderAction(order, 'confirm')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOrderAction(order, 'cancel')}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction === 'confirm' ? 'Confirm Order' : 'Cancel Order'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'confirm' 
                ? 'Are you sure you want to confirm this order? This will notify the customer that their order is being prepared.'
                : 'Are you sure you want to cancel this order? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep as is</AlertDialogCancel>
            <AlertDialogAction onClick={confirmOrderAction}>
              Yes, {confirmAction} order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VendorOrders; 