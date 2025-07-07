import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
// import { Badge } from "@/components/ui/badge"; // Unused - removed
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';
import { PAYMENT_METHODS } from '@/lib/constants';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

interface CartSidebarProps {
  items: CartItem[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateQuantity: (itemId: string, change: number) => void;
  onRemoveItem: (itemId: string) => void;
  currency: string;
  country: string;
  barId: string;
  barName: string;
}

const CartSidebar: React.FC<CartSidebarProps> = ({
  items,
  isOpen,
  onOpenChange,
  onUpdateQuantity,
  onRemoveItem,
  currency,
  country,
  barId,
  barName
}) => {
  const navigate = useNavigate();
  
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const handleCheckout = () => {
    // Save order to localStorage for checkout
    const orderData = {
      barId,
      barName,
      items,
      currency,
      country,
      subtotal,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    navigate(`/checkout/${barId}`);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Your Order</SheetTitle>
          <SheetDescription>
            {barName} • {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-4 py-4 border-b">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    )}
                    <p className="text-sm font-medium mt-1">
                      {currency} {item.price.toFixed(2)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.id, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => onUpdateQuantity(item.id, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-600"
                      onClick={() => onRemoveItem(item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {items.length > 0 && (
          <div className="mt-6 space-y-4">
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-base font-medium">
                <span>Subtotal</span>
                <span>{currency} {subtotal.toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
            >
              Pay with {PAYMENT_METHODS[country as keyof typeof PAYMENT_METHODS]}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              {country === 'Rwanda' 
                ? 'You will receive MoMo payment instructions' 
                : 'You will be redirected to Revolut'}
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;
