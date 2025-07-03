
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Star, Clock } from 'lucide-react';
import { MenuItem } from '@/hooks/useOrderDemo/types';

interface MenuSectionProps {
  menuItems: MenuItem[];
  searchQuery: string;
  onAddToCart: (item: MenuItem) => Promise<void>;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  searchQuery,
  onAddToCart
}) => {
  const [activeCategory, setActiveCategory] = useState('all');

  // Filter and organize menu items
  const filteredItems = useMemo(() => {
    let items = menuItems;

    // Filter by search query
    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      items = items.filter(item => item.category === activeCategory);
    }

    return items;
  }, [menuItems, searchQuery, activeCategory]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(menuItems.map(item => item.category).filter(Boolean))];
    return cats;
  }, [menuItems]);

  const handleAddToCart = async (item: MenuItem) => {
    try {
      await onAddToCart(item);
    } catch (error) {
      console.error('Error adding item to cart:', error);
    }
  };

  return (
    <div id="menu-section" className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Our Menu</h2>
        <Badge variant="secondary">{filteredItems.length} items</Badge>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category || ''} className="capitalize">
              {category === 'all' ? 'All Items' : (category || '')}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-0">
                <div className="flex">
                  {/* Item Image */}
                  <div className="w-24 h-24 bg-gray-200 flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                        <span className="text-2xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg text-blue-600">
                          €{item.price.toFixed(2)}
                        </span>
                        {item.popular && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {item.prep_time && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {item.prep_time}
                          </Badge>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleAddToCart(item)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No items match "${searchQuery}". Try a different search term.`
                : 'No items available in this category.'
              }
            </p>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default MenuSection;
