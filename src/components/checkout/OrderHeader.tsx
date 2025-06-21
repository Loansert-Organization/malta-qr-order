
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  created_at: string;
  updated_at: string;
}

interface OrderHeaderProps {
  order: Order;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ order }) => {
  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case 'preparing': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'ready': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'completed': return <CheckCircle className="h-5 w-5 text-gray-500" />;
      case 'cancelled': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Your order has been received and is being reviewed.';
      case 'confirmed': return 'Your order has been confirmed and will be prepared shortly.';
      case 'preparing': return 'Your order is being prepared by the kitchen.';
      case 'ready': return 'Your order is ready for pickup!';
      case 'completed': return 'Your order has been completed. Thank you!';
      case 'cancelled': return 'Your order has been cancelled.';
      default: return 'Checking order status...';
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">Order #{order.id.slice(-8)}</h3>
            <p className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {getStatusIcon(order.status)}
            <span className="ml-1 capitalize">{order.status}</span>
          </Badge>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-800">
            {getStatusMessage(order.status)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderHeader;
