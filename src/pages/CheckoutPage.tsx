import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Minus, Trash2, Phone, CreditCard, Smartphone, Loader2, Banknote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PAYMENT_METHODS } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCart } from '@/contexts/CartContext';
import { motion } from 'framer-motion';

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
  const { clearCart } = useCart();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState('');
  const [bar, setBar] = useState<any>(null);
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [processingCashOrder, setProcessingCashOrder] = useState(false);

  const barId = paramBarId || queryBarId || orderData?.barId || '';

  useEffect(() => {
    // Load order data from localStorage
    const savedOrder = localStorage.getItem('pendingOrder');
    if (savedOrder) {
      setOrderData(JSON.parse(savedOrder));
    } else {
      navigate(`/menu/${barId}`);
    }

    if (barId) {
    fetchBarDetails();
    }
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
      toast({
        title: "Error",
        description: "Failed to load bar details",
        variant: "destructive"
      });
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

  const removeItem = (itemId: string) => {
    updateQuantity(itemId, -999); // Remove the item entirely
  };

  const handlePayment = async () => {
    if (!orderData || !bar) return;

    // Validate single bar constraint
    if (orderData.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setProcessingOrder(true);
    
    try {
      // Generate anonymous session ID if no phone number
      const sessionId = phoneNumber || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare order items with proper structure
      const orderItems = orderData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          bar_id: barId,
          user_id: null, // Anonymous order
          items: orderItems,
          total_price: orderData.subtotal,
          customer_phone: phoneNumber || null,
          payment_status: 'pending',
          status: 'pending',
          currency: orderData.currency,
          session_id: sessionId,
          order_notes: orderNotes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create payment record
      const paymentMethod = orderData.country === 'Rwanda' ? 'momo' : 'revolut';
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: paymentMethod,
          status: 'pending',
          momo_code: bar.momo_code,
          revolut_link: bar.revolut_link,
          amount: orderData.subtotal,
          currency: orderData.currency
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Generate payment instructions
      if (orderData.country === 'Rwanda' && bar.momo_code) {
        const ussdCode = `*182*1*${bar.momo_code}*${Math.round(orderData.subtotal)}#`;
        setPaymentInstructions(ussdCode);
      } else if (bar.revolut_link) {
        setPaymentInstructions(bar.revolut_link);
      } else {
        setPaymentInstructions('Payment method not configured. Please pay at the bar.');
      }

      // Optional: WhatsApp confirmation
      if (bar.contact_number && phoneNumber) {
        const orderSummary = encodeURIComponent(
          `🍽️ Order #${order.id.slice(0, 8).toUpperCase()}\n` +
          `📍 ${bar.name}\n` +
          `━━━━━━━━━━━━━━━\n` +
          orderItems.map(item => `${item.quantity}x ${item.item_name}`).join('\n') +
          `\n━━━━━━━━━━━━━━━\n` +
          `💰 Total: ${orderData.currency} ${orderData.subtotal.toFixed(orderData.currency === 'RWF' ? 0 : 2)}\n` +
          `📱 Contact: ${phoneNumber}` +
          (orderNotes ? `\n📝 Notes: ${orderNotes}` : '')
        );
        
        // Store WhatsApp link for later use
        const whatsappLink = `https://wa.me/${bar.contact_number.replace(/\D/g, '')}?text=${orderSummary}`;
        localStorage.setItem('pendingWhatsApp', whatsappLink);
      }

      setShowPaymentModal(true);
      
      // Clear cart and order data
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem(`cart_${barId}`);
      clearCart();

      // Redirect to order history page
      setTimeout(() => {
        navigate('/orders/history');
      }, 2000);

    } catch (error) {
      console.error('Error processing order:', error);
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
      setProcessingOrder(false);
    }
  };

  const handleCashPayment = async () => {
    if (!orderData || !bar) return;

    if (orderData.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive"
      });
      return;
    }

    setProcessingCashOrder(true);
    
    try {
      // Generate anonymous session ID if no phone number
      const sessionId = phoneNumber || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Prepare order items with proper structure
      const orderItems = orderData.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      // Create order in database with cash payment
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          bar_id: barId,
          user_id: null, // Anonymous order
          items: orderItems,
          total_price: orderData.subtotal,
          customer_phone: phoneNumber || null,
          payment_status: 'pending',
          payment_method: 'cash',
          status: 'pending',
          currency: orderData.currency,
          session_id: sessionId,
          order_notes: orderNotes || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create payment record for cash
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: order.id,
          payment_method: 'cash',
          status: 'pending',
          amount: orderData.subtotal,
          currency: orderData.currency
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Clear cart and order data
      localStorage.removeItem('pendingOrder');
      localStorage.removeItem(`cart_${barId}`);
      clearCart();

      // Navigate to confirmation page
      navigate(`/confirm/${order.id}`);

    } catch (error) {
      console.error('Error processing cash order:', error);
      toast({
        title: "Error",
        description: "Failed to process order. Please try again.",
        variant: "destructive"
      });
      setProcessingCashOrder(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  const currency = orderData.currency === 'RWF' ? 'RWF' : '€';
  const isRwanda = orderData.country === 'Rwanda';

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/menu/${barId}`)}
              disabled={processingOrder}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <p className="text-sm text-gray-600">{orderData.barName}</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
                {orderData.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start justify-between py-3 border-b last:border-0"
                  >
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <p className="text-sm font-medium mt-1">
                        {currency} {item.price.toFixed(isRwanda ? 0 : 2)} × {item.quantity}
                    </p>
                  </div>
                  
                    <div className="flex items-center space-x-2 ml-4">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, -1)}
                        disabled={processingOrder}
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
                        disabled={processingOrder}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => removeItem(item.id)}
                        disabled={processingOrder}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                  </motion.div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                  <span>{currency} {orderData.subtotal.toFixed(isRwanda ? 0 : 2)}</span>
                </div>
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
        <Card className="mb-6">
          <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <p className="text-sm text-gray-600">Optional - for order updates</p>
          </CardHeader>
            <CardContent className="space-y-4">
              <div>
              <Label htmlFor="phone">Phone Number</Label>
                <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                    placeholder={isRwanda ? '+250 7XX XXX XXX' : '+356 XXXX XXXX'}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10"
                    disabled={processingOrder}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <textarea
                  id="notes"
                  placeholder="Any special requests or instructions..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full mt-2 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  disabled={processingOrder}
                />
            </div>
          </CardContent>
        </Card>
        </motion.div>

        {/* Payment Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
        <Button 
          className="w-full" 
          size="lg"
          onClick={handlePayment}
            disabled={processingOrder || orderData.items.length === 0}
        >
          {processingOrder ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing Order...
              </>
          ) : (
            <>
                {isRwanda ? (
                <><Smartphone className="mr-2 h-5 w-5" /> Pay with MoMo</>
              ) : (
                <><CreditCard className="mr-2 h-5 w-5" /> Pay with Revolut</>
              )}
            </>
          )}
        </Button>
        
        {/* Cash Payment Button */}
        <Button 
          className="w-full mt-3" 
          size="lg"
          variant="outline"
          onClick={handleCashPayment}
          disabled={processingCashOrder || orderData.items.length === 0}
        >
          {processingCashOrder ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <Banknote className="mr-2 h-5 w-5" />
              Place Order & Pay Cash at Counter
            </>
          )}
        </Button>
        </motion.div>
      </div>

      {/* Payment Instructions Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRwanda ? 'MoMo Payment Instructions' : 'Revolut Payment'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="space-y-4">
            {isRwanda ? (
              <>
                <p>Please dial the following USSD code to complete your payment:</p>
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <code className="text-lg font-mono font-bold select-all">{paymentInstructions}</code>
                </div>
                <p className="text-sm">Amount: RWF {orderData.subtotal.toFixed(0)}</p>
                <p className="text-xs text-gray-500">
                  Tip: Long press to copy the USSD code
                </p>
              </>
            ) : paymentInstructions.startsWith('http') ? (
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
            ) : (
              <p className="text-center text-gray-600">{paymentInstructions}</p>
            )}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for payment confirmation...</span>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CheckoutPage; 
