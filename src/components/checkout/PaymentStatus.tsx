
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PaymentStatusProps {
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
}

const PaymentStatus: React.FC<PaymentStatusProps> = ({ paymentStatus }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">Payment Status</span>
          <Badge variant={paymentStatus === 'paid' ? 'default' : 'secondary'}>
            {paymentStatus}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentStatus;
