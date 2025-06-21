
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

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
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  onAddToCart,
  onRemoveFromCart,
  getTotalPrice,
  getTotalItems
}) => {
  return (
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
            <p className="text-gray-500 text-center py-4">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-sm">{item.name}</h5>
                    <p className="text-xs text-gray-500">
                      €{parseFloat(item.price.toString()).toFixed(2)} each
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveFromCart(item.id)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-semibold">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAddToCart(item)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center font-bold">
                  <span>Total:</span>
                  <span>€{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>
              
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CartSidebar;
