
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Smartphone } from 'lucide-react';

interface PaymentMethodSelectorProps {
  paymentMethod: 'stripe' | 'revolut';
  setPaymentMethod: (method: 'stripe' | 'revolut') => void;
  vendorPaymentLinks: {
    revolut_link?: string;
    stripe_link?: string;
  };
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  setPaymentMethod,
  vendorPaymentLinks
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Payment Method</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('stripe')}
          className="flex items-center space-x-2 h-auto p-4"
        >
          <div className="flex flex-col items-center space-y-2">
            <CreditCard className="h-5 w-5" />
            <span className="text-sm">Credit Card</span>
            <Badge variant="secondary" className="text-xs">Secure</Badge>
          </div>
        </Button>
        
        <Button
          variant={paymentMethod === 'revolut' ? 'default' : 'outline'}
          onClick={() => setPaymentMethod('revolut')}
          disabled={!vendorPaymentLinks.revolut_link}
          className="flex items-center space-x-2 h-auto p-4"
        >
          <div className="flex flex-col items-center space-y-2">
            <Smartphone className="h-5 w-5" />
            <span className="text-sm">Revolut</span>
            <Badge variant="secondary" className="text-xs">
              {vendorPaymentLinks.revolut_link ? 'Fast' : 'N/A'}
            </Badge>
          </div>
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
