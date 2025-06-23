
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CreditCard,
  CheckCircle,
  AlertCircle,
  Phone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  menu_item: {
    name: string;
    description: string;
    image_url?: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  created_at: string;
  estimated_ready_time?: string;
  customer_name?: string;
  customer_phone?: string;
  table_identifier?: string;
  special_requests?: string;
  vendor: {
    business_name: string;
    location: string;
    phone_number?: string;
  };
  order_items: OrderItem[];
}

const OrderSummaryPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          vendors!inner(business_name, location, phone_number),
          order_items(
            *,
            menu_items(name, description, image_url)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      
      const transformedOrder: Order = {
        ...data,
        vendor: {
          business_name: data.vendors.business_name,
          location: data.vendors.location,
          phone_number: data.vendors.phone_number
        },
        order_items: data.order_items.map((item: any) => ({
          ...item,
          menu_item: item.menu_items
        }))
      };
      
      setOrder(transformedOrder);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'preparing':
        return <Clock className="h-5 w-5 text-orange-600" />;
      case 'ready':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order summary...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
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
              onClick={() => navigate('/')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
            <h1 className="font-semibold">Order Summary</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Order #{order.id.slice(-8).toUpperCase()}</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="text-sm font-medium capitalize">{order.status}</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Placed at:</span>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              {order.estimated_ready_time && (
                <div>
                  <span className="text-gray-600">Ready by:</span>
                  <p className="font-medium">
                    {new Date(order.estimated_ready_time).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Payment Status:</span>
              <Badge className={getPaymentStatusColor(order.payment_status)}>
                {order.payment_status}
              </Badge>
            </div>

            {order.payment_method && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <div className="flex items-center space-x-1">
                  <CreditCard className="h-4 w-4" />
                  <span className="text-sm font-medium capitalize">
                    {order.payment_method}
                  </span>
                </div>
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
            
            {order.vendor.phone_number && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>{order.vendor.phone_number}</span>
              </div>
            )}

            {order.table_identifier && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-blue-800">
                  Table: {order.table_identifier}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.order_items.map((item, index) => (
              <div key={item.id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {item.menu_item.image_url && (
                        <img
                          src={item.menu_item.image_url}
                          alt={item.menu_item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{item.menu_item.name}</h4>
                        {item.menu_item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.menu_item.description}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity} × €{item.unit_price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">€{item.total_price.toFixed(2)}</p>
                  </div>
                </div>
                {index < order.order_items.length - 1 && (
                  <Separator className="my-4" />
                )}
              </div>
            ))}
            
            <Separator className="my-4" />
            
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total</span>
              <span>€{order.total_amount.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Special Requests */}
        {order.special_requests && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{order.special_requests}</p>
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        {(order.customer_name || order.customer_phone) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {order.customer_name && (
                <div>
                  <span className="text-sm text-gray-600">Name: </span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
              )}
              {order.customer_phone && (
                <div>
                  <span className="text-sm text-gray-600">Phone: </span>
                  <span className="font-medium">{order.customer_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === 'confirmed' || order.status === 'preparing' ? (
            <Button
              onClick={() => navigate(`/order/${order.id}`)}
              className="w-full"
            >
              Track Order Status
            </Button>
          ) : null}
          
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="w-full"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
