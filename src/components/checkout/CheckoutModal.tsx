
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { CartItem } from '@/hooks/useOrderDemo/types';
import OrderSummary from './OrderSummary';
import CustomerInfoForm from './CustomerInfoForm';
import TermsAgreement from './TermsAgreement';
import PaymentMethodSelector from './PaymentMethodSelector';

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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'revolut'>('revolut');
  const [vendorRevolutLink, setVendorRevolutLink] = useState<string>('');
  const { toast } = useToast();

  React.useEffect(() => {
    // Fetch vendor Revolut link
    const fetchVendorInfo = async () => {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('revolut_link')
        .eq('id', vendorId)
        .single();
      
      if (vendor?.revolut_link) {
        setVendorRevolutLink(vendor.revolut_link);
      }
    };

    if (vendorId) {
      fetchVendorInfo();
    }
  }, [vendorId]);

  const handleCreateOrder = async () => {
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
          payment_status: 'pending',
          payment_method: paymentMethod
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

      // Handle payment based on method
      if (paymentMethod === 'revolut' && vendorRevolutLink) {
        // Open Revolut payment link
        window.open(vendorRevolutLink, '_blank');
        
        toast({
          title: "Payment Opened",
          description: "Complete your payment in the new tab, then return here.",
        });

        // Simulate order completion for demo purposes
        setTimeout(() => {
          onOrderComplete(order.id);
          onClose();
        }, 3000);
      } else {
        // For stripe or when no revolut link, simulate success
        toast({
          title: "Order Created!",
          description: "Your order has been submitted successfully.",
        });
        
        onOrderComplete(order.id);
        onClose();
      }

    } catch (error) {
      console.error('Order creation error:', error);
      toast({
        title: "Order Failed",
        description: "There was an error creating your order. Please try again.",
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
            onClick={handleCreateOrder}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Order...
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
