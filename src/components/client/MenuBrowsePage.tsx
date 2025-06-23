
import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Leaf, Flame, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  popular?: boolean;
  prep_time?: string;
  dietary_tags?: string[];
  available: boolean;
}

interface MenuBrowsePageProps {
  vendorId: string;
  onAddToCart: (item: MenuItem, modifiers?: any[]) => void;
  onAIWaiterClick: () => void;
}

const MenuBrowsePage: React.FC<MenuBrowsePageProps> = ({
  vendorId,
  onAddToCart,
  onAIWaiterClick
}) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [smartFilters, setSmartFilters] = useState<string[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, [vendorId]);

  const fetchMenuData = async () => {
    try {
      // Mock data - in real implementation would fetch from Supabase
      const mockItems: MenuItem[] = [
        {
          id: '1',
          name: 'Maltese Ftira',
          description: 'Traditional Maltese sourdough bread with tomatoes, olives, and local cheese',
          price: 8.50,
          category: 'starters',
          popular: true,
          prep_time: '15 min',
          dietary_tags: ['vegetarian'],
          available: true
        },
        {
          id: '2',
          name: 'Bragioli',
          description: 'Traditional Maltese beef olives stuffed with breadcrumbs, bacon, and herbs',
          price: 18.50,
          category: 'mains',
          popular: true,
          prep_time: '25 min',
          dietary_tags: [],
          available: true
        },
        {
          id: '3',
          name: 'Grilled Sea Bass',
          description: 'Fresh local sea bass with Mediterranean herbs and lemon',
          price: 24.00,
          category: 'mains',
          prep_time: '30 min',
          dietary_tags: ['gluten-free'],
          available: true
        },
        {
          id: '4',
          name: 'Spicy Arrabbiata',
          description: 'Pasta with spicy tomato sauce and fresh basil',
          price: 14.50,
          category: 'pasta',
          dietary_tags: ['vegetarian', 'spicy'],
          available: true
        },
        {
          id: '5',
          name: 'Kinnie Cocktail',
          description: 'Malta\'s signature bitter orange drink with premium spirits',
          price: 7.50,
          category: 'drinks',
          popular: true,
          available: true
        }
      ];

      setMenuItems(mockItems);
      
      const uniqueCategories = ['all', ...Array.from(new Set(mockItems.map(item => item.category)))];
      setCategories(uniqueCategories);

      // Generate smart filters based on available dietary tags
      const allTags = Array.from(new Set(mockItems.flatMap(item => item.dietary_tags || [])));
      setSmartFilters(allTags);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching menu:', error);
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = activeFilters.length === 0 || 
                          activeFilters.some(filter => item.dietary_tags?.includes(filter));
    
    return matchesCategory && matchesSearch && matchesFilters && item.available;
  });

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const getFilterIcon = (filter: string) => {
    switch (filter) {
      case 'vegetarian': return <Leaf className="h-3 w-3" />;
      case 'spicy': return <Flame className="h-3 w-3" />;
      case 'gluten-free': return <Wheat className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 p-4 sticky top-0 z-10 border-b border-gray-700">
        <h1 className="text-xl font-bold mb-3">Menu</h1>
        
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
        </div>

        {/* Smart Filters */}
        {smartFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-sm text-gray-400 mr-2">Filters:</span>
            {smartFilters.map(filter => (
              <Button
                key={filter}
                size="sm"
                variant={activeFilters.includes(filter) ? "default" : "outline"}
                onClick={() => toggleFilter(filter)}
                className="h-7 text-xs flex items-center space-x-1"
              >
                {getFilterIcon(filter)}
                <span className="capitalize">{filter.replace('-', ' ')}</span>
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto bg-gray-800 border-b border-gray-700 rounded-none">
          {categories.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              className="capitalize whitespace-nowrap data-[state=active]:bg-blue-600"
            >
              {category === 'all' ? 'All Items' : category}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Menu Items */}
        <div className="p-4">
          <div className="grid gap-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-white">{item.name}</h3>
                        {item.popular && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                      
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-blue-400 font-semibold">€{item.price.toFixed(2)}</span>
                        {item.prep_time && (
                          <div className="flex items-center space-x-1 text-gray-400 text-xs">
                            <Clock className="h-3 w-3" />
                            <span>{item.prep_time}</span>
                          </div>
                        )}
                      </div>

                      {/* Dietary Tags */}
                      {item.dietary_tags && item.dietary_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.dietary_tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                              {getFilterIcon(tag)}
                              <span className="ml-1 capitalize">{tag.replace('-', ' ')}</span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="ml-4 bg-blue-600 hover:bg-blue-700"
                      onClick={() => onAddToCart(item)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 mb-4">No items found matching your criteria</p>
              <Button 
                onClick={onAIWaiterClick}
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
              >
                Ask AI Waiter for Recommendations
              </Button>
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default MenuBrowsePage;
