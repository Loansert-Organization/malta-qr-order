
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock, ChefHat } from 'lucide-react';
import { MenuItem, AIInsights, WeatherData } from './types';
import { SmartMenuBadges } from './SmartMenuBadges';
import NoDataState from '../NoDataState';

interface SmartMenuItemsProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  aiInsights?: AIInsights;
  weatherData?: WeatherData;
}

export const SmartMenuItems = ({ items, onAddToCart, aiInsights, weatherData }: SmartMenuItemsProps) => {
  if (items.length === 0) {
    return (
      <NoDataState
        icon={ChefHat}
        title="No Menu Items Available"
        description="This restaurant hasn't added any menu items yet, or they may be temporarily unavailable."
        suggestions={[
          "Check back later for updated menu items",
          "Contact the restaurant directly for current offerings"
        ]}
      />
    );
  }

  return (
    <div className="grid gap-4">
      {items.map((item, index) => {
        const badges = aiInsights?.trending_items.includes(item.name) || 
                      item.popular || 
                      weatherData?.recommendations.some(rec => 
                        item.category.toLowerCase().includes(rec) || 
                        item.name.toLowerCase().includes(rec)
                      );
        const isHighPriority = badges;

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
                    <SmartMenuBadges 
                      item={item} 
                      aiInsights={aiInsights} 
                      weatherData={weatherData} 
                    />
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
  );
};
