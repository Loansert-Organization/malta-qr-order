
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items: Array<{
    quantity: number;
    menu_item: {
      name: string;
    };
  }>;
}

export const useOrderStatus = (orderId: string, isOpen: boolean) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            menu_item:menu_items (
              name
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      setOrder(data as Order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrder();

      // Set up real-time subscription for order updates
      const channel = supabase
        .channel(`order-${orderId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        }, () => {
          fetchOrder();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, orderId]);

  return { order, loading, fetchOrder };
};
