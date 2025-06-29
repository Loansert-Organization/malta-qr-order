import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import FloatingCartButton from '@/components/client/FloatingCartButton';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import SmartSuggestionCard from '@/components/client/SmartSuggestionCard';
import { useAIUpsell } from '@/hooks/useAIUpsell';
import WaiterPromptChip from '@/components/ai-waiter/WaiterPromptChip';
import WaiterChatDrawer from '@/components/ai-waiter/WaiterChatDrawer';

interface MenuItem {
  id: string;
  bar_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  is_available: boolean;
}

interface Bar {
  id: string;
  name: string;
  logo_url: string | null;
  country: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const MenuPage = () => {
  const { barId } = useParams<{ barId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bar, setBar] = useState<Bar | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { suggestions } = useAIUpsell(barId, cart, false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (barId) {
      fetchBarDetails();
      fetchMenuItems();
    }
  }, [barId]);

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem(`cart_${barId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, [barId]);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    if (cart.length > 0) {
      localStorage.setItem(`cart_${barId}`, JSON.stringify(cart));
    } else {
      localStorage.removeItem(`cart_${barId}`);
    }
  }, [cart, barId]);

  const fetchBarDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('bars')
        .select('*')
        .eq('id', barId)
        .single();

      if (error) throw error;
      setBar(data);
    } catch (error) {
      console.error('Error fetching bar:', error);
      toast({
        title: "Error",
        description: "Failed to load bar details",
        variant: "destructive"
      });
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('bar_id', barId)
        .eq('status', 'approved');

      if (error) throw error;

      // setMenuItems(data || []);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data?.map(item => item.category) || []));
      setCategories(uniqueCategories);
      
      if (uniqueCategories.length > 0) {
        setSelectedCategory(uniqueCategories[0]);
      }

      // Generate signed URLs for images if needed
      const itemsWithSignedUrls: MenuItem[] = await Promise.all((data || []).map(async item => {
        let imageUrl = item.image_url;
        if (imageUrl && !imageUrl.startsWith('http')) {
          const { data: signed, error: signErr } = await supabase.storage
            .from('menu_images')
            .createSignedUrl(imageUrl, 60 * 60);
          if (!signErr) {
            imageUrl = signed.signedUrl;
          }
        }
        return { ...item, image_url: imageUrl } as MenuItem;
      }));

      setMenuItems(itemsWithSignedUrls);
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const updateQuantity = (itemId: string, change: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            {bar && (
              <div className="flex items-center gap-3 flex-1">
                {bar.logo_url && (
                  <img 
                    src={bar.logo_url} 
                    alt={bar.name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                )}
                <h1 className="text-xl font-semibold">{bar.name}</h1>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 mt-4">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full overflow-x-auto flex justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-video relative">
                      <ImageWithFallback 
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <Badge variant="secondary" className="ml-2">
                        {bar?.country === 'Rwanda' ? 'RWF' : '€'} {item.price}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                    )}
                    
                    {/* Check if item is in cart */}
                    {cart.find(cartItem => cartItem.id === item.id) ? (
                      <div className="flex items-center justify-between">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-medium">
                          {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full"
                        onClick={() => addToCart(item)}
                      >
                        Add to Order
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="container mx-auto px-4 mt-6 space-y-3">
          {suggestions.map((s, idx) => (
            <SmartSuggestionCard
              key={idx}
              title={s.title}
              description={s.description}
              onAdd={() => {
                const item = menuItems.find((m) => m.id === s.id);
                if (item) addToCart(item);
              }}
            />
          ))}
        </div>
      )}

      {/* Floating Cart Button */}
      <FloatingCartButton
        count={getCartItemCount()}
        subtotal={getCartTotal()}
        currency={bar?.country === 'Rwanda' ? 'RWF' : '€'}
      />

      <WaiterPromptChip onOpen={() => setChatOpen(true)} />
      <WaiterChatDrawer barId={barId} open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
};

export default MenuPage; 