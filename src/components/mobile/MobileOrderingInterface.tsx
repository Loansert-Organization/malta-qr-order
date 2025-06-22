import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock } from 'lucide-react';
import MobileMenuItem from './MobileMenuItem';
import CategoryTabs from './CategoryTabs';
import MobileCart from './MobileCart';

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

  const handleViewCart = () => {
    console.log('View cart clicked');
  };

  return (
    <div className="min-h-screen bg-gray-50 md:max-w-md md:mx-auto">
      {/* Header */}
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

      {/* Category Tabs */}
      <CategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {/* Menu Items */}
      <div className="p-4 space-y-3 pb-32">
        {filteredItems.map((item) => (
          <MobileMenuItem
            key={item.id}
            item={item}
            quantity={cart[item.id] || 0}
            isFavorite={favorites.includes(item.id)}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {/* Floating Cart */}
      <MobileCart
        totalItems={getTotalItems()}
        totalPrice={getTotalPrice()}
        onViewCart={handleViewCart}
      />
    </div>
  );
};

export default MobileOrderingInterface;
