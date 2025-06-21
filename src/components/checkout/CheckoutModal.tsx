
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
import PaymentMethodSelector from '../payment/PaymentMethodSelector';
import PaymentStatusTracker from '../payment/PaymentStatusTracker';

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
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);
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
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          notes: customerInfo.notes
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

      setCurrentOrderId(order.id);
      setShowPayment(true);

      toast({
        title: "Order Created!",
        description: "Please proceed with payment to confirm your order",
      });
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

  const handlePaymentSuccess = (paymentIntentId?: string) => {
    if (paymentIntentId) {
      setPaymentIntentId(paymentIntentId);
    }
    
    toast({
      title: "Payment Initiated!",
      description: "Your payment is being processed. Please wait for confirmation.",
    });
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Payment Failed",
      description: error,
      variant: "destructive"
    });
  };

  const handleStatusUpdate = (status: string) => {
    if (status === 'confirmed') {
      onOrderComplete(currentOrderId);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {!showPayment ? 'Complete Your Order' : 'Payment & Status'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!showPayment ? (
            <>
              <OrderSummary cart={cart} totalPrice={totalPrice} />
              
              <CustomerInfoForm 
                customerInfo={customerInfo}
                setCustomerInfo={setCustomerInfo}
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
                    Creating Order...
                  </>
                ) : (
                  `Create Order - €${totalPrice.toFixed(2)}`
                )}
              </Button>
            </>
          ) : (
            <>
              <PaymentMethodSelector
                amount={totalPrice}
                currency="eur"
                orderId={currentOrderId}
                vendorRevolutLink={vendorRevolutLink}
                customerInfo={customerInfo}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={handlePaymentError}
              />

              <PaymentStatusTracker
                orderId={currentOrderId}
                paymentIntentId={paymentIntentId}
                paymentMethod={paymentIntentId ? 'stripe' : 'revolut'}
                onStatusUpdate={handleStatusUpdate}
              />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
