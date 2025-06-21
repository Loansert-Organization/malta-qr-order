
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import CheckoutModal from './checkout/CheckoutModal';
import OrderStatusModal from './checkout/OrderStatusModal';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  popular: boolean;
  prep_time?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CartSidebarProps {
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  vendorId: string;
  guestSessionId: string;
  onOrderComplete?: (orderId: string) => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  getTotalPrice,
  getTotalItems,
  vendorId,
  guestSessionId,
  onOrderComplete
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  const handleOrderComplete = (orderId: string) => {
    setCurrentOrderId(orderId);
    setShowOrderStatus(true);
    // Clear cart after successful order
    cart.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        onRemoveFromCart(item.id);
      }
    });
    // Call parent callback if provided
    if (onOrderComplete) {
      onOrderComplete(orderId);
    }
  };

  const removeAllOfItem = (itemId: string) => {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
      for (let i = 0; i < item.quantity; i++) {
        onRemoveFromCart(itemId);
      }
    }
  };

  return (
    <>
      <div className="sticky top-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Your Order ({getTotalItems()})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Your cart is empty</p>
                <p className="text-sm text-gray-400">Add some items to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{item.name}</h5>
                        <p className="text-xs text-gray-500">
                          €{parseFloat(item.price.toString()).toFixed(2)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAllOfItem(item.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onRemoveFromCart(item.id)}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAddToCart(item)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg mb-4">
                    <span>Total:</span>
                    <span className="text-primary">€{getTotalPrice().toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => setShowCheckout(true)}
                    disabled={cart.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        cart={cart}
        totalPrice={getTotalPrice()}
        vendorId={vendorId}
        guestSessionId={guestSessionId}
        onOrderComplete={handleOrderComplete}
      />

      <OrderStatusModal
        isOpen={showOrderStatus}
        onClose={() => setShowOrderStatus(false)}
        orderId={currentOrderId}
      />
    </>
  );
};

export default CartSidebar;
