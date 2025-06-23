
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useVendorData } from './useVendorData';
import { useCartManager } from './useCartManager';
import { useSearchManager } from './useSearchManager';
import { useDynamicLayout } from '../useDynamicLayout';
import { useGuestSession } from '../useGuestSession';
import { AIGuard } from '@/lib/ai-guards';

export const useOrderDemo = (slug: string | undefined) => {
  const [contextData, setContextData] = useState({
    timeOfDay: 'evening',
    location: 'Malta',
    weather: null as any
  });

  // Stabilize slug to prevent unnecessary re-renders
  const stableSlug = useMemo(() => slug || '', [slug]);

  // Initialize guest session first - this should be stable
  const { guestSession, sessionId, loading: sessionLoading } = useGuestSession();

  // Initialize vendor data with stable slug
  const { vendor, menuItems, loading: vendorLoading, weatherData } = useVendorData(stableSlug);

  // Get stable vendor ID
  const vendorId = useMemo(() => vendor?.id || '', [vendor?.id]);
  
  // Initialize cart manager with stable vendor ID
  const {
    cart,
    addToCart: rawAddToCart,
    removeFromCart: rawRemoveFromCart,
    getTotalPrice,
    getTotalItems
  } = useCartManager(vendorId);

  // Initialize search with stable menu items
  const stableMenuItems = useMemo(() => menuItems || [], [menuItems]);
  const { searchQuery, handleSearch } = useSearchManager(stableMenuItems);

  // Initialize dynamic layout with stable vendor ID
  const { layout } = useDynamicLayout(vendorId);

  // Combine loading states
  const loading = sessionLoading || vendorLoading;

  // Stable cart functions with error handling
  const addToCart = useCallback(async (item: any) => {
    try {
      await rawAddToCart(item);
    } catch (error) {
      console.error('Error adding to cart:', error);
      AIGuard.handleComponentError(error as Error, 'useOrderDemo.addToCart');
    }
  }, [rawAddToCart]);

  const removeFromCart = useCallback((itemId: string) => {
    try {
      rawRemoveFromCart(itemId);
    } catch (error) {
      console.error('Error removing from cart:', error);
      AIGuard.handleComponentError(error as Error, 'useOrderDemo.removeFromCart');
    }
  }, [rawRemoveFromCart]);

  // Update context data when weather changes
  useEffect(() => {
    if (weatherData) {
      setContextData(prev => ({
        ...prev,
        weather: weatherData
      }));
    }
  }, [weatherData]);

  // Update time of day context - run once on mount and every minute
  useEffect(() => {
    const updateTimeContext = () => {
      const hour = new Date().getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      setContextData(prev => ({
        ...prev,
        timeOfDay
      }));
    };

    updateTimeContext();
    const interval = setInterval(updateTimeContext, 60000);
    return () => clearInterval(interval);
  }, []);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(() => ({
    // Data
    vendor,
    layout,
    weatherData,
    menuItems: stableMenuItems,
    cart,
    searchQuery,
    contextData,
    guestSessionId: sessionId,
    
    // State
    loading,
    
    // Actions
    addToCart,
    removeFromCart,
    handleSearch,
    getTotalPrice,
    getTotalItems
  }), [
    vendor,
    layout,
    weatherData,
    stableMenuItems,
    cart,
    searchQuery,
    contextData,
    sessionId,
    loading,
    addToCart,
    removeFromCart,
    handleSearch,
    getTotalPrice,
    getTotalItems
  ]);
};
