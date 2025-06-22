
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor, MenuItem, CartItem } from './useOrderDemo/types';

export const useOrderDemo = (vendorSlug: string) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [guestSessionId] = useState(() => {
    const existing = localStorage.getItem('icupa_guest_session');
    if (existing) return existing;
    
    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('icupa_guest_session', newId);
    return newId;
  });

  // Layout and context data
  const [layout, setLayout] = useState({
    heroSection: {
      title: "Welcome to Great Food!",
      subtitle: "Discover amazing dishes crafted with love",
      ctaText: "Explore Menu",
      backgroundImage: null
    },
    sections: [
      { id: 'popular', title: 'Popular Tonight', items: [] },
      { id: 'mains', title: 'Main Courses', items: [] },
      { id: 'drinks', title: 'Beverages', items: [] }
    ]
  });

  const [contextData, setContextData] = useState({
    timeOfDay: 'evening',
    isHappyHour: false,
    location: 'Malta',
    weather: 'pleasant'
  });

  useEffect(() => {
    if (vendorSlug) {
      fetchVendorData();
    }
  }, [vendorSlug]);

  const fetchVendorData = async () => {
    try {
      setLoading(true);
      
      // Fetch vendor data
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select(`
          *,
          menus (
            *,
            menu_items (*)
          )
        `)
        .eq('slug', vendorSlug)
        .eq('active', true)
        .single();

      if (vendorError) throw vendorError;

      if (vendorData) {
        setVendor(vendorData);
        const items = vendorData.menus?.[0]?.menu_items || [];
        setMenuItems(items);
        
        // Update layout with actual data
        setLayout(prev => ({
          ...prev,
          heroSection: {
            ...prev.heroSection,
            title: `Welcome to ${vendorData.name}!`,
            subtitle: vendorData.description || "Discover amazing dishes crafted with love"
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleHeroCtaClick = () => {
    // Scroll to menu section
    const menuElement = document.getElementById('menu-section');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const addToCart = async (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      setCart(cart.map(cartItem => 
        cartItem.id === item.id 
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    vendor,
    menuItems,
    cart,
    loading,
    layoutLoading,
    searchQuery,
    layout,
    weatherData,
    contextData,
    guestSessionId,
    handleSearch,
    handleHeroCtaClick,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };
};
