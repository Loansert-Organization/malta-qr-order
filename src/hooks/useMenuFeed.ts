import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MenuFeedData {
  greeting: {
    message: string;
    subtext: string;
  };
  promotions: Promotion[];
  categories: Category[];
  menuItems: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
  cart: {
    itemCount: number;
    total: number;
  };
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_until: string;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price_local: number;
  currency: string;
  image_url?: string;
  tags?: string[];
  prep_time_minutes?: number;
  menu_categories?: {
    name: string;
  };
}

interface UseMenuFeedReturn {
  data: MenuFeedData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
  loadMore: () => void;
  setCategory: (category: string) => void;
  currentCategory: string;
}

export const useMenuFeed = (initialCategory = 'all'): UseMenuFeedReturn => {
  const [data, setData] = useState<MenuFeedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState(initialCategory);
  const [currentPage, setCurrentPage] = useState(1);

  const sessionId = localStorage.getItem('icupa_session_id') || 
    (() => {
      const newSessionId = crypto.randomUUID();
      localStorage.setItem('icupa_session_id', newSessionId);
      return newSessionId;
    })();

  const fetchFeed = async (category: string, page: number, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${supabase.supabaseUrl}/functions/v1/generate-home-feed-menu?category=${category}&page=${page}&limit=20`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${supabase.supabaseKey}`,
            'Content-Type': 'application/json',
            'x-session-id': sessionId
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        if (reset || page === 1) {
          setData(result.data);
        } else {
          // Append new items for pagination
          setData(prev => prev ? {
            ...result.data,
            menuItems: [...prev.menuItems, ...result.data.menuItems]
          } : result.data);
        }
      } else {
        // Use fallback data if available
        if (result.fallback) {
          setData(result.fallback);
        }
        setError(result.error || 'Failed to load menu feed');
      }
    } catch (err) {
      console.error('Menu feed error:', err);
      setError('Failed to load menu feed');
      
      // Provide offline fallback
      setData({
        greeting: { message: 'Welcome to ICUPA!', subtext: 'Offline mode' },
        promotions: [],
        categories: [
          { id: '1', name: 'All', icon: '🍽️', sort_order: 0 },
          { id: '2', name: 'Drinks', icon: '🍹', sort_order: 1 },
          { id: '3', name: 'Food', icon: '🍔', sort_order: 2 }
        ],
        menuItems: [],
        pagination: { page: 1, limit: 20, hasMore: false },
        cart: { itemCount: 0, total: 0 }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(currentCategory, 1, true);
    setCurrentPage(1);
  }, [currentCategory]);

  const refresh = () => {
    setCurrentPage(1);
    fetchFeed(currentCategory, 1, true);
  };

  const loadMore = () => {
    if (data?.pagination.hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchFeed(currentCategory, nextPage, false);
    }
  };

  const handleSetCategory = (category: string) => {
    if (category !== currentCategory) {
      setCurrentCategory(category);
    }
  };

  return {
    data,
    loading,
    error,
    refresh,
    loadMore,
    setCategory: handleSetCategory,
    currentCategory
  };
};

export default useMenuFeed;
