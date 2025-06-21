
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Heart,
  Star,
  Clock,
  MapPin,
  WifiOff,
  Check
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  rating: number;
  prepTime: string;
  isAvailable: boolean;
  isPopular?: boolean;
  allergens?: string[];
}

const MobileOrderingInterface = () => {
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const menuItems: MenuItem[] = [
    {
      id: '1',
      name: 'Crispy Calamari',
      price: 12.50,
      description: 'Fresh squid rings with marinara sauce',
      category: 'appetizers',
      rating: 4.5,
      prepTime: '15 min',
      isAvailable: true,
      isPopular: true,
      allergens: ['seafood']
    },
    {
      id: '2',
      name: 'Margherita Pizza',
      price: 16.00,
      description: 'Classic tomato, mozzarella, and basil',
      category: 'mains',
      rating: 4.7,
      prepTime: '20 min',
      isAvailable: true,
      isPopular: true
    },
    {
      id: '3',
      name: 'Caesar Salad',
      price: 10.50,
      description: 'Romaine lettuce, croutons, parmesan',
      category: 'salads',
      rating: 4.2,
      prepTime: '10 min',
      isAvailable: true
    },
    {
      id: '4',
      name: 'Mojito',
      price: 8.00,
      description: 'Fresh mint, lime, white rum',
      category: 'drinks',
      rating: 4.6,
      prepTime: '5 min',
      isAvailable: false
    }
  ];

  const categories = [
    { id: 'all', name: 'All', count: menuItems.length },
    { id: 'appetizers', name: 'Starters', count: 1 },
    { id: 'mains', name: 'Mains', count: 1 },
    { id: 'salads', name: 'Salads', count: 1 },
    { id: 'drinks', name: 'Drinks', count: 1 }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, count]) => {
      const item = menuItems.find(item => item.id === itemId);
      return total + (item ? item.price * count : 0);
    }, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:max-w-md md:mx-auto">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-lg font-bold">The Harbour Bistro</h1>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Valletta, Malta</span>
              <WifiOff className="h-4 w-4 ml-2 text-red-500" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Open
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white px-4 py-2">
        <ScrollArea className="w-full">
          <div className="flex space-x-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4 pb-24">
        {filteredItems.map(item => (
          <Card key={item.id} className={`${!item.isAvailable ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.isPopular && (
                      <Badge variant="secondary" className="text-xs">Popular</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-500" />
                      {item.rating}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {item.prepTime}
                    </div>
                  </div>
                  {item.allergens && (
                    <div className="mt-2">
                      <span className="text-xs text-red-600">
                        Contains: {item.allergens.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold text-lg">€{item.price.toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1 h-auto"
                  >
                    <Heart 
                      className={`h-4 w-4 ${favorites.includes(item.id) ? 'fill-red-500 text-red-500' : ''}`} 
                    />
                  </Button>
                </div>
              </div>

              {item.isAvailable ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      disabled={!cart[item.id]}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {cart[item.id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(item.id)}
                    className="ml-2"
                  >
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <Badge variant="destructive">Currently Unavailable</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Floating Cart */}
      {getTotalItems() > 0 && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md">
          <Card className="bg-blue-600 text-white shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                    </div>
                    <div className="text-sm opacity-90">
                      €{getTotalPrice().toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button variant="secondary" size="sm">
                  View Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offline Indicator */}
      <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-md">
        <Card className="bg-orange-100 border-orange-200">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 text-orange-800">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">You're offline - Orders will sync when connected</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileOrderingInterface;
