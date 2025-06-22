import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
      {/* Enhanced Header with better mobile UX */}
      <div className="bg-white shadow-sm sticky top-0 z-10 border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">The Harbour Bistro</h1>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Valletta, Malta</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Open
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Tabs with better mobile scrolling */}
      <div className="bg-white px-4 py-3 border-b">
        <ScrollArea className="w-full">
          <div className="flex space-x-2 pb-2">
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="whitespace-nowrap flex-shrink-0 h-9"
              >
                {category.name}
                <Badge 
                  variant={selectedCategory === category.id ? "secondary" : "outline"} 
                  className="ml-2 text-xs"
                >
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Enhanced Menu Items with better accessibility and visual design */}
      <div className="p-4 space-y-3 pb-32">
        {filteredItems.map((item, index) => (
          <Card 
            key={item.id} 
            className={`transition-all duration-200 ${
              !item.isAvailable ? 'opacity-60' : 'hover:shadow-md'
            } ${index < 3 ? 'animate-fade-in' : ''}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.isPopular && (
                      <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                      <span className="font-medium">{item.rating}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{item.prepTime}</span>
                    </div>
                  </div>
                  
                  {item.allergens && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                      <strong>Contains:</strong> {item.allergens.join(', ')}
                    </div>
                  )}
                </div>
                
                <div className="text-right flex flex-col items-end space-y-2">
                  <div className="font-bold text-lg text-gray-900">€{item.price.toFixed(2)}</div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(item.id)}
                    className="p-1 h-8 w-8"
                    aria-label={favorites.includes(item.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart 
                      className={`h-4 w-4 transition-colors ${
                        favorites.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`} 
                    />
                  </Button>
                </div>
              </div>

              {item.isAvailable ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      disabled={!cart[item.id]}
                      className="h-8 w-8 p-0 rounded-full"
                      aria-label="Remove one item"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium min-w-[2rem]">
                      {cart[item.id] || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(item.id)}
                      className="h-8 w-8 p-0 rounded-full"
                      aria-label="Add one item"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addToCart(item.id)}
                    className="ml-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Badge variant="destructive" className="bg-red-100 text-red-800">
                    Currently Unavailable
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Floating Cart with better UX */}
      {getTotalItems() > 0 and (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
          <Card className="bg-blue-600 text-white shadow-xl border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'}
                    </div>
                    <div className="text-sm text-blue-100">
                      €{getTotalPrice().toFixed(2)}
                    </div>
                  </div>
                </div>
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="bg-white text-blue-600 hover:bg-blue-50"
                >
                  View Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MobileOrderingInterface;
