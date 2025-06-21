
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home, Receipt } from 'lucide-react';

interface OrderSuccessProps {
  orderId: string;
  onClose: () => void;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderId, onClose }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-xl text-green-600">Order Confirmed!</CardTitle>
          <CardDescription>
            Your order has been successfully submitted and is being prepared.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Order ID</p>
            <p className="font-mono text-sm font-medium">{orderId.slice(0, 8)}...</p>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>• You will receive updates on your order status</p>
            <p>• Estimated preparation time: 15-25 minutes</p>
            <p>• Thank you for your order!</p>
          </div>
          
          <div className="flex flex-col space-y-2 pt-4">
            <Button onClick={onClose} className="w-full">
              <Receipt className="h-4 w-4 mr-2" />
              View Order Details
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'} 
              className="w-full"
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderSuccess;
