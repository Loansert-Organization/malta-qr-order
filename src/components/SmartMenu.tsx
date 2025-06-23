
import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SmartMenuItems from './SmartMenu/SmartMenuItems';
import SmartMenuFilters from './SmartMenu/SmartMenuFilters';
import SmartMenuBadges from './SmartMenu/SmartMenuBadges';
import SmartMenuWeatherContext from './SmartMenu/SmartMenuWeatherContext';
import { MenuItem } from '@/hooks/useOrderDemo/types';

interface SmartMenuProps {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  weatherData?: any;
  contextData?: any;
  searchQuery?: string;
  onSearch?: (query: string) => void;
}

const SmartMenu: React.FC<SmartMenuProps> = ({
  menuItems,
  onAddToCart,
  weatherData,
  contextData,
  searchQuery = '',
  onSearch
}) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Extract unique categories and subcategories from menu items
  const availableCategories = useMemo(() => {
    const categories = new Set(menuItems.map(item => item.category).filter(Boolean));
    return Array.from(categories);
  }, [menuItems]);

  const availableSubcategories = useMemo(() => {
    const subcategories = new Set(menuItems.map(item => item.subcategory).filter(Boolean));
    return Array.from(subcategories);
  }, [menuItems]);

  // Filter menu items based on active filters
  const filteredItems = useMemo(() => {
    if (activeFilters.length === 0) return menuItems;

    return menuItems.filter(item => {
      // Check category filters
      if (activeFilters.some(filter => availableCategories.includes(filter))) {
        if (!activeFilters.includes(item.category || '')) return false;
      }

      // Check subcategory filters
      if (activeFilters.some(filter => availableSubcategories.includes(filter))) {
        if (!activeFilters.includes(item.subcategory || '')) return false;
      }

      // Check vegetarian filter
      if (activeFilters.includes('vegetarian')) {
        if (!item.is_vegetarian) return false;
      }

      // Check no-allergens filter
      if (activeFilters.includes('no-allergens')) {
        if (item.allergens && item.allergens.length > 0) return false;
      }

      return true;
    });
  }, [menuItems, activeFilters, availableCategories, availableSubcategories]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Weather Context */}
      {weatherData && (
        <SmartMenuWeatherContext 
          weatherData={weatherData}
          contextData={contextData}
          menuItems={menuItems}
        />
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={handleSearch}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* Menu Stats and Badges */}
      <SmartMenuBadges 
        menuItems={filteredItems}
        totalItems={menuItems.length}
        activeFilters={activeFilters}
      />

      {/* Filters */}
      <SmartMenuFilters
        activeFilters={activeFilters}
        onFilterChange={setActiveFilters}
        availableCategories={availableCategories}
        availableSubcategories={availableSubcategories}
      />

      {/* Menu Items */}
      <SmartMenuItems
        items={filteredItems}
        onAddToCart={onAddToCart}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default SmartMenu;
