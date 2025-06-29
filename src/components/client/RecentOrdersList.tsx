import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface OrderItem { name: string }
interface RecentOrder {
  id: string;
  created_at: string;
  items: OrderItem[];
}
interface Props {
  orders: RecentOrder[];
  onReorder: (order: RecentOrder) => void;
}

const RecentOrdersList: React.FC<Props> = ({ orders, onReorder }) => {
  if (orders.length === 0) return null;
  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-semibold">🕒 Recent Orders</h2>
      {orders.map((ord) => (
        <Card key={ord.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm mb-1">{format(new Date(ord.created_at), 'PP p')}</p>
              <p className="text-xs text-gray-600 truncate max-w-xs">
                {ord.items.map((i) => i.name).join(', ')}
              </p>
            </div>
            <Button size="sm" onClick={() => onReorder(ord)} aria-label="Reorder">
              Re-order
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentOrdersList; 