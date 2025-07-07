import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  Clock,
  DollarSign,
  CheckCircle,
  Loader2,
  Truck,
  XCircle
} from 'lucide-react';

interface Order {
  id: string;
  bar_id: string;
  items: any[];
  total_amount: number;
  payment_status: string;
  order_status: string;
  user_phone?: string;
  created_at: string;
  currency: string;
  delivery_address?: string;
}

const statusSteps: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: 'confirmed', label: 'Confirmed', icon: <CheckCircle className="h-4 w-4" /> },
  { id: 'preparing', label: 'Preparing', icon: <Loader2 className="h-4 w-4" /> },
  { id: 'ready', label: 'Ready for Pickup', icon: <Truck className="h-4 w-4" /> },
  { id: 'delivered', label: 'Delivered', icon: <CheckCircle className="h-4 w-4" /> },
  { id: 'cancelled', label: 'Cancelled', icon: <XCircle className="h-4 w-4" /> }
];

const VendorOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      if (error) throw error;
      setOrder(data as any);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({ title: 'Error', description: 'Failed to load order', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: status })
        .eq('id', order.id);
      if (error) throw error;
      toast({ title: 'Success', description: `Order marked as ${status}` });
      setOrder({ ...order, order_status: status });
    } catch (error) {
      console.error('Update error', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-gray-200 text-gray-700';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <Badge className={getStatusColor(order.order_status)}>{order.order_status}</Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Status Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusSteps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    order.order_status === step.id ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="font-medium">{step.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.items.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span>{order.currency === 'RWF' ? 'RWF' : '€'} {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{order.currency === 'RWF' ? 'RWF' : '€'} {order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        {order.order_status !== 'cancelled' && order.order_status !== 'delivered' && (
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              {statusSteps.filter(s => ['preparing','ready','delivered','cancelled'].includes(s.id)).map(step => (
                <Button
                  key={step.id}
                  disabled={updating || order.order_status === step.id}
                  variant={step.id === 'cancelled' ? 'destructive' : 'default'}
                  onClick={() => updateStatus(step.id)}
                >
                  {updating && order.order_status !== step.id ? 'Updating...' : step.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Meta */}
        <div className="text-sm text-gray-500">
          Placed {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
};

export default VendorOrderDetail; 