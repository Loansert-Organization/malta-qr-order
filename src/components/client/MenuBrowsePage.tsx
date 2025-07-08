import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Leaf, 
  Flame,
  ArrowLeft,
  ShoppingCart
} from 'lucide-react';

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

interface MenuBrowsePageProps {
  menuItems: MenuItem[];
  categories: string[];
  onAddToCart: (item: MenuItem) => void;
  onBack: () => void;
  cartItemsCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const MenuBrowsePage: React.FC<MenuBrowsePageProps> = ({
  menuItems,
  categories,
  onAddToCart,
  onBack,
  cartItemsCount,
  searchQuery,
  onSearchChange
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('popular');

  const filteredItems = menuItems.filter(item => {
    // Category filter
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Dietary filters
    if (dietaryFilters.length > 0) {
      const itemTags = item.dietary_tags || [];
      if (!dietaryFilters.some(filter => itemTags.includes(filter))) {
        return false;
      }
    }

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'popular':
      default:
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
    }
  });

  const toggleDietaryFilter = (filter: string) => {
    setDietaryFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getDietaryIcon = (tag: string) => {
    switch (tag) {
      case 'vegetarian': return <Leaf className="h-3 w-3 text-green-500" />;
      case 'spicy': return <Flame className="h-3 w-3 text-red-500" />;
      case 'popular': return <Star className="h-3 w-3 text-yellow-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 sticky top-0 z-10 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Menu</h1>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="whitespace-nowrap"
          >
            All Items
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-300 border-gray-600"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white rounded px-3 py-1 text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2">
            {['vegetarian', 'spicy', 'gluten_free'].map((filter) => (
              <Button
                key={filter}
                variant={dietaryFilters.includes(filter) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleDietaryFilter(filter)}
                className="text-xs"
              >
                {filter.replace('_', ' ')}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div className="p-4 space-y-4">
        {sortedItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No items found matching your criteria</p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-white">{item.name}</h3>
                      {item.popular && (
                        <Badge variant="secondary" className="bg-yellow-600 text-white text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-300 mb-2">
                        {item.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-lg font-bold text-green-400">
                        €{item.price.toFixed(2)}
                      </span>
                      
                      {item.prep_time && (
                        <div className="flex items-center text-xs text-gray-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {item.prep_time}
                        </div>
                      )}
                    </div>
                    
                    {/* Dietary Tags */}
                    {item.dietary_tags && item.dietary_tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {item.dietary_tags.map((tag: string, index: number) => (
                          <div key={index} className="flex items-center">
                            {getDietaryIcon(tag)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Item Image and Add Button */}
                  <div className="ml-4 text-center">
                    <div className="w-16 h-16 bg-gray-700 rounded-lg mb-2 flex items-center justify-center text-2xl">
                      🍽️
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onAddToCart(item)}
                      className="bg-blue-600 hover:bg-blue-700 text-xs px-3"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                {/* Allergens */}
                {item.allergens && item.allergens.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-700">
                    <p className="text-xs text-gray-400">
                      <strong>Allergens:</strong> {item.allergens.join(', ')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Bottom Spacing for FAB */}
      <div className="h-20"></div>
    </div>
  );
};

export default MenuBrowsePage;
