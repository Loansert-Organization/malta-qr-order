
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { weatherService } from '@/services/weatherService';
import { useToast } from '@/hooks/use-toast';
import { useDynamicLayout } from '@/hooks/useDynamicLayout';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  popular: boolean;
  prep_time?: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
}

export const useOrderDemo = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [guestSessionId] = useState(() => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Dynamic layout integration
  const { 
    layout, 
    loading: layoutLoading, 
    trackInteraction,
    contextData
  } = useDynamicLayout(vendor?.id || '');

  useEffect(() => {
    const fetchVendorAndMenu = async () => {
      if (!slug) return;

      try {
        // Fetch vendor data
        const { data: vendorData, error: vendorError } = await supabase
          .from('vendors')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (vendorError) throw vendorError;
        setVendor(vendorData);

        // Fetch menu and menu items
        const { data: menuData, error: menuError } = await supabase
          .from('menus')
          .select(`
            id,
            menu_items (
              id,
              name,
              description,
              price,
              image_url,
              category,
              popular,
              prep_time,
              available
            )
          `)
          .eq('vendor_id', vendorData.id)
          .eq('active', true)
          .single();

        if (menuError) throw menuError;
        setMenuItems(menuData.menu_items || []);

        // Fetch weather data
        const weather = await weatherService.getWeatherData('Malta');
        if (weather) {
          setWeatherData(weather);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load menu data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVendorAndMenu();
  }, [slug, toast]);

  const addToCart = async (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });

    // Track interaction for AI insights
    await trackInteraction('add_to_cart', {
      item_id: item.id,
      item_name: item.name,
      category: item.category,
      price: item.price
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, cartItem) => {
        if (cartItem.id === itemId) {
          if (cartItem.quantity > 1) {
            acc.push({ ...cartItem, quantity: cartItem.quantity - 1 });
          }
        } else {
          acc.push(cartItem);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // Track search interaction
    await trackInteraction('search', {
      query,
      results_count: menuItems.filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase())
      ).length
    });
  };

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
