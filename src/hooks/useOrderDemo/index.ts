
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

  // Initialize guest session first
  const { guestSession, sessionId } = useGuestSession();

  // Initialize vendor data with dependency array
  const { vendor, menuItems, loading, weatherData } = useVendorData(slug);

  // Initialize cart manager with stable vendor ID
  const vendorId = useMemo(() => vendor?.id || '', [vendor?.id]);
  const {
    cart,
    addToCart: rawAddToCart,
    removeFromCart: rawRemoveFromCart,
    getTotalPrice,
    getTotalItems
  } = useCartManager(vendorId);

  // Initialize search with stable menu items
  const stableMenuItems = useMemo(() => menuItems, [menuItems]);
  const { searchQuery, handleSearch } = useSearchManager(stableMenuItems);

  // Initialize dynamic layout with stable vendor ID
  const { layout } = useDynamicLayout({
    vendorId,
    contextData,
    guestSessionId: sessionId
  });

  // Stable cart functions to prevent infinite loops
  const addToCart = useCallback((item: any) => {
    try {
      rawAddToCart(item);
    } catch (error) {
      AIGuard.handleComponentError(error as Error, 'useOrderDemo.addToCart');
    }
  }, [rawAddToCart]);

  const removeFromCart = useCallback((itemId: string) => {
    try {
      rawRemoveFromCart(itemId);
    } catch (error) {
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

  // Update time of day context
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
    const interval = setInterval(updateTimeContext, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return {
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
  };
};
