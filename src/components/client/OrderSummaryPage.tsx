
import React, { useState } from 'react';
import { ArrowLeft, Check, CreditCard, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

interface OrderSummaryPageProps {
  items: OrderItem[];
  vendorName: string;
  onBack: () => void;
  onSubmitOrder: (orderData: any) => void;
}

const OrderSummaryPage: React.FC<OrderSummaryPageProps> = ({
  items,
  vendorName,
  onBack,
  onSubmitOrder
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'revolut'>('stripe');
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const estimatedTime = 25; // minutes

  const handleSubmitOrder = () => {
    if (!customerName || !agreedToTerms) {
      alert('Please fill in required fields and agree to terms');
      return;
    }

    const orderData = {
      items,
      customerName,
      customerPhone,
      notes,
      paymentMethod,
      whatsappConsent,
      agreedToTerms,
      totalAmount: totalPrice,
      estimatedReadyTime: new Date(Date.now() + estimatedTime * 60000)
    };

    onSubmitOrder(orderData);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center space-x-3 border-b border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Order Summary</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Order Items */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Your Order - {vendorName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="font-medium text-white">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-400">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-white">{item.quantity}x €{item.price.toFixed(2)}</p>
                  <p className="text-blue-400 font-semibold">€{(item.quantity * item.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-3 flex justify-between items-center text-lg font-semibold">
              <span className="text-white">Total</span>
              <span className="text-blue-400">€{totalPrice.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName" className="text-gray-300">Name *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Your name"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone" className="text-gray-300">Phone (optional)</Label>
              <Input
                id="customerPhone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+356 XXXX XXXX"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-gray-300">Special Requests</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests or allergies..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('stripe')}
                className="flex items-center space-x-2 h-12"
              >
                <CreditCard className="h-4 w-4" />
                <span>Stripe</span>
              </Button>
              <Button
                variant={paymentMethod === 'revolut' ? 'default' : 'outline'}
                onClick={() => setPaymentMethod('revolut')}
                className="flex items-center space-x-2 h-12"
              >
                <Smartphone className="h-4 w-4" />
                <span>Revolut</span>
              </Button>
            </div>
            <p className="text-sm text-gray-400">
              Estimated preparation time: <span className="text-blue-400 font-semibold">{estimatedTime} minutes</span>
            </p>
          </CardContent>
        </Card>

        {/* Consents */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="whatsapp"
                checked={whatsappConsent}
                onCheckedChange={(checked) => setWhatsappConsent(checked === true)}
              />
              <Label htmlFor="whatsapp" className="text-sm text-gray-300">
                I consent to receive order updates via WhatsApp (optional)
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                required
              />
              <Label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the Terms & Conditions and Privacy Policy *
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          onClick={handleSubmitOrder}
          disabled={!customerName || !agreedToTerms}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
        >
          Place Order - €{totalPrice.toFixed(2)}
        </Button>
      </div>
    </div>
  );
};

export default OrderSummaryPage;
