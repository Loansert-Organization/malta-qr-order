import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  price_local: number;
  currency: string;
  image_url?: string;
  description?: string;
}

interface CartItem {
  id: string;
  item_id: string;
  qty: number;
  special_instructions?: string;
  menu_items: MenuItem;
}

interface Cart {
  id: string;
  items: CartItem[];
  total: number;
  itemCount: number;
  currency: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (itemId: string, qty?: number, specialInstructions?: string) => Promise<void>;
  updateCartItem: (cartItemId: string, qty: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sessionId = localStorage.getItem('icupa_session_id') || 
    (() => {
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('icupa_session_id', newSessionId);
      return newSessionId;
    })();

  const fetchCart = async () => {
    try {
      const { data: cartData, error } = await supabase
        .from('carts')
        .select(`
          id,
          cart_items(
            id,
            item_id,
            qty,
            special_instructions,
            menu_items(
              id,
              name,
              price_local,
              currency,
              image_url,
              description
            )
          )
        `)
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') { // Not found is OK
        console.error('Error fetching cart:', error);
        return;
      }

      if (cartData) {
        const items = cartData.cart_items || [];
        const total = items.reduce((sum: number, item: CartItem) => 
          sum + (item.qty * item.menu_items.price_local), 0
        );
        const itemCount = items.reduce((sum: number, item: CartItem) => sum + item.qty, 0);
        
        setCart({
          id: cartData.id,
          items,
          total,
          itemCount,
          currency: items[0]?.menu_items?.currency || 'RWF'
        });
      } else {
        setCart({
          id: '',
          items: [],
          total: 0,
          itemCount: 0,
          currency: 'RWF'
        });
      }
    } catch (error) {
      console.error('Cart fetch error:', error);
    }
  };

  const ensureCart = async (): Promise<string> => {
    if (cart?.id) return cart.id;

    const { data: existingCart } = await supabase
      .from('carts')
      .select('id')
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .single();

    if (existingCart) return existingCart.id;

    const { data: newCart, error } = await supabase
      .from('carts')
      .insert({
        session_id: sessionId,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) throw error;
    return newCart.id;
  };

  const addToCart = async (itemId: string, qty = 1, specialInstructions?: string) => {
    try {
      setLoading(true);
      const cartId = await ensureCart();

      // Check if item already exists in cart
      const { data: existingItem } = await supabase
        .from('cart_items')
        .select('id, qty')
        .eq('cart_id', cartId)
        .eq('item_id', itemId)
        .single();

      if (existingItem) {
        // Update existing item
        await supabase
          .from('cart_items')
          .update({ 
            qty: existingItem.qty + qty,
            special_instructions: specialInstructions 
          })
          .eq('id', existingItem.id);
      } else {
        // Add new item
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            item_id: itemId,
            qty,
            special_instructions: specialInstructions
          });
      }

      await fetchCart();
      
      toast({
        title: "Added to cart",
        description: `Item${qty > 1 ? 's' : ''} added successfully`,
      });

      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

    } catch (error) {
      console.error('Add to cart error:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartItemId: string, qty: number) => {
    try {
      setLoading(true);
      
      if (qty <= 0) {
        await removeFromCart(cartItemId);
        return;
      }

      await supabase
        .from('cart_items')
        .update({ qty })
        .eq('id', cartItemId);

      await fetchCart();
    } catch (error) {
      console.error('Update cart item error:', error);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      await fetchCart();
      
      toast({
        title: "Removed from cart",
        description: "Item removed successfully",
      });
    } catch (error) {
      console.error('Remove from cart error:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      if (cart?.id) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cart.id);
      }

      await fetchCart();
      
      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      });
    } catch (error) {
      console.error('Clear cart error:', error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    await fetchCart();
  };

  useEffect(() => {
    fetchCart();

    // Set up realtime subscription
    const cartSubscription = supabase
      .channel('cart_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'cart_items',
          filter: `cart_id=eq.${cart?.id || ''}`
        }, 
        () => {
          fetchCart();
        }
      )
      .subscribe();

    return () => {
      cartSubscription.unsubscribe();
    };
  }, [cart?.id]);

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
