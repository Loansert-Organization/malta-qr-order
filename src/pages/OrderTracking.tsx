import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  Utensils, 
  Package,
  MapPin,
  Phone,
  MessageCircle,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import toast from 'react-hot-toast';

interface OrderStatus {
  id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  estimated_ready_time?: string;
  actual_ready_time?: string;
  customer_name?: string;
  customer_phone?: string;
  vendor: {
    business_name: string;
    location: string;
    phone_number?: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    menu_item: {
      name: string;
      description?: string;
    };
  }>;
  status_history: Array<{
    status: string;
    changed_at: string;
    notes?: string;
  }>;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
      
      // Set up real-time updates
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
            console.log('Order updated:', payload);
            fetchOrderStatus();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [orderId]);

  const fetchOrderStatus = async () => {
    try {
      setRefreshing(true);
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendors!inner(business_name, location, phone_number),
          order_items(
            *,
            menu_items(name, description)
          ),
          order_status_history(status, changed_at, notes)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const transformedOrder: OrderStatus = {
        ...data,
        vendor: {
          business_name: data.vendors.business_name,
          location: data.vendors.location,
          phone_number: data.vendors.phone_number
        },
        order_items: data.order_items.map((item: any) => ({
          ...item,
          menu_item: item.menu_items
        })),
        status_history: data.order_status_history || []
      };

      setOrder(transformedOrder);
    } catch (error) {
      console.error('Error fetching order status:', error);
      toast.error('Failed to load order status');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'confirmed': return 50;
      case 'preparing': return 75;
      case 'ready': return 100;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'preparing': return <Utensils className="h-4 w-4" />;
      case 'ready': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCallRestaurant = () => {
    if (order?.vendor.phone_number) {
      window.open(`tel:${order.vendor.phone_number}`, '_self');
    }
  };

  const handleRateOrder = () => {
    navigate(`/rate-order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to find your order.</p>
          <Button onClick={() => navigate('/home')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/home')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <div className="text-center">
              <h1 className="font-semibold">Order Tracking</h1>
              <p className="text-sm text-gray-600">#{order.id.slice(-8).toUpperCase()}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchOrderStatus}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Current Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {getStatusIcon(order.status)}
              </div>
              <h2 className="text-xl font-bold mb-2">
                {order.status === 'pending' && 'Order Received'}
                {order.status === 'confirmed' && 'Order Confirmed'}
                {order.status === 'preparing' && 'Being Prepared'}
                {order.status === 'ready' && 'Ready for Pickup'}
                {order.status === 'completed' && 'Order Complete'}
              </h2>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{getStatusProgress(order.status)}%</span>
                </div>
                <Progress value={getStatusProgress(order.status)} className="h-2" />
              </div>

              {order.estimated_ready_time && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Estimated Ready Time</span>
                  </div>
                  <span className="text-sm text-blue-800">
                    {new Date(order.estimated_ready_time).toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>{order.vendor.business_name}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{order.vendor.location}</p>
            
            <div className="flex space-x-2">
              {order.vendor.phone_number && (
                <Button
                  onClick={handleCallRestaurant}
                  className="flex-1 flex items-center justify-center space-x-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>Call Restaurant</span>
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={() => toast('Chat feature coming soon!')}
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.menu_item.name}</h4>
                    {item.menu_item.description && (
                      <p className="text-sm text-gray-600">{item.menu_item.description}</p>
                    )}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-medium">€{(item.unit_price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>€{order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status History */}
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.status_history.sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()).map((status, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                       <CheckCircle className="h-2 w-2 text-white"/>
                    </div>
                    {index < order.status_history.length - 1 && (
                      <div className="w-px h-12 bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 pt-px">
                    <p className="font-medium capitalize">{status.status}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(status.changed_at).toLocaleString()}
                    </p>
                    {status.notes && (
                      <p className="text-xs text-gray-400 mt-1">{status.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {order.status === 'completed' && (
          <div className="space-y-3">
            <Button
              onClick={handleRateOrder}
              className="w-full flex items-center justify-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Rate Your Experience</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              Order Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
