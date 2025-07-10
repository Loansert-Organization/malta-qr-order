import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Minus, ShoppingBag, Clock, Star, Search, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { BarPhotoCarousel } from '@/components/ui/bar-photo-carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';

interface MenuItem {
  id: string;
  bar_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category: string;
  available: boolean;
  preparation_time?: number;
  rating?: number;
  popularity?: number;
}

interface Bar {
  id: string;
  name: string;
  address: string;
  country: string;
  momo_code?: string;
}

const MenuPageEnhanced = () => {
  const { barId } = useParams<{ barId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cart, currentBar, addToCart, updateQuantity, getCartTotal, getCartItemCount } = useCart();
  
  const [bar, setBar] = useState<Bar | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (barId) {
      fetchBarDetails();
      fetchMenuItems();
    }
  }, [barId]);

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
      navigate('/');
    }
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('bar_id', barId)
        .eq('available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Extract unique categories
      const uniqueCategories = ['all', ...Array.from(new Set(data?.map(item => item.category) || []))];
      setCategories(uniqueCategories);

      // Process menu items with signed URLs
      const processedItems = await Promise.all((data || []).map(async item => {
        let imageUrl = item.image_url;
        if (imageUrl && !imageUrl.startsWith('http')) {
          const { data: signed } = await supabase.storage
            .from('menu_images')
            .createSignedUrl(imageUrl, 60 * 60);
          if (signed) {
            imageUrl = signed.signedUrl;
          }
        }
        return { ...item, image_url: imageUrl } as MenuItem;
      }));

      setMenuItems(processedItems);
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

  const handleAddToCart = (item: MenuItem) => {
    if (bar) {
      addToCart(item, {
        id: bar.id,
        name: bar.name,
        country: bar.country,
        currency: bar.country === 'Rwanda' ? 'RWF' : 'EUR'
      });
      
      // Haptic feedback on mobile
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  };

  const getItemQuantityInCart = (itemId: string) => {
    const cartItem = cart.find(item => item.id === itemId);
    return cartItem?.quantity || 0;
  };

  const handleQuantityChange = (itemId: string, change: number) => {
    const currentQuantity = getItemQuantityInCart(itemId);
    if (currentQuantity + change === 0) {
      updateQuantity(itemId, change);
    } else if (currentQuantity === 0 && change > 0) {
      const item = menuItems.find(i => i.id === itemId);
      if (item && bar) {
        handleAddToCart(item);
      }
    } else {
      updateQuantity(itemId, change);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlaceOrder = () => {
    if (getCartItemCount() === 0) {
      toast({
        title: "Cart is empty",
        description: "Add some items to your cart before placing an order",
        variant: "destructive"
      });
      return;
    }

    const orderData = {
      barId: bar?.id,
      barName: bar?.name,
      items: cart,
      currency: bar?.country === 'Rwanda' ? 'RWF' : 'EUR',
      country: bar?.country,
      subtotal: getCartTotal()
    };

    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    navigate(`/checkout/${bar?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full mb-6 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/client')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              {bar && (
                <div className="flex items-center gap-3">
                  <div>
                    <h1 className="text-xl font-semibold">{bar.name}</h1>
                    {bar.address && (
                      <p className="text-sm text-gray-600">{bar.address}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Cart Preview */}
            {getCartItemCount() > 0 && (
              <Badge variant="secondary" className="text-sm">
                {getCartItemCount()} items
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Bar Photo Carousel */}
      {bar && (
        <div className="container mx-auto px-4 mt-4">
          <BarPhotoCarousel
            barId={bar.id}
            barName={bar.name}
            className="rounded-xl shadow-lg"
            height={250}
            autoRotate={true}
            showControls={true}
            showIndicators={true}
          />
        </div>
      )}

      {/* Search Bar */}
      <div className="container mx-auto px-4 mt-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
        />
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 mt-6">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="w-full overflow-x-auto flex justify-start bg-transparent p-0 gap-2">
            {categories.map(category => (
              <TabsTrigger
                key={category}
                value={category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground whitespace-nowrap"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Item Image */}
                          <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                            {item.image_url ? (
                            <img 
                              src={item.image_url}
                              alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <ShoppingBag className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 p-4 flex flex-col justify-between">
                            <div>
                              <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {item.category}
                              </p>
                              
                              {/* Item Badges */}
                              <div className="flex items-center gap-2 mb-2">
                                {item.preparation_time && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {item.preparation_time} min
                                  </Badge>
                                )}
                              {item.rating && (
                                  <Badge variant="secondary" className="text-xs">
                                    <Star className="h-3 w-3 mr-1" />
                                    {item.rating}
                                  </Badge>
                              )}
                            </div>
                            </div>
                          
                            {/* Price and Actions */}
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold">
                                {bar?.country === 'Rwanda' ? 'RWF' : '€'} {item.price}
                              </span>

                              {/* Quantity Controls */}
                          {getItemQuantityInCart(item.id) > 0 ? (
                                <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleQuantityChange(item.id, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                                  <span className="w-8 text-center font-semibold">
                                    {getItemQuantityInCart(item.id)}
                                  </span>
                              <Button
                                size="sm"
                                variant="outline"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleQuantityChange(item.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <motion.div whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                onClick={() => handleAddToCart(item)}
                                className="gap-2"
                              >
                                <Plus className="h-4 w-4" />
                                Add
                              </Button>
                            </motion.div>
                          )}
                            </div>
                          </div>
                        </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredItems.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No items found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Cart Button */}
        {getCartItemCount() > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg"
          >
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm text-gray-600">Total ({getCartItemCount()} items)</p>
                <p className="text-xl font-bold">
                  {bar?.country === 'Rwanda' ? 'RWF' : '€'} {getCartTotal().toFixed(bar?.country === 'Rwanda' ? 0 : 2)}
                </p>
              </div>
            <Button
              size="lg"
                onClick={handlePlaceOrder}
                className="gap-2"
            >
                <ShoppingCart className="h-5 w-5" />
                Place Order
            </Button>
            </div>
          </div>
          </motion.div>
        )}
    </div>
  );
};

export default MenuPageEnhanced; 
