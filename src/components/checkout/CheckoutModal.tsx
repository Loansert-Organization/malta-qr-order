
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ArrowLeft } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'confirmation'>('info');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: ''
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'revolut'>('revolut');
  const [vendorPaymentLinks, setVendorPaymentLinks] = useState<{
    revolut_link?: string;
    stripe_link?: string;
  }>({});
  const { toast } = useToast();

  React.useEffect(() => {
    if (isOpen) {
      fetchVendorPaymentInfo();
    }
  }, [isOpen, vendorId]);

  const fetchVendorPaymentInfo = async () => {
    try {
      const { data: vendor } = await supabase
        .from('vendors')
        .select('revolut_link, stripe_link')
        .eq('id', vendorId)
        .single();
      
      if (vendor) {
        setVendorPaymentLinks(vendor);
      }
    } catch (error) {
      console.error('Error fetching vendor payment info:', error);
    }
  };

  const validateStep = (step: string) => {
    if (step === 'info') {
      if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
        toast({
          title: "Missing Information",
          description: "Please provide your name and phone number",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 'info' && validateStep('info')) {
      setCurrentStep('payment');
    } else if (currentStep === 'payment') {
      if (!agreedToTerms) {
        toast({
          title: "Terms Required",
          description: "Please agree to the terms and conditions",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep('confirmation');
    }
  };

  const handleBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('info');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('payment');
    }
  };

  const handleCreateOrder = async () => {
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
          payment_method: paymentMethod,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email || null,
          notes: customerInfo.notes || null
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
      if (paymentMethod === 'revolut' && vendorPaymentLinks.revolut_link) {
        // Open Revolut payment link
        window.open(vendorPaymentLinks.revolut_link, '_blank');
        
        toast({
          title: "Payment Link Opened",
          description: "Complete your payment in the new tab. Your order will be confirmed automatically.",
        });

        // Simulate order completion for demo
        setTimeout(() => {
          onOrderComplete(order.id);
        }, 2000);
      } else if (paymentMethod === 'stripe') {
        // Handle Stripe payment
        try {
          const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
            body: {
              amount: Math.round(totalPrice * 100), // Convert to cents
              currency: 'eur',
              order_id: order.id,
              customer_email: customerInfo.email || `guest_${guestSessionId}@icupa.mt`
            }
          });

          if (error) throw error;

          if (data?.url) {
            window.location.href = data.url;
          } else {
            throw new Error('No payment URL received');
          }
        } catch (stripeError) {
          console.error('Stripe payment error:', stripeError);
          toast({
            title: "Payment Error",
            description: "Failed to initialize Stripe payment. Please try Revolut or contact support.",
            variant: "destructive"
          });
        }
      } else {
        // Fallback: simulate cash payment or direct completion
        toast({
          title: "Order Created!",
          description: "Your order has been submitted successfully. Please pay at the restaurant.",
        });
        
        onOrderComplete(order.id);
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 'info':
        return (
          <div className="space-y-6">
            <CustomerInfoForm 
              customerInfo={customerInfo}
              setCustomerInfo={setCustomerInfo}
            />
          </div>
        );
      
      case 'payment':
        return (
          <div className="space-y-6">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              vendorPaymentLinks={vendorPaymentLinks}
            />
            <TermsAgreement
              agreedToTerms={agreedToTerms}
              setAgreedToTerms={setAgreedToTerms}
            />
          </div>
        );
      
      case 'confirmation':
        return (
          <div className="space-y-6">
            <OrderSummary cart={cart} totalPrice={totalPrice} />
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Order Details</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Name:</strong> {customerInfo.name}</p>
                <p><strong>Phone:</strong> {customerInfo.phone}</p>
                {customerInfo.email && <p><strong>Email:</strong> {customerInfo.email}</p>}
                <p><strong>Payment:</strong> {paymentMethod === 'revolut' ? 'Revolut' : 'Credit Card'}</p>
                {customerInfo.notes && <p><strong>Notes:</strong> {customerInfo.notes}</p>}
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            {currentStep !== 'info' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={isProcessing}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {currentStep === 'info' && 'Your Information'}
              {currentStep === 'payment' && 'Payment Method'}
              {currentStep === 'confirmation' && 'Confirm Order'}
            </DialogTitle>
          </div>
          
          {/* Progress Indicator */}
          <div className="flex space-x-2 mt-4">
            <div className={`h-2 flex-1 rounded ${currentStep === 'info' ? 'bg-blue-600' : 'bg-blue-200'}`} />
            <div className={`h-2 flex-1 rounded ${currentStep === 'payment' ? 'bg-blue-600' : currentStep === 'confirmation' ? 'bg-blue-200' : 'bg-gray-200'}`} />
            <div className={`h-2 flex-1 rounded ${currentStep === 'confirmation' ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {renderStepContent()}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {currentStep !== 'confirmation' ? (
              <Button
                onClick={handleNext}
                disabled={isProcessing}
                className="flex-1"
                size="lg"
              >
                Continue
              </Button>
            ) : (
              <Button
                onClick={handleCreateOrder}
                disabled={isProcessing}
                className="flex-1"
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
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
