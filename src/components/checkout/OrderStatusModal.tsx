
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Utensils, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  vendorName: string;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  orderId,
  vendorName
}) => {
  const [orderStatus, setOrderStatus] = useState<'pending' | 'confirmed' | 'preparing' | 'ready'>('pending');
  const [estimatedTime, setEstimatedTime] = useState<string>('15-25 minutes');

  useEffect(() => {
    if (isOpen && orderId) {
      // Simulate order status progression
      const statusProgression = ['pending', 'confirmed', 'preparing', 'ready'] as const;
      let currentIndex = 0;

      const interval = setInterval(() => {
        if (currentIndex < statusProgression.length - 1) {
          currentIndex++;
          setOrderStatus(statusProgression[currentIndex]);
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, orderId]);

  const getStatusInfo = () => {
    switch (orderStatus) {
      case 'pending':
        return {
          icon: <Clock className="h-6 w-6 text-yellow-500" />,
          title: 'Order Received',
          description: 'Your order is being processed',
          color: 'bg-yellow-100 text-yellow-800'
        };
      case 'confirmed':
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          title: 'Order Confirmed',
          description: 'Your order has been confirmed by the restaurant',
          color: 'bg-green-100 text-green-800'
        };
      case 'preparing':
        return {
          icon: <Utensils className="h-6 w-6 text-blue-500" />,
          title: 'Preparing Your Order',
          description: 'The kitchen is working on your delicious meal',
          color: 'bg-blue-100 text-blue-800'
        };
      case 'ready':
        return {
          icon: <MapPin className="h-6 w-6 text-purple-500" />,
          title: 'Order Ready!',
          description: 'Your order is ready for pickup or delivery',
          color: 'bg-purple-100 text-purple-800'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Order Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Display */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              {statusInfo.icon}
            </div>
            <h3 className="text-lg font-semibold mb-2">{statusInfo.title}</h3>
            <p className="text-gray-600 mb-4">{statusInfo.description}</p>
            <Badge className={statusInfo.color}>
              {orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1)}
            </Badge>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Restaurant:</span>
                <span className="font-medium">{vendorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <span className="font-medium">#{orderId.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Time:</span>
                <span className="font-medium">{estimatedTime}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button onClick={onClose} className="w-full">
            {orderStatus === 'ready' ? 'Great, Thanks!' : 'Got It'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusModal;
