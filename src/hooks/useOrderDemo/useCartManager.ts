
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, CartItem } from './types';

export const useCartManager = (trackInteraction: (action: string, metadata?: any) => Promise<void>) => {
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = async (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });

    // Track interaction for AI insights
    await trackInteraction('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      price: item.price
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, cartItem) => {
        if (cartItem.id === itemId) {
          if (cartItem.quantity > 1) {
            acc.push({ ...cartItem, quantity: cartItem.quantity - 1 });
          }
        } else {
          acc.push(cartItem);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    cart,
    addToCart,
    removeFromCart,
    getTotalPrice,
    getTotalItems
  };
};
