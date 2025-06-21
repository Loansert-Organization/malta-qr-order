import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import AIWaiterChat from '@/components/AIWaiterChat';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import VoiceSearch from '@/components/VoiceSearch';
import SmartMenu from '@/components/SmartMenu';
import { useDynamicLayout } from '@/hooks/useDynamicLayout';
import { weatherService } from '@/services/weatherService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Minus } from 'lucide-react';

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

const OrderDemo = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showAIChat, setShowAIChat] = useState(false);
  const [guestSessionId] = useState(() => `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);

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

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading || layoutLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist or is not active.</p>
        </div>
      </div>
    );
  }

  const aiInsights = {
    trending_items: contextData?.ai_insights?.trending_items || [],
    recommended_categories: contextData?.ai_insights?.recommended_categories || [],
    weather_suggestions: contextData?.weather?.recommendations || [],
    time_based_priorities: contextData?.ai_insights?.time_based_priorities || []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800">{vendor.name}</h1>
            <p className="text-gray-600 mt-2">{vendor.location}</p>
            <p className="text-sm text-gray-500 mt-1">{vendor.description}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Dynamic Hero Section */}
        {layout?.hero_section && (
          <DynamicHeroSection
            heroSection={layout.hero_section}
            onCtaClick={handleHeroCtaClick}
            vendorName={vendor.name}
            location={vendor.location || 'Malta'}
            weatherData={weatherData}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Menu Items */}
          <div className="lg:col-span-2">
            <div id="menu-section" className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Menu</h2>
              
              {/* Voice Search */}
              <VoiceSearch
                onSearch={handleSearch}
                placeholder="Search menu items or ask for recommendations..."
              />
              
              {/* Smart Menu */}
              <SmartMenu
                menuItems={menuItems}
                onAddToCart={addToCart}
                aiInsights={aiInsights}
                weatherData={weatherData}
                searchQuery={searchQuery}
              />
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>Your Order ({getTotalItems()})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Your cart is empty</p>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{item.name}</h5>
                            <p className="text-xs text-gray-500">
                              €{parseFloat(item.price.toString()).toFixed(2)} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center font-bold">
                          <span>Total:</span>
                          <span>€{getTotalPrice().toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <Button className="w-full" size="lg">
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* AI Waiter Chat Button */}
      <div className="fixed bottom-6 right-6">
        <Button
          onClick={() => setShowAIChat(true)}
          className="rounded-full h-14 w-14 shadow-lg"
          size="lg"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      {/* AI Waiter Chat Modal */}
      {showAIChat && (
        <AIWaiterChat
          onClose={() => setShowAIChat(false)}
          onAddToCart={addToCart}
          vendorSlug={slug || ''}
          guestSessionId={guestSessionId}
        />
      )}
    </div>
  );
};

export default OrderDemo;
