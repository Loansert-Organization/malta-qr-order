
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ArrowLeft, 
  Download, 
  Share2, 
  Clock,
  MapPin,
  Receipt,
  Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'react-hot-toast';

interface OrderDetails {
  id: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  estimated_ready_time?: string;
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
}

const PaymentSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const paymentIntent = searchParams.get('payment_intent');
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
      // Send confirmation notifications
      sendConfirmationNotifications();
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
            menu_items(name, description)
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      const transformedOrder: OrderDetails = {
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
      console.error('Error fetching order details:', error);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const sendConfirmationNotifications = async () => {
    try {
      // Log payment success in analytics_events instead of payment_logs
      await supabase.from('analytics_events').insert({
        event_name: 'payment_success',
        properties: {
          order_id: orderId,
          payment_intent_id: paymentIntent,
          session_id: sessionId,
          amount: order?.total_amount
        }
      });

      // Trigger vendor notification using existing edge function
      await supabase.functions.invoke('vendor-analytics', {
        body: {
          orderId,
          type: 'new_order',
          channel: 'vendor'
        }
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const handleDownloadReceipt = async () => {
    try {
      // Generate a simple receipt download
      const receiptData = {
        order_id: orderId,
        business_name: order?.vendor.business_name,
        total_amount: order?.total_amount,
        date: new Date().toLocaleDateString(),
        items: order?.order_items
      };

      const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${orderId}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Failed to download receipt');
    }
  };

  const handleShareOrder = async (method: string) => {
    const shareText = `I just ordered from ${order?.vendor.business_name}! Order #${order?.id.slice(-8)}`;
    const shareUrl = `${window.location.origin}/order/${orderId}`;

    switch (method) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} - ${shareUrl}`)}`);
        break;
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Order Confirmation',
              text: shareText,
              url: shareUrl
            });
          } catch (error) {
            console.log('Share cancelled');
          }
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast.success('Order link copied to clipboard');
        break;
    }
    setShowShareOptions(false);
  };

  const handleRateExperience = () => {
    navigate(`/rate-order/${orderId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to find your order details.</p>
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
              <span>Back to Home</span>
            </Button>
            <h1 className="font-semibold">Order Confirmed</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Success Message */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h2>
              <p className="text-green-700 mb-4">
                Your order has been confirmed and sent to {order.vendor.business_name}
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-green-600">
                <span>Order #{order.id.slice(-8).toUpperCase()}</span>
                <Badge className="bg-green-100 text-green-800">
                  €{order.total_amount.toFixed(2)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Order Confirmed</p>
                <p className="text-sm text-gray-600">Payment received and order sent to restaurant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Preparation Started</p>
                <p className="text-sm text-gray-600">
                  Your order is being prepared
                  {order.estimated_ready_time && (
                    <span className="text-blue-600 font-medium">
                      {' '}• Ready by {new Date(order.estimated_ready_time).toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-400">Ready for Pickup</p>
                <p className="text-sm text-gray-400">We'll notify you when your order is ready</p>
              </div>
            </div>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`tel:${order.vendor.phone_number}`, '_self')}
                className="w-full"
              >
                Call Restaurant
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate(`/order/${orderId}`)}
            className="flex items-center justify-center space-x-2"
          >
            <Clock className="h-4 w-4" />
            <span>Track Order</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleDownloadReceipt}
            className="flex items-center justify-center space-x-2"
          >
            <Receipt className="h-4 w-4" />
            <span>Receipt</span>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => setShowShareOptions(!showShareOptions)}
            className="flex items-center justify-center space-x-2"
          >
            <Share2 className="h-4 w-4" />
            <span>Share</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleRateExperience}
            className="flex items-center justify-center space-x-2"
          >
            <Star className="h-4 w-4" />
            <span>Rate</span>
          </Button>
        </div>

        {/* Share Options */}
        {showShareOptions && (
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  onClick={() => handleShareOrder('whatsapp')}
                  className="w-full justify-start"
                >
                  Share on WhatsApp
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => handleShareOrder('copy')}
                  className="w-full justify-start"
                >
                  Copy Link
                </Button>
                {navigator.share && (
                  <Button
                    variant="ghost"
                    onClick={() => handleShareOrder('native')}
                    className="w-full justify-start"
                  >
                    Share...
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Shopping */}
        <div className="text-center pt-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="text-blue-600"
          >
            Continue Browsing
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
