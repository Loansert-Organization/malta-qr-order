
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface OrderItem {
  quantity: number;
  menu_item: {
    name: string;
  };
}

interface OrderItemsListProps {
  orderItems: OrderItem[];
  totalAmount: number;
}

const OrderItemsList: React.FC<OrderItemsListProps> = ({ orderItems, totalAmount }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h4 className="font-semibold mb-3">Order Items</h4>
        <div className="space-y-2">
          {orderItems.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.menu_item?.name || 'Unknown Item'}</span>
            </div>
          ))}
        </div>
        <div className="border-t pt-2 mt-3">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>€{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItemsList;
