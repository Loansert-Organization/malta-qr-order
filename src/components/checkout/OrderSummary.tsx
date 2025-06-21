
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/hooks/useOrderDemo/types';

interface OrderSummaryProps {
  cart: CartItem[];
  totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, totalPrice }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Order Summary</h3>
        <div className="space-y-2">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.name}</span>
              <span>€{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-3" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>€{totalPrice.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderSummary;
