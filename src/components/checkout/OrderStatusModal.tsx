
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useOrderStatus } from '@/hooks/useOrderStatus';
import OrderStatusLoading from './OrderStatusLoading';
import OrderHeader from './OrderHeader';
import OrderItemsList from './OrderItemsList';
import PaymentStatus from './PaymentStatus';

interface OrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
}

const OrderStatusModal: React.FC<OrderStatusModalProps> = ({
  isOpen,
  onClose,
  orderId
}) => {
  const { order, loading } = useOrderStatus(orderId, isOpen);

  if (loading) {
    return <OrderStatusLoading isOpen={isOpen} onClose={onClose} />;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Status</DialogTitle>
        </DialogHeader>

        {order && (
          <div className="space-y-6">
            <OrderHeader order={order} />
            <OrderItemsList orderItems={order.order_items} totalAmount={order.total_amount} />
            <PaymentStatus paymentStatus={order.payment_status} />
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusModal;
