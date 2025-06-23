
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  // Show checkout flow if in checkout mode
  if (showCheckout && vendor) {
    return (
      <div className="lg:col-span-1">
        <EnhancedCheckoutFlow
          cart={cart}
          vendorId={vendor.id}
          guestSessionId={guestSessionId}
          onOrderSuccess={handleOrderSuccess}
          onClose={() => setShowCheckout(false)}
        />
      </div>
    );
  }

  // Regular cart view
  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Your Order
            {cart.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTotalItems()}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cart.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some delicious items to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">€{item.price.toFixed(2)} each</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (item.quantity > 1) {
                              // This would need to be passed as a prop or handled differently
                              // For now, we'll just remove the item
                              removeFromCart(item.id);
                            } else {
                              removeFromCart(item.id);
                            }
                          }}
                          className="h-6 w-6 p-0"
                        >
                          {item.quantity > 1 ? <Minus className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                        
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // This would need to be passed as a prop
                            // For now, just show the quantity
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right min-w-[60px]">
                        <p className="text-sm font-semibold">
                          €{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Cart Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal ({getTotalItems()} items)</span>
                  <span className="text-sm font-medium">€{getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Service Fee</span>
                  <span className="text-sm font-medium">€0.00</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg">€{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                Proceed to Checkout
              </Button>

              {/* Vendor Info */}
              {vendor && (
                <div className="text-xs text-gray-500 text-center">
                  <p>You're ordering from {vendor.name}</p>
                  {vendor.location && <p>{vendor.location}</p>}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CartSection;
