
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  RefreshCw, 
  CreditCard,
  Smartphone 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusTrackerProps {
  orderId: string;
  paymentIntentId?: string;
  paymentMethod: 'stripe' | 'revolut';
  onStatusUpdate?: (status: string) => void;
}

const PaymentStatusTracker: React.FC<PaymentStatusTrackerProps> = ({
  orderId,
  paymentIntentId,
  paymentMethod,
  onStatusUpdate
}) => {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'failed'>('pending');
  const [orderStatus, setOrderStatus] = useState<string>('pending');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkPaymentStatus = async () => {
    if (!paymentIntentId && paymentMethod === 'stripe') {
      return;
    }

    setIsChecking(true);
    try {
      if (paymentMethod === 'stripe' && paymentIntentId) {
        const { data, error } = await supabase.functions.invoke('verify-payment-status', {
          body: { paymentIntentId, orderId }
        });

        if (error) throw error;

        // Fix the type issue by properly handling the payment status
        const stripeStatus = data.paymentStatus;
        let status: 'pending' | 'paid' | 'failed' = 'pending';
        
        if (stripeStatus === 'succeeded') {
          status = 'paid';
        } else if (stripeStatus === 'canceled' || stripeStatus === 'failed') {
          status = 'failed';
        } else {
          status = 'pending';
        }

        setPaymentStatus(status);
        setOrderStatus(data.orderStatus);
        onStatusUpdate?.(data.orderStatus);
      } else {
        // For Revolut, check order status from database
        const { data: order, error } = await supabase
          .from('orders')
          .select('status, payment_status')
          .eq('id', orderId)
          .single();

        if (error) throw error;

        // Handle the payment status properly
        const dbPaymentStatus = order.payment_status;
        let status: 'pending' | 'paid' | 'failed' = 'pending';
        
        if (dbPaymentStatus === 'paid') {
          status = 'paid';
        } else if (dbPaymentStatus === 'failed') {
          status = 'failed';
        } else {
          status = 'pending';
        }

        setPaymentStatus(status);
        setOrderStatus(order.status || 'pending');
        onStatusUpdate?.(order.status);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      toast({
        title: "Status Check Failed",
        description: "Unable to verify payment status",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkPaymentStatus();
    
    // Auto-refresh every 10 seconds for pending payments
    const interval = setInterval(() => {
      if (paymentStatus === 'pending') {
        checkPaymentStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId, paymentIntentId, paymentMethod]);

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'paid':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      case 'failed':
        return <XCircle className="h-6 w-6 text-red-600" />;
      default:
        return <Clock className="h-6 w-6 text-yellow-600" />;
    }
  };

  const getStatusBadge = () => {
    switch (paymentStatus) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Payment Successful</Badge>;
      case 'failed':
        return <Badge variant="destructive">Payment Failed</Badge>;
      default:
        return <Badge variant="secondary">Payment Pending</Badge>;
    }
  };

  const getPaymentMethodIcon = () => {
    return paymentMethod === 'stripe' ? (
      <CreditCard className="h-4 w-4" />
    ) : (
      <Smartphone className="h-4 w-4" />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span>Payment Status</span>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getPaymentMethodIcon()}
              <span className="text-sm text-gray-600">Payment Method:</span>
            </div>
            <span className="font-medium capitalize">{paymentMethod}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Order Status:</span>
            <Badge variant="outline" className="capitalize">
              {orderStatus.replace('_', ' ')}
            </Badge>
          </div>

          {paymentMethod === 'revolut' && paymentStatus === 'pending' && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Please complete your Revolut payment and return here. 
                We'll automatically detect when payment is received.
              </p>
            </div>
          )}

          <Button
            onClick={checkPaymentStatus}
            disabled={isChecking}
            variant="outline"
            className="w-full"
          >
            {isChecking ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Checking Status...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Status
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatusTracker;
