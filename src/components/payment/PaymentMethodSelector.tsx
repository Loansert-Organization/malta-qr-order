
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import RevolutPaymentButton from './RevolutPaymentButton';

interface PaymentMethodSelectorProps {
  amount: number;
  currency: string;
  orderId: string;
  vendorRevolutLink?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (paymentIntentId?: string) => void;
  onPaymentError: (error: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  amount,
  currency,
  orderId,
  vendorRevolutLink,
  customerInfo,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [selectedMethod, setSelectedMethod] = useState('stripe');

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Choose Payment Method</h3>
        <p className="text-gray-600">Select your preferred payment option below</p>
      </div>

      <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stripe" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Card Payment</span>
            <Badge variant="secondary" className="ml-1">Secure</Badge>
          </TabsTrigger>
          <TabsTrigger 
            value="revolut" 
            disabled={!vendorRevolutLink}
            className="flex items-center space-x-2"
          >
            <Smartphone className="h-4 w-4" />
            <span>Revolut</span>
            <Badge variant="secondary" className="ml-1">Fast</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stripe" className="mt-6">
          <StripePaymentForm
            amount={amount}
            currency={currency}
            orderId={orderId}
            customerInfo={customerInfo}
            onPaymentSuccess={onPaymentSuccess}
            onPaymentError={onPaymentError}
          />
        </TabsContent>

        <TabsContent value="revolut" className="mt-6">
          {vendorRevolutLink ? (
            <RevolutPaymentButton
              amount={amount}
              currency={currency}
              vendorRevolutLink={vendorRevolutLink}
              customerInfo={customerInfo}
              orderId={orderId}
              onPaymentInitiated={() => onPaymentSuccess()}
            />
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Revolut payment not available for this vendor</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentMethodSelector;
