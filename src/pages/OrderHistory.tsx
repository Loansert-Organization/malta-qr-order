import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserOrders } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  id: string;
  item_name: string;
  quantity: number;
  price: number;
}

interface OrderRecord {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  currency: string;
  bar: { name: string };
  order_items: OrderItem[];
}

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchUserOrders();
        setOrders(data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const groups = orders.reduce<Record<string, OrderRecord[]>>((acc, o) => {
    const day = o.created_at.slice(0, 10);
    (acc[day] = acc[day] || []).push(o);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-4">Order History</h1>
      {loading && <p>Loading past orders...</p>}
      {!loading && orders.length === 0 && <p>No past orders found.</p>}
      {!loading && Object.entries(groups).map(([day, list]) => (
        <div key={day} className="mb-6">
          <h2 className="text-lg font-semibold mt-4 mb-2">{day}</h2>
          <div className="space-y-4">
            {list.map(order => (
              <Card key={order.id}>
                <CardHeader className="flex justify-between items-center">
                  <CardTitle className="text-base">{order.bar.name}</CardTitle>
                  <Badge variant="outline">{order.status}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {order.order_items.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span>{item.quantity}× {item.item_name}</span>
                        <span>{order.currency} {(item.price * item.quantity).toFixed(order.currency === 'RWF' ? 0 : 2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-semibold mt-2">
                    <span>Total</span>
                    <span>{order.currency} {order.total_amount.toFixed(order.currency === 'RWF' ? 0 : 2)}</span>
                  </div>
                  <Link to={`/order-status/${order.id}`} className="text-sm text-blue-600 hover:underline mt-2 block">
                    Track Status
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderHistory;
