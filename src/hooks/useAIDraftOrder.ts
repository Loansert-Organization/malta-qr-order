import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  name: string;
  price_local: number;
  suggested_qty?: number;
}

interface AIDraftOrderPayload {
  suggestedItems: MenuItem[];
  reasoning: string;
  estimatedTotal: number;
  recommendations: string[];
}

interface AIDraftOrder {
  id: string;
  payload: AIDraftOrderPayload;
  generated_for: string;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  ai_reasoning?: string;
  created_at: string;
}

interface UseAIDraftOrderReturn {
  draftOrders: AIDraftOrder[];
  loading: boolean;
  error: string | null;
  acceptDraftOrder: (draftOrderId: string) => Promise<void>;
  rejectDraftOrder: (draftOrderId: string) => Promise<void>;
  createDraftOrder: (suggestedItems: MenuItem[], reasoning: string) => Promise<void>;
  refresh: () => void;
}

export const useAIDraftOrder = (): UseAIDraftOrderReturn => {
  const [draftOrders, setDraftOrders] = useState<AIDraftOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = localStorage.getItem('icupa_session_id') || 
    (() => {
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('icupa_session_id', newSessionId);
      return newSessionId;
    })();

  const fetchDraftOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('ai_draft_orders')
        .select('*')
        .eq('session_id', sessionId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching draft orders:', fetchError);
        setError(fetchError.message);
        return;
      }

      setDraftOrders(data || []);
    } catch (err) {
      console.error('Draft orders fetch error:', err);
      setError('Failed to load AI suggestions');
    } finally {
      setLoading(false);
    }
  };

  const acceptDraftOrder = async (draftOrderId: string) => {
    try {
      setLoading(true);

      // Find the draft order
      const draftOrder = draftOrders.find(d => d.id === draftOrderId);
      if (!draftOrder) {
        throw new Error('Draft order not found');
      }

      // Add all suggested items to cart
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .select('id')
        .eq('session_id', sessionId)
        .eq('status', 'active')
        .single();

      let cartId = cartData?.id;

      // Create cart if doesn't exist
      if (!cartId) {
        const { data: newCart, error: createCartError } = await supabase
          .from('carts')
          .insert({
            session_id: sessionId,
            status: 'active'
          })
          .select('id')
          .single();

        if (createCartError) throw createCartError;
        cartId = newCart.id;
      }

      // Add suggested items to cart
      const cartInserts = draftOrder.payload.suggestedItems.map(item => ({
        cart_id: cartId,
        item_id: item.id,
        qty: item.suggested_qty || 1,
        special_instructions: `AI Recommended: ${draftOrder.ai_reasoning || 'Smart suggestion'}`
      }));

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(cartInserts);

      if (insertError) throw insertError;

      // Mark draft order as accepted
      await supabase
        .from('ai_draft_orders')
        .update({ status: 'accepted' })
        .eq('id', draftOrderId);

      // Refresh the list
      await fetchDraftOrders();

    } catch (err) {
      console.error('Accept draft order error:', err);
      setError('Failed to accept AI suggestion');
    } finally {
      setLoading(false);
    }
  };

  const rejectDraftOrder = async (draftOrderId: string) => {
    try {
      setLoading(true);

      await supabase
        .from('ai_draft_orders')
        .update({ status: 'rejected' })
        .eq('id', draftOrderId);

      // Remove from local state
      setDraftOrders(prev => prev.filter(d => d.id !== draftOrderId));

    } catch (err) {
      console.error('Reject draft order error:', err);
      setError('Failed to reject AI suggestion');
    } finally {
      setLoading(false);
    }
  };

  const createDraftOrder = async (suggestedItems: MenuItem[], reasoning: string) => {
    try {
      setLoading(true);

      const estimatedTotal = suggestedItems.reduce((total, item) => 
        total + (item.price_local * (item.suggested_qty || 1)), 0
      );

      const payload: AIDraftOrderPayload = {
        suggestedItems,
        reasoning,
        estimatedTotal,
        recommendations: suggestedItems.map(item => item.name)
      };

      const { error } = await supabase
        .from('ai_draft_orders')
        .insert({
          session_id: sessionId,
          payload,
          ai_reasoning: reasoning,
          status: 'pending'
        });

      if (error) throw error;

      // Refresh the list
      await fetchDraftOrders();

    } catch (err) {
      console.error('Create draft order error:', err);
      setError('Failed to create AI suggestion');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    fetchDraftOrders();
  };

  useEffect(() => {
    fetchDraftOrders();

    // Set up realtime subscription for new draft orders
    const subscription = supabase
      .channel('draft_orders_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ai_draft_orders',
          filter: `session_id=eq.${sessionId}`
        }, 
        () => {
          fetchDraftOrders();
        }
      )
      .subscribe();

    // Auto-expire old draft orders (older than 1 hour)
    const expireInterval = setInterval(async () => {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      await supabase
        .from('ai_draft_orders')
        .update({ status: 'expired' })
        .eq('session_id', sessionId)
        .eq('status', 'pending')
        .lt('created_at', oneHourAgo);
      
      fetchDraftOrders();
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => {
      subscription.unsubscribe();
      clearInterval(expireInterval);
    };
  }, [sessionId]);

  return {
    draftOrders,
    loading,
    error,
    acceptDraftOrder,
    rejectDraftOrder,
    createDraftOrder,
    refresh
  };
};

export default useAIDraftOrder;
