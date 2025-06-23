
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Smartphone, User, MapPin, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CartItem } from '@/hooks/useOrderDemo/types';

interface CheckoutFlowProps {
  cart: CartItem[];
  vendorId: string;
  guestSessionId: string;
  onOrderSuccess: (orderId: string) => void;
  onClose: () => void;
}

const EnhancedCheckoutFlow: React.FC<CheckoutFlowProps> = ({
  cart,
  vendorId,
  guestSessionId,
  onOrderSuccess,
  onClose
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'revolut'>('stripe');
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: ''
  });

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCreateOrder = async () => {
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to continue.",
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
          customer_name: customerInfo.name || null,
          customer_email: customerInfo.email || null,
          customer_phone: customerInfo.phone || null,
          notes: customerInfo.notes || null,
          payment_method: paymentMethod,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError || !order) {
        throw new Error('Failed to create order');
      }

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        throw new Error('Failed to create order items');
      }

      // Create payment record
      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          amount: getTotalPrice(),
          currency: 'EUR',
          status: 'pending'
        });

      if (paymentError) {
        console.warn('Failed to create payment record:', paymentError);
      }

      if (paymentMethod === 'stripe') {
        // Process Stripe payment
        const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
          body: {
            amount: Math.round(getTotalPrice() * 100), // Convert to cents
            currency: 'eur',
            order_id: order.id,
            customer_email: customerInfo.email || 'guest@icupa.mt'
          }
        });

        if (error) throw error;

        // Open Stripe checkout in new tab
        window.open(data.url, '_blank');
      } else {
        // Handle Revolut payment - redirect to vendor's Revolut link
        const { data: vendor } = await supabase
          .from('vendors')
          .select('revolut_link')
          .eq('id', vendorId)
          .single();

        if (vendor?.revolut_link) {
          window.open(vendor.revolut_link, '_blank');
        } else {
          toast({
            title: "Payment Method Unavailable",
            description: "Revolut payment is not available for this vendor.",
            variant: "destructive"
          });
          return;
        }
      }

      onOrderSuccess(order.id);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Order Summary</h3>
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Total ({getTotalItems()} items)</span>
              <span>€{getTotalPrice().toFixed(2)}</span>
            </div>
            <Button onClick={() => setStep(2)} className="w-full">
              Continue to Customer Info
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <User className="h-5 w-5 mr-2" />
              Customer Information
            </h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                  placeholder="+356 1234 5678"
                />
              </div>
              <div>
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({...customerInfo, notes: e.target.value})}
                  placeholder="Any special requests or dietary requirements..."
                  rows={3}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Continue to Payment
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Payment Method</h3>
            <RadioGroup value={paymentMethod} onValueChange={(value: 'stripe' | 'revolut') => setPaymentMethod(value)}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="stripe" id="stripe" />
                <CreditCard className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <Label htmlFor="stripe" className="font-medium">Credit/Debit Card</Label>
                  <p className="text-sm text-gray-600">Secure payment with Stripe</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="revolut" id="revolut" />
                <Smartphone className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <Label htmlFor="revolut" className="font-medium">Revolut</Label>
                  <p className="text-sm text-gray-600">Quick mobile payment</p>
                </div>
              </div>
            </RadioGroup>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the Terms and Conditions and Privacy Policy
              </Label>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Amount:</span>
                <span className="text-xl font-bold">€{getTotalPrice().toFixed(2)}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCreateOrder}
                disabled={loading || !termsAccepted}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? "Processing..." : `Pay €${getTotalPrice().toFixed(2)}`}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Checkout</span>
          <Badge variant="secondary">Step {step} of 3</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderStepContent()}
      </CardContent>
    </Card>
  );
};

export default EnhancedCheckoutFlow;
