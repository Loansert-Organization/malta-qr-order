import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor, MenuItem, CartItem } from './useOrderDemo/types';
import { Json } from '@/integrations/supabase/types';
import { 
  isArray, 
  isString, 
  safeArray, 
  UnknownRecord,
  UnknownValue 
} from '@/types/utilities';

// Transform function to convert database JSON to proper types
const transformMenuItem = (dbItem: UnknownRecord): MenuItem => {
  let allergens: string[] = [];
  
  if (isArray(dbItem.allergens)) {
    allergens = dbItem.allergens as string[];
  } else if (isString(dbItem.allergens)) {
    try {
      const parsed = JSON.parse(dbItem.allergens);
      allergens = isArray(parsed) ? parsed : [];
    } catch {
      allergens = [];
    }
  } else if (dbItem.allergens === null || dbItem.allergens === undefined) {
    allergens = [];
  }

  return {
    id: dbItem.id as string,
    name: dbItem.name as string,
    description: dbItem.description as string,
    price: dbItem.price as number,
    image_url: dbItem.image_url as string,
    category: dbItem.category as string,
    subcategory: dbItem.subcategory as string,
    popular: dbItem.popular as boolean,
    prep_time: dbItem.prep_time as string,
    available: dbItem.available as boolean,
    is_vegetarian: dbItem.is_vegetarian as boolean,
    allergens
  };
};

interface OrderDemoState {
  vendor: Vendor | UnknownRecord | null;
  menuItems: MenuItem[] | UnknownRecord[];
  loading: boolean;
  error: string | null;
}

interface WeatherData {
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
}

interface LayoutSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface LayoutData {
  heroSection: {
    title: string;
    subtitle: string;
    ctaText: string;
    backgroundImage: string | null;
  };
  sections: LayoutSection[];
}

interface ContextData {
  timeOfDay: string;
  isHappyHour: boolean;
  location: string;
  weather: string;
}

export const useOrderDemo = (vendorSlug?: string) => {
  const [state, setState] = useState<OrderDemoState>({
    vendor: null,
    menuItems: [],
    loading: true,
    error: null
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [layoutLoading, setLayoutLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [guestSessionId] = useState(() => {
    const existing = localStorage.getItem('icupa_guest_session');
    if (existing) return existing;
    
    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('icupa_guest_session', newId);
    return newId;
  });

  // Layout and context data
  const [layout, setLayout] = useState<LayoutData>({
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

  const [contextData, setContextData] = useState<ContextData>({
    timeOfDay: 'evening',
    isHappyHour: false,
    location: 'Malta',
    weather: 'pleasant'
  });

  const fetchVendorData = useCallback(async (): Promise<void> => {
    if (!vendorSlug) {
      setState(prev => ({ ...prev, loading: false, error: 'No vendor slug provided' }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch vendor
      const { data: vendor, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('slug', vendorSlug)
        .single();

      if (vendorError) {
        throw new Error(`Vendor not found: ${vendorError.message}`);
      }

      // Fetch menu items for vendor
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select(`
          *,
          menus!inner(vendor_id)
        `)
        .eq('menus.vendor_id', vendor.id);

      if (menuError) {
        console.warn('Menu items fetch error:', menuError);
        // Don't throw - vendor might not have menu items yet
      }

      setState({
        vendor,
        menuItems: safeArray(menuItems, []),
        loading: false,
        error: null
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [vendorSlug]);

  useEffect(() => {
    fetchVendorData();
  }, [fetchVendorData]);

  const refreshData = useCallback(() => {
    fetchVendorData();
  }, [fetchVendorData]);

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
    vendor: state.vendor,
    menuItems: state.menuItems,
    loading: state.loading,
    error: state.error,
    cart,
    layoutLoading,
    searchQuery,
    weatherData,
    guestSessionId,
    layout,
    contextData,
    refreshData,
    handleSearch,
    handleHeroCtaClick,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    setLayout,
    setContextData,
    setWeatherData
  };
};
