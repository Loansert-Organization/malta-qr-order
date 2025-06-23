
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  orderId: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (paymentIntentId?: string) => void;
  onPaymentError: (error: string) => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
  amount,
  currency,
  orderId,
  customerInfo,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          order_id: orderId,
          customer_email: customerInfo.email || 'guest@icupa.mt'
        }
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Payment Initiated",
        description: "Please complete your payment in the new tab",
      });

      onPaymentSuccess();
    } catch (error) {
      console.error('Stripe payment error:', error);
      onPaymentError(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Credit Card Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            You will be redirected to Stripe's secure checkout page to complete your payment.
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Amount:</span>
          <span className="text-xl font-bold">€{amount.toFixed(2)}</span>
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay €${amount.toFixed(2)} with Stripe`
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default StripePaymentForm;
