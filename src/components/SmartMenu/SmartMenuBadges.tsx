
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Utensils, Coffee, Leaf, AlertTriangle } from 'lucide-react';
import { MenuItem } from '@/hooks/useOrderDemo/types';

interface SmartMenuBadgesProps {
  menuItems: MenuItem[];
  totalItems: number;
  activeFilters: string[];
}

const SmartMenuBadges: React.FC<SmartMenuBadgesProps> = ({ 
  menuItems, 
  totalItems, 
  activeFilters 
}) => {
  const stats = {
    food: menuItems.filter(item => item.category === 'Food').length,
    drinks: menuItems.filter(item => item.category === 'Drink').length,
    vegetarian: menuItems.filter(item => item.is_vegetarian).length,
    withAllergens: menuItems.filter(item => item.allergens && item.allergens.length > 0).length,
    popular: menuItems.filter(item => item.popular).length,
    available: menuItems.filter(item => item.available !== false).length
  };

  const isFiltered = activeFilters.length > 0;

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2 mb-2 w-full">
        <h3 className="font-semibold text-gray-900">Menu Overview</h3>
        {isFiltered && (
          <Badge variant="outline" className="text-xs">
            Showing {menuItems.length} of {totalItems} items
          </Badge>
        )}
      </div>
      
      <Badge variant="outline" className="flex items-center gap-1">
        <Utensils className="h-3 w-3" />
        {stats.food} Food Items
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1">
        <Coffee className="h-3 w-3" />
        {stats.drinks} Drinks
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-600">
        <Leaf className="h-3 w-3" />
        {stats.vegetarian} Vegetarian
      </Badge>
      
      <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-600">
        <AlertTriangle className="h-3 w-3" />
        {stats.withAllergens} With Allergens
      </Badge>
      
      {stats.popular > 0 && (
        <Badge variant="secondary" className="flex items-center gap-1">
          ⭐ {stats.popular} Popular
        </Badge>
      )}
      
      <Badge variant="outline" className="text-green-700 border-green-700">
        {stats.available} Available Now
      </Badge>
    </div>
  );
};

export default SmartMenuBadges;
