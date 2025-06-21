
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDynamicLayout } from '@/hooks/useDynamicLayout';
import { useVendorData } from './useVendorData';
import { useCartManager } from './useCartManager';
import { useSearchManager } from './useSearchManager';

export const useOrderDemo = () => {
  const { slug } = useParams();
  const [guestSessionId] = useState(() => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Fetch vendor and menu data
  const { vendor, menuItems, loading, weatherData } = useVendorData(slug);

  // Dynamic layout integration
  const { 
    layout, 
    loading: layoutLoading, 
    trackInteraction,
    contextData
  } = useDynamicLayout(vendor?.id || '');

  // Cart management
  const { cart, addToCart, removeFromCart, getTotalPrice, getTotalItems } = useCartManager(trackInteraction);

  // Search management
  const { searchQuery, handleSearch } = useSearchManager(menuItems, trackInteraction);

  const handleHeroCtaClick = async () => {
    await trackInteraction('hero_cta_click', {
      cta_text: layout?.hero_section?.cta_text,
      section: 'hero'
    });

    // Scroll to menu
    const menuElement = document.getElementById('menu-section');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return {
    vendor,
    menuItems,
    cart,
    loading,
    layoutLoading,
    searchQuery,
    weatherData,
    guestSessionId,
    layout,
    contextData,
    trackInteraction,
    addToCart,
    removeFromCart,
    handleSearch,
    handleHeroCtaClick,
    getTotalPrice,
    getTotalItems
  };
};

export * from './types';
