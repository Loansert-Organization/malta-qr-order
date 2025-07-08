import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  bar_id?: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string | null;
  category?: string;
  is_available?: boolean;
  volume?: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barId: string;
  barName: string;
  image_url?: string;
  volume?: string;
}

interface Bar {
  id: string;
  name: string;
  country?: string;
  currency?: string;
}

// Union type for addToCart parameter
type AddToCartItem = MenuItem | CartItem;

interface CartContextType {
  // Legacy alias for backward compatibility
  cart: CartItem[];
  // Preferred alias used by new components
  items: CartItem[];
  currentBar: Bar | null;
  // Legacy signature for existing components (MenuItem + Bar)
  addToCart: (item: AddToCartItem, bar?: Bar) => void;
  // Preferred signature used by new components
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemQuantity: (itemId: string) => number;
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

  // Overloaded addToCart: supports both legacy (item, bar) and new (CartItem)
  const addToCart = (itemOrCartItem: AddToCartItem, bar?: Bar) => {
    // Determine if it's legacy call or new call
    let item: CartItem;
    if (bar) {
      // Legacy call with separate bar param and MenuItem shape
      const legacyItem = itemOrCartItem as MenuItem;
      item = {
        id: legacyItem.id,
        name: legacyItem.name,
        price: legacyItem.price,
        quantity: 1,
        barId: bar.id,
        barName: bar.name,
        image_url: legacyItem.image_url || undefined,
        volume: legacyItem.volume
      };
    } else {
      // New call passes CartItem
      item = itemOrCartItem as CartItem;
      bar = { id: item.barId, name: item.barName } as Bar;
    }

    // If switching to a different bar, ask for confirmation
    if (bar && currentBar && currentBar.id !== bar.id && cart.length > 0) {
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

    if (bar) setCurrentBar(bar);
    
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
        return [...prevCart, item];
      }
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => (item.id === itemId ? { ...item, quantity } : item))
        .filter(item => item.quantity > 0);
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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemQuantity = (itemId: string) => {
    return cart.find(item => item.id === itemId)?.quantity || 0;
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const value: CartContextType = {
    cart,
    items: cart,
    currentBar,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getItemQuantity,
    getCartItemCount,
    isLoading
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 