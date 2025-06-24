
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CreditCard, Smartphone, ExternalLink } from 'lucide-react';

interface PaymentInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethod: 'stripe' | 'revolut';
  amount: number;
  orderDetails: {
    orderId: string;
    vendorName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  };
}

const PaymentInstructionsModal: React.FC<PaymentInstructionsModalProps> = ({
  isOpen,
  onClose,
  paymentMethod,
  amount,
  orderDetails
}) => {
  const renderStripeInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
        <CreditCard className="h-8 w-8 text-blue-600" />
        <div>
          <h3 className="font-semibold text-blue-900">Secure Card Payment</h3>
          <p className="text-sm text-blue-700">Pay securely with your credit or debit card</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium">Payment Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Proceed to Payment" below</li>
          <li>You'll be redirected to Stripe's secure payment page</li>
          <li>Enter your card details (Visa, Mastercard, American Express accepted)</li>
          <li>Complete the payment</li>
          <li>You'll be redirected back with confirmation</li>
        </ol>
      </div>
      
      <div className="p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          🔒 Your payment is secured by Stripe's industry-leading encryption
        </p>
      </div>
    </div>
  );

  const renderRevolutInstructions = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
        <Smartphone className="h-8 w-8 text-purple-600" />
        <div>
          <h3 className="font-semibold text-purple-900">Revolut Payment</h3>
          <p className="text-sm text-purple-700">Pay instantly with Revolut</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <h4 className="font-medium">Payment Steps:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Click "Pay with Revolut" below</li>
          <li>You'll be redirected to Revolut's payment page</li>
          <li>Log in to your Revolut account or use the app</li>
          <li>Confirm the payment amount and details</li>
          <li>Complete the payment</li>
        </ol>
      </div>
      
      <div className="p-3 bg-green-50 rounded-lg">
        <p className="text-sm text-green-800">
          ⚡ Instant payment processing with Revolut
        </p>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Instructions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Order #{orderDetails.orderId.slice(-8)}</span>
                <span>{orderDetails.vendorName}</span>
              </div>
              {orderDetails.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.quantity}x {item.name}</span>
                  <span>€{(item.quantity * item.price).toFixed(2)}</span>
                </div>
              ))}
              <hr className="my-2" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>€{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Instructions */}
          {paymentMethod === 'stripe' ? renderStripeInstructions() : renderRevolutInstructions()}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">
              <ExternalLink className="h-4 w-4 mr-2" />
              {paymentMethod === 'stripe' ? 'Proceed to Payment' : 'Pay with Revolut'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentInstructionsModal;
