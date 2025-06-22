
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2, CreditCard } from 'lucide-react';
import { CartItem } from '@/hooks/useOrderDemo/types';
import CheckoutModal from '@/components/checkout/CheckoutModal';
import OrderStatusModal from '@/components/checkout/OrderStatusModal';

interface CartSectionProps {
  cart: CartItem[];
  vendor: any;
  guestSessionId: string;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  vendor,
  guestSessionId,
  removeFromCart,
  updateQuantity,
  clearCart,
  getTotalPrice,
  getTotalItems
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const handleOrderComplete = (orderId: string) => {
    setCurrentOrderId(orderId);
    setShowCheckout(false);
    clearCart();
  };

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  return (
    <>
      <div className="lg:col-span-1">
        <Card className="sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Your Order</span>
              {totalItems > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {totalItems} {totalItems === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Your cart is empty</p>
                <p className="text-xs mt-1">Add some delicious items to get started!</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">€{item.price.toFixed(2)} each</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-sm">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service fee</span>
                    <span>Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                  </Button>
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    size="sm"
                  >
                    Clear Cart
                  </Button>
                </div>

                {/* Order Info */}
                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Orders are processed in real-time</p>
                  <p>• You'll receive WhatsApp confirmation</p>
                  <p>• Estimated prep time: 15-25 minutes</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        totalPrice={totalPrice}
        vendorId={vendor.id}
        guestSessionId={guestSessionId}
        onOrderComplete={handleOrderComplete}
      />

      {/* Order Status Modal */}
      {currentOrderId && (
        <OrderStatusModal
          isOpen={!!currentOrderId}
          onClose={() => setCurrentOrderId(null)}
          orderId={currentOrderId}
          vendorName={vendor.name}
        />
      )}
    </>
  );
};

export default CartSection;
