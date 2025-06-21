
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Clock, Star, TrendingUp, Thermometer } from 'lucide-react';

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

interface SmartMenuProps {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  aiInsights?: {
    trending_items: string[];
    recommended_categories: string[];
    weather_suggestions: string[];
    time_based_priorities: string[];
  };
  weatherData?: {
    condition: string;
    temperature: number;
    recommendations: string[];
  };
  searchQuery?: string;
}

const SmartMenu = ({ 
  menuItems, 
  onAddToCart, 
  aiInsights, 
  weatherData,
  searchQuery = ''
}: SmartMenuProps) => {
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Smart filtering and sorting based on AI insights
  const smartSortedItems = useMemo(() => {
    let items = [...menuItems];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Smart sorting based on multiple factors
    return items.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      // Base popularity score
      if (a.popular) scoreA += 50;
      if (b.popular) scoreB += 50;

      // AI trending items boost
      if (aiInsights?.trending_items.includes(a.name)) scoreA += 40;
      if (aiInsights?.trending_items.includes(b.name)) scoreB += 40;

      // Weather-based recommendations
      if (weatherData?.recommendations.some(rec => 
        a.category.toLowerCase().includes(rec) || 
        a.name.toLowerCase().includes(rec)
      )) scoreA += 30;
      if (weatherData?.recommendations.some(rec => 
        b.category.toLowerCase().includes(rec) || 
        b.name.toLowerCase().includes(rec)
      )) scoreB += 30;

      // Time-based priorities
      if (aiInsights?.time_based_priorities.includes(a.category.toLowerCase())) scoreA += 25;
      if (aiInsights?.time_based_priorities.includes(b.category.toLowerCase())) scoreB += 25;

      // Availability boost
      if (a.available) scoreA += 20;
      if (b.available) scoreB += 20;

      return scoreB - scoreA;
    });
  }, [menuItems, searchQuery, selectedCategory, aiInsights, weatherData]);

  // Get unique categories with smart ordering
  const smartCategories = useMemo(() => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    
    // Sort categories based on AI recommendations
    return categories.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (aiInsights?.recommended_categories.includes(a.toLowerCase())) scoreA += 10;
      if (aiInsights?.recommended_categories.includes(b.toLowerCase())) scoreB += 10;

      if (aiInsights?.time_based_priorities.includes(a.toLowerCase())) scoreA += 8;
      if (aiInsights?.time_based_priorities.includes(b.toLowerCase())) scoreB += 8;

      return scoreB - scoreA;
    });
  }, [menuItems, aiInsights]);

  useEffect(() => {
    setFilteredItems(smartSortedItems);
  }, [smartSortedItems]);

  const getItemBadges = (item: MenuItem) => {
    const badges = [];

    if (item.popular) {
      badges.push({ text: 'Popular', variant: 'default' as const, icon: Star });
    }

    if (aiInsights?.trending_items.includes(item.name)) {
      badges.push({ text: 'Trending', variant: 'secondary' as const, icon: TrendingUp });
    }

    if (weatherData?.recommendations.some(rec => 
      item.category.toLowerCase().includes(rec) || 
      item.name.toLowerCase().includes(rec)
    )) {
      badges.push({ text: 'Perfect Weather', variant: 'outline' as const, icon: Thermometer });
    }

    return badges;
  };

  const getWeatherContext = () => {
    if (!weatherData) return null;

    const temp = weatherData.temperature;
    let context = '';
    
    if (temp > 25) {
      context = '🌞 Hot day - Perfect for cold drinks and light meals';
    } else if (temp < 18) {
      context = '🌧️ Cool weather - Great for warm comfort food';
    } else {
      context = '🌤️ Pleasant weather - Ideal for any dining choice';
    }

    return context;
  };

  return (
    <div className="space-y-6">
      {/* Weather Context */}
      {weatherData && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 text-center">
              {getWeatherContext()}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Items
        </Button>
        {smartCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="relative"
          >
            {category}
            {aiInsights?.recommended_categories.includes(category.toLowerCase()) && (
              <Badge variant="secondary" className="ml-1 text-xs">
                AI Pick
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid gap-4">
        {filteredItems.map((item, index) => {
          const badges = getItemBadges(item);
          const isHighPriority = badges.length > 0;

          return (
            <Card 
              key={item.id} 
              className={`hover:shadow-md transition-all duration-200 ${
                isHighPriority ? 'ring-2 ring-primary/20 bg-primary/5' : ''
              } ${index < 3 ? 'animate-fade-in' : ''}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-lg">{item.name}</h4>
                      <div className="flex space-x-1">
                        {badges.map((badge, idx) => {
                          const IconComponent = badge.icon;
                          return (
                            <Badge key={idx} variant={badge.variant} className="text-xs flex items-center space-x-1">
                              <IconComponent className="h-3 w-3" />
                              <span>{badge.text}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-primary">
                        €{parseFloat(item.price.toString()).toFixed(2)}
                      </span>
                      {item.prep_time && (
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-xs">{item.prep_time}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => onAddToCart(item)}
                      size="sm"
                      disabled={!item.available}
                      className="hover:scale-105 transition-transform"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">No items found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartMenu;
