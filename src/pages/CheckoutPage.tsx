import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Minus, Trash2, Phone, CreditCard, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PAYMENT_METHODS } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

interface OrderData {
  barId: string;
  barName: string;
  items: CartItem[];
  currency: string;
  country: string;
  subtotal: number;
}

const CheckoutPage = () => {
  const { barId: paramBarId } = useParams<{ barId?: string }>();
  const location = useLocation();
  const queryBarId = new URLSearchParams(location.search).get('bar') || undefined;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [bar, setBar] = useState<any>(null);
  const [processingOrder, setProcessingOrder] = useState(false);

  const barId = paramBarId || queryBarId || orderData?.barId || '';

  useEffect(() => {
    // Load order data from localStorage
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    } else {
      navigate(`/menu/${barId}`);
    }

    fetchBarDetails();
  }, [barId]);

  const fetchBarDetails = async () => {
    if (!barId) return;
    
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .eq('id', barId)
        .single();

      if (error) throw error;
      setBar(data);
    } catch (error) {
      console.error('Error fetching bar:', error);
    }
  };

  const updateQuantity = (itemId: string, change: number) => {
    if (!orderData) return;

    const updatedItems = orderData.items
      .map(item => {
        if (item.id === itemId) {
          const newQuantity = item.quantity + change;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    const updatedOrder = {
      ...orderData,
      items: updatedItems,
      subtotal: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    setOrderData(updatedOrder);
    localStorage.setItem('pendingOrder', JSON.stringify(updatedOrder));

    if (updatedItems.length === 0) {
      navigate(`/menu/${barId}`);
    }
  };

  const handlePayment = async () => {
    if (!orderData || !bar) return;

    setProcessingOrder(true);
    
    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          bar_id: barId,
          items: orderData.items,
          total_amount: orderData.subtotal,
          user_phone: phoneNumber || null,
          payment_status: 'pending',
          currency: orderData.currency,
          country: orderData.country
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: PAYMENT_METHODS[orderData.country as keyof typeof PAYMENT_METHODS],
          status: 'pending',
          momo_code: bar.momo_code,
          revolut_link: bar.revolut_link
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Generate payment instructions
      if (orderData.country === 'Rwanda') {
        const ussdCode = `*182*1*${bar.momo_code}*${orderData.subtotal}#`;
        setPaymentInstructions(ussdCode);
      } else {
        setPaymentInstructions(bar.revolut_link || 'Payment link not available');
      }

      setShowPaymentModal(true);
      
      // Clear cart after order creation
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem(`cart_${barId}`);

      // For demo purposes, update payment status after 3 seconds
      setTimeout(async () => {
        await supabase
          .from('payments')
          .update({ status: 'confirmed' })
          .eq('id', payment.id);

        await supabase
          .from('orders')
          .update({ payment_status: 'confirmed' })
          .eq('id', order.id);

        navigate(`/confirm/${order.id}`);
      }, 3000);

    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Error",
        description: "Failed to process order",
        variant: "destructive"
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const currency = orderData.currency === 'RWF' ? 'RWF' : '€';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/menu/${barId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <p className="text-sm text-gray-600">{orderData.barName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between py-3 border-b last:border-0">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    <p className="text-sm font-medium mt-1">
                      {currency} {item.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{currency} {orderData.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={orderData.country === 'Rwanda' ? '+250 7XX XXX XXX' : '+356 XXXX XXXX'}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">
                We'll send order updates to this number
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePayment}
          disabled={processingOrder}
        >
          {processingOrder ? (
            <>Processing...</>
          ) : (
            <>
              {orderData.country === 'Rwanda' ? (
                <><Smartphone className="mr-2 h-5 w-5" /> Pay with MoMo</>
              ) : (
                <><CreditCard className="mr-2 h-5 w-5" /> Pay with Revolut</>
              )}
            </>
          )}
        </Button>
      </div>

      {/* Payment Instructions Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {orderData.country === 'Rwanda' ? 'MoMo Payment Instructions' : 'Revolut Payment'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            {orderData.country === 'Rwanda' ? (
              <>
                <p>Please dial the following USSD code to complete your payment:</p>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <code className="text-lg font-mono font-bold">{paymentInstructions}</code>
                </div>
                <p className="text-sm">Amount: RWF {orderData.subtotal}</p>
              </>
            ) : (
              <>
                <p>Click the button below to complete your payment via Revolut:</p>
                <Button 
                  className="w-full" 
                  onClick={() => window.open(paymentInstructions, '_blank')}
                >
                  Open Revolut
                </Button>
                <p className="text-sm">Amount: €{orderData.subtotal.toFixed(2)}</p>
              </>
            )}
            <p className="text-sm text-gray-500">
              Processing payment... You will be redirected automatically.
            </p>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage; 