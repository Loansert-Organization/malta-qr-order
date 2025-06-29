import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RevolutPaymentButtonProps {
  orderId: string;
  amount: number;
  vendorRevolutLink?: string;
  vendorName: string;
  orderReference: string;
  customerName?: string;
  customerPhone?: string;
  onPaymentInitiated: () => void;
}

const RevolutPaymentButton: React.FC<RevolutPaymentButtonProps> = ({
  orderId,
  amount,
  vendorRevolutLink,
  vendorName,
  orderReference,
  customerName,
  customerPhone,
  onPaymentInitiated
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleRevolutPayment = async () => {
    try {
      setLoading(true);

      // Generate payment reference
      const paymentRef = `ICUPA-${orderReference}`;
      
      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          order_id: orderId,
          amount: amount,
          payment_method: 'revolut',
          status: 'pending',
          currency: 'EUR'
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Generate Revolut payment link
      // In production, this would call a Revolut API
      const revolutLink = vendorRevolutLink || 'https://revolut.me/icupamalta';
      const paymentAmount = amount.toFixed(2);
      const paymentMessage = encodeURIComponent(`Payment for order ${paymentRef} - €${paymentAmount}`);
      
      // Construct Revolut payment link with amount and reference
      const fullPaymentLink = `${revolutLink}/${paymentAmount}EUR?message=${paymentMessage}`;
      
      setPaymentLink(fullPaymentLink);
      
      // Update order with payment pending status
      await supabase
        .from('orders')
        .update({ 
          payment_status: 'pending',
          payment_method: 'revolut'
        })
        .eq('id', orderId);

      // Notify vendor about pending payment
      await supabase
        .from('vendor_notifications')
        .insert({
          vendor_id: (await supabase.from('orders').select('vendor_id').eq('id', orderId).single()).data?.vendor_id,
          order_id: orderId,
          notification_type: 'payment_pending',
          message: `Revolut payment pending for order ${orderReference} - €${paymentAmount}`
        });

      onPaymentInitiated();
      
      toast({
        title: "Payment Link Generated",
        description: "Click the link below to complete your payment",
      });
    } catch (error) {
      console.error('Revolut payment error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to generate payment link. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "Payment link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  if (paymentLink) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Revolut Payment Ready
          </CardTitle>
          <CardDescription>
            Complete your payment using the link below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Amount to pay:</strong> €{amount.toFixed(2)}<br />
              <strong>Reference:</strong> ICUPA-{orderReference}
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Click the button below to open Revolut and complete your payment:
            </p>
            
            <Button
              onClick={() => window.open(paymentLink, '_blank')}
              className="w-full"
              size="lg"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Pay with Revolut
            </Button>
            
            <Button
              onClick={copyToClipboard}
              variant="outline"
              className="w-full"
            >
              <Copy className="mr-2 h-4 w-4" />
              {copied ? 'Copied!' : 'Copy Payment Link'}
            </Button>
          </div>
          
          <div className="text-sm text-gray-500 space-y-1">
            <p>• Include the reference number in your payment</p>
            <p>• Payment confirmation may take a few minutes</p>
            <p>• You'll receive a notification once confirmed</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Button
      onClick={handleRevolutPayment}
      disabled={loading}
      className="w-full"
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Payment Link...
        </>
      ) : (
        <>
          Pay with Revolut
        </>
      )}
    </Button>
  );
};

export default RevolutPaymentButton;
