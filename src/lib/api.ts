import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Initialize Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// Session management
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('icupa_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('icupa_session_id', sessionId);
  }
  return sessionId;
};

// Helper: fetch menu by category
export const fetchMenu = async (categoryName?: string) => {
  let query = supabase
    .from('menu_items')
    .select(`
      *,
      menu_categories(name, icon)
    `)
    .eq('is_available', true);

  if (categoryName && categoryName !== 'all') {
    if (categoryName === 'trending') {
      // For trending, we'll need a more sophisticated query later
      // For now, just return recent items
      query = query.order('created_at', { ascending: false }).limit(20);
    } else {
      query = query.eq('menu_categories.name', categoryName);
    }
  }

  return query.order('name');
};

// Helper: fetch menu categories
export const fetchCategories = () => {
  return supabase
    .from('menu_categories')
    .select('*')
    .order('sort_order');
};

// Helper: fetch active promotions
export const fetchPromotions = () => {
  return supabase
    .from('promotions')
    .select('*')
    .eq('is_active', true)
    .gte('valid_until', new Date().toISOString())
    .order('created_at', { ascending: false });
};

// Helper: get user cart
export const fetchCart = (sessionId: string) => {
  return supabase
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
};

// Helper: create or get cart
export const ensureCart = async (sessionId: string): Promise<string> => {
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

// Helper: add item to cart
export const addToCart = async (itemId: string, qty = 1, specialInstructions?: string) => {
  const sessionId = getSessionId();
  const cartId = await ensureCart(sessionId);

  // Check if item already exists
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, qty')
    .eq('cart_id', cartId)
    .eq('item_id', itemId)
    .single();

  if (existingItem) {
    // Update existing item
    return supabase
      .from('cart_items')
      .update({ 
        qty: existingItem.qty + qty,
        special_instructions: specialInstructions 
      })
      .eq('id', existingItem.id);
  } else {
    // Add new item
    return supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        item_id: itemId,
        qty,
        special_instructions: specialInstructions
      });
  }
};

// Helper: update cart item quantity
export const updateCartItem = (cartItemId: string, qty: number) => {
  if (qty <= 0) {
    return supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);
  }

  return supabase
    .from('cart_items')
    .update({ qty })
    .eq('id', cartItemId);
};

// Helper: remove item from cart
export const removeFromCart = (cartItemId: string) => {
  return supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId);
};

// Helper: clear cart
export const clearCart = async (sessionId: string) => {
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('session_id', sessionId)
    .eq('status', 'active')
    .single();

  if (cart) {
    return supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id);
  }
};

// Helper: create order from cart
export const createOrder = async (sessionId: string, customerInfo: {
  name?: string;
  phone?: string;
  tableNumber?: string;
  specialRequests?: string;
}) => {
  const { data: cart } = await fetchCart(sessionId);
  if (!cart || !cart.cart_items || cart.cart_items.length === 0) {
    throw new Error('Cart is empty');
  }

  const total = cart.cart_items.reduce((sum: number, item: any) => 
    sum + (item.qty * item.menu_items.price_local), 0
  );

  const orderData = {
    session_id: sessionId,
    cart_snapshot: cart.cart_items,
    total_local: total,
    currency: cart.cart_items[0]?.menu_items?.currency || 'RWF',
    table_number: customerInfo.tableNumber,
    customer_name: customerInfo.name,
    customer_phone: customerInfo.phone,
    special_requests: customerInfo.specialRequests,
    status: 'pending'
  };

  const { data: order, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) throw error;

  // Mark cart as ordered
  await supabase
    .from('carts')
    .update({ status: 'ordered' })
    .eq('id', cart.id);

  return order;
};

// Helper: fetch user orders
export const fetchOrders = (sessionId: string) => {
  return supabase
    .from('orders')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });
};

// Edge function helpers
export const callEdgeFunction = async (functionName: string, payload: any) => {
  const response = await fetch(
    `${supabase.supabaseUrl}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabase.supabaseKey}`,
        'Content-Type': 'application/json',
        'x-session-id': getSessionId()
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error(`Edge function ${functionName} failed: ${response.statusText}`);
  }

  return response.json();
};

// AI Sommelier helper
export const askAISommelier = (message: string, cartItems: any[] = []) => {
  return callEdgeFunction('ai-sommelier', {
    message,
    sessionId: getSessionId(),
    cartItems,
    queryType: detectQueryType(message)
  });
};

const detectQueryType = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('pair') || lowerMessage.includes('wine') || lowerMessage.includes('drink')) {
    return 'pairing';
  }
  if (lowerMessage.includes('allergen') || lowerMessage.includes('allergy')) {
    return 'allergen';
  }
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
    return 'recommendation';
  }
  return 'general';
};

// Export types for use in components
export type { Database } from '@/integrations/supabase/types';
