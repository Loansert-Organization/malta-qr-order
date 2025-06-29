import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from 'use-debounce';

interface Suggestion {
  id: string;
  title: string;
  description: string;
}

export const useAIUpsell = (
  barId: string,
  cart: any[],
  idle: boolean
) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedCart] = useDebounce(cart, 800);

  useEffect(() => {
    if (!barId) return;
    if ((debouncedCart.length > 0 && !loading) || idle) {
      fetchSuggestions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCart, idle]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('ai-upsell-suggestion', {
        body: {
          barId,
          cartItems: cart,
        },
      });
      if (error) throw error;
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.warn('AI upsell error', error);
    } finally {
      setLoading(false);
    }
  };

  return { suggestions, loading };
}; 