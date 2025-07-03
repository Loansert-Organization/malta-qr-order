import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  bar_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Bar {
  id: string;
  name: string;
  country: string;
  currency?: string;
}

interface CartContextType {
  cart: CartItem[];
  currentBar: Bar | null;
  addToCart: (item: MenuItem, bar: Bar) => void;
  updateQuantity: (itemId: string, change: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentBar, setCurrentBar] = useState<Bar | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    const savedBar = localStorage.getItem('currentBar');
    
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
    
    if (savedBar) {
      try {
        setCurrentBar(JSON.parse(savedBar));
      } catch (error) {
        console.error('Error loading current bar:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  // Save current bar to localStorage
  useEffect(() => {
    if (currentBar) {
      localStorage.setItem('currentBar', JSON.stringify(currentBar));
    } else {
      localStorage.removeItem('currentBar');
    }
  }, [currentBar]);

  const addToCart = (item: MenuItem, bar: Bar) => {
    // If switching to a different bar, ask for confirmation
    if (currentBar && currentBar.id !== bar.id && cart.length > 0) {
      const confirmSwitch = window.confirm(
        `You have items from ${currentBar.name} in your cart. Switching to ${bar.name} will clear your current cart. Continue?`
      );
      
      if (!confirmSwitch) {
        return;
      }
      
      // Clear cart when switching bars
      setCart([]);
      toast({
        title: "Cart cleared",
        description: `Now ordering from ${bar.name}`,
      });
    }

    setCurrentBar(bar);
    
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        toast({
          title: "Quantity updated",
          description: `${item.name} quantity increased`,
        });
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        toast({
          title: "Added to cart",
          description: `${item.name} has been added to your cart`,
        });
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    
    toast({
      title: "Removed from cart",
      description: "Item has been removed from your cart",
    });
  };

  const clearCart = () => {
    setCart([]);
    setCurrentBar(null);
    localStorage.removeItem('cart');
    localStorage.removeItem('currentBar');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    currentBar,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
    isLoading
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 