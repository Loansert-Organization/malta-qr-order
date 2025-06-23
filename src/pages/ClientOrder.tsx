import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Clock, 
  MapPin, 
  Phone, 
  CheckCircle, 
  ArrowLeft,
  MessageCircle,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  created_at: string;
  estimated_ready_time: string;
  customer_name: string;
  customer_phone: string;
  table_identifier: string;
  vendor: {
    business_name: string;
    location: string;
    phone_number: string;
  };
  order_items: Array<{
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    menu_items: {
      name: string;
      description: string;
    };
  }>;
}

const ClientOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      setupRealtimeSubscription();
    }
  }, [orderId]);

  useEffect(() => {
    if (order) {
      calculateProgress();
    }
  }, [order?.status]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendors!inner(business_name, location, phone_number),
          order_items(
            *,
            menu_items(name, description)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      // Transform the data to match our Order interface
      const transformedOrder: Order = {
        ...data,
        vendor: {
          business_name: data.vendors.business_name,
          location: data.vendors.location,
          phone_number: data.vendors.phone_number
        }
      };
      
      setOrder(transformedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
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
          setOrder(prev => prev ? { ...prev, ...payload.new } : null);
          toast.success(`Order status updated: ${payload.new.status}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const calculateProgress = () => {
    if (!order) return;
    
    const statusProgress = {
      'pending': 10,
      'confirmed': 25,
      'preparing': 50,
      'ready': 75,
      'completed': 100,
      'cancelled': 0
    };
    
    setProgress(statusProgress[order.status as keyof typeof statusProgress] || 0);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-orange-100 text-orange-800',
      'ready': 'bg-green-100 text-green-800',
      'completed': 'bg-gray-100 text-gray-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTimeRemaining = () => {
    if (!order?.estimated_ready_time) return null;
    
    const now = new Date();
    const readyTime = new Date(order.estimated_ready_time);
    const diffMs = readyTime.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    
    if (diffMins === 0) return 'Ready now!';
    if (diffMins < 60) return `${diffMins} minutes`;
    
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    return `${hours}h ${minutes}m`;
  };

  const handleContactVendor = () => {
    if (order?.vendor?.phone_number) {
      window.open(`tel:${order.vendor.phone_number}`, '_self');
    }
  };

  const handleRateOrder = () => {
    toast.success('Rating feature coming soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="font-semibold">Order Tracking</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id.slice(-8)}</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            {order.estimated_ready_time && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>Ready in: {getTimeRemaining()}</span>
              </div>
            )}
            
            {order.table_identifier && (
              <div className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>Table: {order.table_identifier}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle>{order.vendor.business_name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{order.vendor.location}</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleContactVendor}
              className="w-full flex items-center space-x-2"
            >
              <Phone className="h-4 w-4" />
              <span>Contact Restaurant</span>
            </Button>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_items.map((item, index) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.menu_items.name}</h4>
                    {item.menu_items.description && (
                      <p className="text-sm text-gray-600">{item.menu_items.description}</p>
                    )}
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{item.total_price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">€{item.unit_price.toFixed(2)} each</p>
                  </div>
                </div>
                {index < order.order_items.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center font-semibold">
              <span>Total</span>
              <span>€{order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {order.status === 'completed' && (
          <div className="space-y-3">
            <Button
              onClick={handleRateOrder}
              className="w-full flex items-center space-x-2"
            >
              <Star className="h-4 w-4" />
              <span>Rate Your Experience</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Leave Feedback</span>
            </Button>
          </div>
        )}

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Order Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="text-sm">
                  <p className="font-medium">Order Placed</p>
                  <p className="text-gray-500">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {order.status !== 'pending' && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-sm">
                    <p className="font-medium">Order Confirmed</p>
                    <p className="text-gray-500">Restaurant accepted your order</p>
                  </div>
                </div>
              )}
              
              {['preparing', 'ready', 'completed'].includes(order.status) && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-sm">
                    <p className="font-medium">Preparing</p>
                    <p className="text-gray-500">Your order is being prepared</p>
                  </div>
                </div>
              )}
              
              {['ready', 'completed'].includes(order.status) && (
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="text-sm">
                    <p className="font-medium">Ready for Pickup</p>
                    <p className="text-gray-500">Your order is ready!</p>
                  </div>
                </div>
              )}
              
              {order.status === 'completed' && (
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <div className="text-sm">
                    <p className="font-medium">Order Completed</p>
                    <p className="text-gray-500">Thank you for your order!</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClientOrder;
