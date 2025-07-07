import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  Receipt, 
  X,
  Copy,
  Share2,
  Download
} from 'lucide-react';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'confirmed' | 'pending' | 'preparing' | 'ready' | 'completed';
    estimatedTime: string;
    barName: string;
    barAddress: string;
    barPhone: string;
    customerName: string;
    customerPhone: string;
    specialInstructions?: string;
    createdAt: string;
  };
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order
}) => {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Order Confirmed';
      case 'pending': return 'Pending Confirmation';
      case 'preparing': return 'Preparing Your Order';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Order Completed';
      default: return 'Unknown Status';
    }
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
  };

  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Order',
        text: `Order #${order.id} at ${order.barName}`,
        url: window.location.href
      });
    }
  };

  const downloadReceipt = () => {
    // In a real app, this would generate and download a PDF receipt
    const receiptContent = `
Order Receipt
Order #: ${order.id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Bar: ${order.barName}

Items:
${order.items.map(item => `${item.name} x${item.quantity} - €${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Total: €${order.total.toFixed(2)}
    `;
    
    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${order.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">Order Confirmation</h2>
              <p className="text-muted-foreground">Order #{order.id}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold">{getStatusText(order.status)}</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated ready time: {order.estimatedTime}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Bar Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{order.barName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{order.barAddress}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>{order.barPhone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Order Items
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        x{item.quantity}
                      </Badge>
                    </div>
                    {item.notes && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Note: {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="font-medium">
                    €{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>Total</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name:</span>
                <span className="text-sm font-medium">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Phone:</span>
                <span className="text-sm font-medium">{order.customerPhone}</span>
              </div>
              {order.specialInstructions && (
                <div className="pt-2">
                  <span className="text-sm text-muted-foreground">Special Instructions:</span>
                  <p className="text-sm mt-1">{order.specialInstructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyOrderId} variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy Order ID
            </Button>
            <Button onClick={shareOrder} variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Order
            </Button>
            <Button onClick={downloadReceipt} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          {/* Close Button */}
          <div className="flex justify-end">
            <Button onClick={onClose} className="w-full md:w-auto">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationModal; 