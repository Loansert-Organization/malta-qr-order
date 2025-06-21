
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';

interface OrderStatusLoadingProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderStatusLoading: React.FC<OrderStatusLoadingProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="flex items-center justify-center p-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Loading order status...</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusLoading;
