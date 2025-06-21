
import React from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: 'stripe' | 'revolut';
  setPaymentMethod: (method: 'stripe' | 'revolut') => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Payment Method</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('stripe')}
          className="flex items-center space-x-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>Card</span>
        </Button>
        <Button
          variant={paymentMethod === 'revolut' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('revolut')}
          className="flex items-center space-x-2"
        >
          <Smartphone className="h-4 w-4" />
          <span>Revolut</span>
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
