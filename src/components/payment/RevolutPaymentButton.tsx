
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Smartphone, ExternalLink, Copy, Check } from 'lucide-react';
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
  customerInfo,
  orderId,
  onPaymentInitiated
}) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleRevolutPayment = () => {
    // Generate payment link with amount
    const paymentUrl = `${vendorRevolutLink}/${amount.toFixed(2)}`;
    
    // Open Revolut payment in new tab
    window.open(paymentUrl, '_blank');
    onPaymentInitiated();

    toast({
      title: "Redirecting to Revolut",
      description: "Complete your payment in the new tab that opened."
    });
  };

  const copyPaymentReference = async () => {
    const reference = `ICUPA-${orderId.slice(-8)}`;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Reference Copied",
        description: "Payment reference copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please note down the reference manually",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Revolut Payment</span>
          </div>
          <Badge variant="secondary">Mobile Optimized</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Payment Instructions:</h4>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Click "Pay with Revolut" below</li>
            <li>Complete payment in the Revolut app</li>
            <li>Use the payment reference shown below</li>
            <li>Return here after payment completion</li>
          </ol>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="font-semibold">€{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Payment Reference:</span>
            <div className="flex items-center space-x-2">
              <code className="text-sm bg-white px-2 py-1 rounded">
                ICUPA-{orderId.slice(-8)}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyPaymentReference}
                className="h-6 w-6 p-0"
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleRevolutPayment}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Pay €{amount.toFixed(2)} with Revolut
        </Button>

        <div className="text-xs text-gray-500 text-center">
          <p>You'll be redirected to Revolut to complete your payment</p>
          <p>Please include the payment reference above</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevolutPaymentButton;
