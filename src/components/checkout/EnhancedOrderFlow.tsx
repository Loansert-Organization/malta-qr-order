import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
}

interface OrderFlowProps {
  vendorId: string;
  vendorName: string;
  cart: CartItem[];
  total: number;
  currency: string;
  onOrderComplete: (orderId: string) => void;
  onCancel: () => void;
}

type OrderStep = 'review' | 'details' | 'processing' | 'success';

export const EnhancedOrderFlow: React.FC<OrderFlowProps> = ({
  vendorId,
  vendorName,
  cart,
  total,
  currency,
  onOrderComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OrderStep>('review');
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    table_number: '',
    special_instructions: ''
  });

  const generateGuestSessionId = () => {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    setCurrentStep('processing');

    try {
      // Generate guest session ID
      const guestSessionId = generateGuestSessionId();

      // Prepare order data
      const orderData = {
        vendor_id: vendorId,
        guest_session_id: guestSessionId,
        items: cart.map(item => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          name: item.name,
          image_url: item.image_url
        })),
        total_amount: total,
        customer_name: customerInfo.name || null,
        customer_phone: customerInfo.phone || null,
        customer_email: customerInfo.email || null,
        table_number: customerInfo.table_number || null,
        special_instructions: customerInfo.special_instructions || null,
        payment_method: 'pending'
      };

      // Call the place-order edge function
      const { data, error } = await supabase.functions.invoke('place-order', {
        body: orderData
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to place order');
      }

      setOrderId(data.order_id);
      setCurrentStep('success');

      // Store order ID for later use
      localStorage.setItem('latest_order_id', data.order_id);

      // Show success message
      toast({
        title: "Order Placed Successfully!",
        description: "Your order has been sent to the restaurant",
      });

      // Auto-navigate to order success page after delay
      setTimeout(() => {
        onOrderComplete(data.order_id);
        navigate(`/order-success/${data.order_id}`);
      }, 2000);

    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      setCurrentStep('details');
    } finally {
      setProcessing(false);
    }
  };

  const isFormValid = () => {
    return customerInfo.phone || customerInfo.email || customerInfo.table_number;
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <AnimatePresence mode="wait">
        {/* Step 1: Review Order */}
        {currentStep === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Order Review</CardTitle>
                <p className="text-sm text-gray-600">{vendorName}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × {currency} {item.price.toFixed(currency === 'RWF' ? 0 : 2)}
                        </p>
                      </div>
                      <span className="font-medium">
                        {currency} {(item.price * item.quantity).toFixed(currency === 'RWF' ? 0 : 2)}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center text-lg font-bold pt-3 border-t">
                    <span>Total</span>
                    <span>{currency} {total.toFixed(currency === 'RWF' ? 0 : 2)}</span>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={onCancel} className="flex-1">
                    Back to Menu
                  </Button>
                  <Button onClick={() => setCurrentStep('details')} className="flex-1">
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Customer Details */}
        {currentStep === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle>Your Details</CardTitle>
                <p className="text-sm text-gray-600">Please provide at least one contact method</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+250 7XX XXX XXX"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="table">Table Number</Label>
                    <Input
                      id="table"
                      placeholder="Table number"
                      value={customerInfo.table_number}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, table_number: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="instructions">Special Instructions (Optional)</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any allergies or special requests..."
                    value={customerInfo.special_instructions}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, special_instructions: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep('review')} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handlePlaceOrder} 
                    disabled={!isFormValid() || processing}
                    className="flex-1"
                  >
                    {currency === 'RWF' ? (
                      <><Smartphone className="mr-2 h-4 w-4" /> Place Order</>
                    ) : (
                      <><CreditCard className="mr-2 h-4 w-4" /> Place Order</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 3: Processing */}
        {currentStep === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center py-12"
          >
            <Card>
              <CardContent className="p-8">
                <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Processing Your Order</h3>
                <p className="text-gray-600">Please wait while we confirm your order...</p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {currentStep === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center py-12"
          >
            <Card>
              <CardContent className="p-8">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                <h3 className="text-xl font-semibold mb-2">Order Placed Successfully!</h3>
                <p className="text-gray-600 mb-4">Order #{orderId.slice(0, 8).toUpperCase()}</p>
                <Badge className="bg-green-100 text-green-800">
                  Estimated time: 15-20 minutes
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};