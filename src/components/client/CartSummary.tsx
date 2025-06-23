
import React from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
  modifiers?: string[];
}

interface CartSummaryProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const CartSummary: React.FC<CartSummaryProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isOpen,
  onToggle
}) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          onClick={onToggle}
          className="bg-blue-600 hover:bg-blue-700 rounded-full p-4 shadow-lg"
        >
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs">
              {totalItems}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end md:items-center justify-center p-4">
      <Card className="w-full max-w-lg max-h-[80vh] flex flex-col">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Your Order</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Your cart is empty</p>
              <p className="text-sm">Add some delicious items to get started!</p>
            </div>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600">{item.description}</p>
                    )}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.modifiers.map((modifier, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {modifier}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <p className="text-blue-600 font-semibold">€{item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total ({totalItems} items)</span>
                  <span className="text-blue-600">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </CardContent>

        {items.length > 0 && (
          <div className="p-4 border-t">
            <Button
              onClick={onCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CartSummary;
