
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Smartphone, ShoppingCart, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePayment = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before ordering.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          vendor_id: vendorId,
          guest_session_id: guestSessionId,
          total_amount: getTotalPrice(),
          items: cartItems,
          table_number: tableNumber,
          status: 'pending',
          payment_method: paymentMethod
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error('Failed to create order');
      }

      if (paymentMethod === 'stripe') {
        // Process Stripe payment
        const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
          body: {
            amount: Math.round(getTotalPrice() * 100), // Convert to cents
            currency: 'eur',
            order_id: order.id,
            customer_email: 'guest@icupa.mt'
          }
        });

        if (error) throw error;

        // Redirect to Stripe Checkout
        window.open(data.url, '_blank');
      } else {
        // Handle Revolut payment
        toast({
          title: "Revolut Payment",
          description: "Revolut payment integration coming soon!",
        });
      }

      onPaymentSuccess(order.id);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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
              paymentMethod === 'revolut' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
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
                <Check className="h-5 w-5 text-blue-600" />
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
          `Pay €${getTotalPrice().toFixed(2)} - Place Order`
        )}
      </Button>
    </div>
  );
};

export default PaymentFlow;
