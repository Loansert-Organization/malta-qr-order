
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { CartItem } from '@/hooks/useOrderDemo/types';
import OrderSummary from './OrderSummary';
import CustomerInfoForm from './CustomerInfoForm';
import PaymentMethodSelector from './PaymentMethodSelector';
import TermsAgreement from './TermsAgreement';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  totalPrice: number;
  vendorId: string;
  guestSessionId: string;
  onOrderComplete: (orderId: string) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  totalPrice,
  vendorId,
  guestSessionId,
  onOrderComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'revolut'>('stripe');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();

  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please provide your name and phone number",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          vendor_id: vendorId,
          guest_session_id: guestSessionId,
          total_amount: totalPrice,
          status: 'pending',
          payment_method: paymentMethod,
          payment_status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

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

      if (itemsError) throw itemsError;

      // Process payment based on method
      if (paymentMethod === 'stripe') {
        // Simulate Stripe payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Update order status
        await supabase
          .from('orders')
          .update({ 
            status: 'confirmed',
            payment_status: 'paid',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);
      } else {
        // For Revolut, we'll redirect to their payment link
        window.open('https://revolut.me/example', '_blank');
      }

      toast({
        title: "Order Placed Successfully!",
        description: `Order #${order.id.slice(-8)} has been submitted`,
      });

      onOrderComplete(order.id);
      onClose();
    } catch (error) {
      console.error('Order submission error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete Your Order</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <OrderSummary cart={cart} totalPrice={totalPrice} />
          
          <CustomerInfoForm 
            customerInfo={customerInfo}
            setCustomerInfo={setCustomerInfo}
          />

          <PaymentMethodSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />

          <TermsAgreement
            agreedToTerms={agreedToTerms}
            setAgreedToTerms={setAgreedToTerms}
          />

          <Button
            onClick={handleSubmitOrder}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Place Order - €${totalPrice.toFixed(2)}`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
