
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RevolutPaymentButtonProps {
  amount: number;
  currency: string;
  vendorRevolutLink: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  orderId: string;
  onPaymentInitiated: () => void;
}

const RevolutPaymentButton: React.FC<RevolutPaymentButtonProps> = ({
  amount,
  currency,
  vendorRevolutLink,
  onPaymentInitiated
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRevolutPayment = async () => {
    setLoading(true);
    try {
      // Open Revolut link in new tab
      window.open(vendorRevolutLink, '_blank');
      
      toast({
        title: "Redirected to Revolut",
        description: "Please complete your payment in the new tab",
      });

      onPaymentInitiated();
    } catch (error) {
      console.error('Revolut payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to open Revolut payment",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="h-5 w-5 mr-2 text-purple-600" />
          Revolut Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-sm text-purple-800">
            You will be redirected to the vendor's Revolut payment page.
          </p>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Amount:</span>
          <span className="text-xl font-bold">{currency.toUpperCase()} {amount.toFixed(2)}</span>
        </div>

        <Button
          onClick={handleRevolutPayment}
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Pay with Revolut
        </Button>
      </CardContent>
    </Card>
  );
};

export default RevolutPaymentButton;
