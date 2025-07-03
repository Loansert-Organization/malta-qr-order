import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { CartItem, Vendor } from '@/hooks/useOrderDemo/types';
import EnhancedCheckoutFlow from '@/components/checkout/EnhancedCheckoutFlow';
import RealTimeOrderTracker from '@/components/tracking/RealTimeOrderTracker';

interface CartSectionProps {
  cart: CartItem[];
  vendor: Vendor | null;
  guestSessionId: string;
  removeFromCart: (itemId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartSection: React.FC<CartSectionProps> = ({
  cart,
  vendor,
  guestSessionId,
  removeFromCart,
  getTotalPrice,
  getTotalItems
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);

  const handleOrderSuccess = (orderId: string) => {
    setCurrentOrderId(orderId);
    setShowCheckout(false);
  };

  const handleCloseTracking = () => {
    setCurrentOrderId(null);
  };

  // Show order tracking if we have an active order
  if (currentOrderId) {
    return (
      <div className="lg:col-span-1">
        <RealTimeOrderTracker
          orderId={currentOrderId}
          guestSessionId={guestSessionId}
          onClose={handleCloseTracking}
        />
      </div>
    );
  }

  // Show checkout flow if user initiated checkout
  if (showCheckout && vendor) {
    return (
      <div className="lg:col-span-1">
        <EnhancedCheckoutFlow
          vendorId={vendor.id}
          cart={cart}
          guestSessionId={guestSessionId}
          onOrderSuccess={handleOrderSuccess}
          onClose={() => setShowCheckout(false)}
        />
      </div>
    );
  }

  return (
    <div className="lg:col-span-1">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Order ({getTotalItems()} items)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Your cart is empty</p>
              <p className="text-sm">Browse the menu to add items</p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{item.menu_item?.name || 'Unknown Item'}</span>
                          <span className="text-gray-500 text-sm">€{item.unit_price.toFixed(2)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="px-3 py-1 bg-white rounded border text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>€{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>€0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>€{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
              >
                Proceed to Checkout
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CartSection;