
import React from 'react';
import { Separator } from '@/components/ui/separator';
import { CartItem } from '@/hooks/useOrderDemo/types';

interface OrderSummaryProps {
  cart: CartItem[];
  totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ cart, totalPrice }) => {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Order Summary</h3>
      
      <div className="space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span>€{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal ({totalItems} items)</span>
          <span>€{totalPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Service fee</span>
          <span>Free</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>€{totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
