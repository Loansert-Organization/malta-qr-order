
import React from 'react';
import { Check, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrderSuccessPageProps {
  orderNumber: string;
  estimatedTime: number;
  vendorName: string;
  totalAmount: number;
  onNewOrder: () => void;
}

const OrderSuccessPage: React.FC<OrderSuccessPageProps> = ({
  orderNumber,
  estimatedTime,
  vendorName,
  totalAmount,
  onNewOrder
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-white">Order Confirmed!</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6 text-center">
          <div>
            <p className="text-gray-300 mb-2">Thank you for your order at</p>
            <h2 className="text-xl font-bold text-white">{vendorName}</h2>
          </div>

          <div className="bg-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Order Number:</span>
              <span className="text-white font-mono">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total:</span>
              <span className="text-blue-400 font-semibold">€{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Estimated Time:</span>
              <div className="flex items-center space-x-1 text-green-400">
                <Clock className="h-4 w-4" />
                <span className="font-semibold">{estimatedTime} min</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <span className="text-blue-400 font-semibold">What's Next?</span>
            </div>
            <p className="text-sm text-gray-300">
              Your order is being prepared. We'll notify you when it's ready for pickup. 
              Keep an eye on your phone for updates!
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={onNewOrder}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Place Another Order
            </Button>
            <p className="text-xs text-gray-500">
              Order confirmation sent. Thank you for choosing {vendorName}!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccessPage;
