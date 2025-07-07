import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Leaf } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  popular?: boolean;
  dietary_tags?: string[];
  available: boolean;
}

interface SmartMenuProps {
  vendorId: string;
}

const SmartMenu: React.FC<SmartMenuProps> = ({ vendorId }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<MenuItem[]>([]);
  const { toast } = useToast();

  const fetchMenuItems = useCallback(async () => {
    try {
      const { data: items, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          menus!inner(vendor_id)
        `)
        .eq('menus.vendor_id', vendorId)
        .eq('available', true)
        .order('popular', { ascending: false });

      if (error) throw error;

      if (items) {
        setMenuItems(items as MenuItem[]);
        // Extract unique categories
        const uniqueCategories = ['all', ...new Set(items.map(item => item.category || '').filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast({
        title: "Error",
        description: "Failed to load menu items",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [vendorId, toast]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const addToCart = (item: MenuItem) => {
    setCart(prev => [...prev, item]);
    toast({
      title: "Added to Cart",
      description: `${item.name} has been added to your cart`,
    });
  };

  const getDietaryIcon = (tag: string) => {
    switch (tag) {
      case 'vegetarian':
        return <Leaf className="h-3 w-3 text-green-500" />;
      case 'gluten-free':
        return <span className="text-xs font-bold text-blue-500">GF</span>;
      case 'vegan':
        return <span className="text-xs font-bold text-green-600">V</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-24 bg-gray-700 rounded-lg animate-pulse flex-shrink-0"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-800 animate-pulse">
              <CardContent className="p-4">
                <div className="h-40 bg-gray-700 rounded-md mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-700 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="flex-shrink-0 capitalize"
          >
            {category === 'all' ? 'All Items' : category}
          </Button>
        ))}
      </div>

      {/* AI-Enhanced Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <Card key={item.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 group">
            <CardContent className="p-0">
              {/* Item Image */}
              <div className="relative h-48 overflow-hidden rounded-t-lg">
                <img
                  src={item.image_url || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop`}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                {item.popular && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-orange-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                {/* Dietary Tags */}
                {item.dietary_tags && item.dietary_tags.length > 0 && (
                  <div className="absolute top-2 right-2 flex space-x-1">
                    {item.dietary_tags.map((tag, index) => (
                      <div key={index} className="bg-white bg-opacity-90 rounded-full p-1">
                        {getDietaryIcon(tag)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-lg font-bold text-green-400">
                    €{item.price.toFixed(2)}
                  </span>
                </div>
                
                {item.description && (
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Category and Add to Cart */}
                <div className="flex justify-between items-center">
                  <Badge variant="secondary" className="text-xs">
                    {item.category}
                  </Badge>
                  <Button
                    onClick={() => addToCart(item)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p>Try selecting a different category or check back later.</p>
        </div>
      )}

      {/* Cart Summary (if items in cart) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">{cart.length} items in cart</p>
              <p className="text-sm opacity-90">
                Total: €{cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
              </p>
            </div>
            <Button variant="secondary" size="sm">
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMenu;
