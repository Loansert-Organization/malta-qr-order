import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, ShoppingCart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import RevolutPaymentButton from './RevolutPaymentButton';
import StripePaymentForm from './StripePaymentForm';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentFlowProps {
  cartItems: CartItem[];
  vendorId: string;
  guestSessionId: string;
  tableNumber?: string;
  onPaymentSuccess: (orderId: string) => void;
}

const PaymentFlow: React.FC<PaymentFlowProps> = ({
  cartItems,
  vendorId,
  guestSessionId,
  tableNumber,
  onPaymentSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'revolut'>('stripe');
  const [order, setOrder] = useState<any>(null);
  const [paymentStarted, setPaymentStarted] = useState(false);
  const { toast } = useToast();

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const createOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before ordering.",
        variant: "destructive"
      });
      return null;
    }

    setLoading(true);
    try {
      // Get vendor details for payment
      const { data: vendor } = await supabase
        .from('vendors')
        .select('name, business_name, revolut_payment_link')
        .eq('id', vendorId)
        .single();

      // Create order in database
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          vendor_id: vendorId,
          guest_session_id: guestSessionId,
          total_amount: getTotalPrice(),
          table_identifier: tableNumber,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending',
          agreed_to_terms: true,
          whatsapp_consent: false
        })
        .select()
        .single();

      if (orderError || !newOrder) {
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: newOrder.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      setOrder({ ...newOrder, vendor });
      return newOrder;
    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: "Failed to create order. Please try again.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const newOrder = await createOrder();
    if (!newOrder) return;

    setPaymentStarted(true);
  };

  const handlePaymentInitiated = () => {
    // Payment has been initiated, show status
    toast({
      title: "Payment Initiated",
      description: "Please complete your payment to confirm the order.",
    });
  };

  const handleStripeSuccess = () => {
    onPaymentSuccess(order.id);
  };

  if (paymentStarted && order) {
    return (
      <div className="space-y-6">
        {/* Order Created Confirmation */}
        <Card>
          <CardHeader>
            <CardTitle>Order #{order.id.slice(-8)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Your order has been created. Please complete payment to confirm.
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-bold">€{getTotalPrice().toFixed(2)}</span>
              </div>
              {tableNumber && (
                <div className="flex justify-between">
                  <span>Table:</span>
                  <span>{tableNumber}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Component based on method */}
        {paymentMethod === 'stripe' ? (
          <StripePaymentForm
            amount={getTotalPrice()}
            currency="eur"
            orderId={order.id}
            customerEmail={order.customer_email || 'guest@icupa.mt'}
            onSuccess={handleStripeSuccess}
          />
        ) : (
          <RevolutPaymentButton
            orderId={order.id}
            amount={getTotalPrice()}
            vendorRevolutLink={order.vendor?.revolut_payment_link}
            vendorName={order.vendor?.business_name || order.vendor?.name || 'Vendor'}
            orderReference={order.id.slice(-8)}
            customerName={order.customer_name}
            customerPhone={order.customer_phone}
            onPaymentInitiated={handlePaymentInitiated}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total ({getTotalItems()} items)</span>
            <span>€{getTotalPrice().toFixed(2)}</span>
          </div>

          {tableNumber && (
            <Badge variant="secondary" className="w-fit">
              Table: {tableNumber}
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'stripe' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setPaymentMethod('stripe')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Credit/Debit Card</p>
                  <p className="text-sm text-gray-600">Secure payment with Stripe</p>
                </div>
              </div>
              {paymentMethod === 'stripe' && (
                <Check className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </div>

          <div 
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              paymentMethod === 'revolut' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
            }`}
            onClick={() => setPaymentMethod('revolut')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">Revolut</p>
                  <p className="text-sm text-gray-600">Quick mobile payment</p>
                </div>
              </div>
              {paymentMethod === 'revolut' && (
                <Check className="h-5 w-5 text-purple-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button
        onClick={handlePayment}
        disabled={loading || cartItems.length === 0}
        size="lg"
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {loading ? (
          "Processing..."
        ) : (
          `Continue to Payment - €${getTotalPrice().toFixed(2)}`
        )}
      </Button>
    </div>
  );
};

export default PaymentFlow;
