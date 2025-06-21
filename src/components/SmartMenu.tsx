
import { useState, useEffect, useMemo } from 'react';
import { SmartMenuWeatherContext } from './SmartMenu/SmartMenuWeatherContext';
import { SmartMenuFilters } from './SmartMenu/SmartMenuFilters';
import { SmartMenuItems } from './SmartMenu/SmartMenuItems';
import { smartSortItems, smartSortCategories } from './SmartMenu/utils';
import { SmartMenuProps } from './SmartMenu/types';

const SmartMenu = ({ 
  menuItems, 
  onAddToCart, 
  aiInsights, 
  weatherData,
  searchQuery = ''
}: SmartMenuProps) => {
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Smart filtering and sorting based on AI insights
  const smartSortedItems = useMemo(() => {
    return smartSortItems(menuItems, searchQuery, selectedCategory, aiInsights, weatherData);
  }, [menuItems, searchQuery, selectedCategory, aiInsights, weatherData]);

  // Get unique categories with smart ordering
  const smartCategories = useMemo(() => {
    const categories = [...new Set(menuItems.map(item => item.category))];
    return smartSortCategories(categories, aiInsights);
  }, [menuItems, aiInsights]);

  useEffect(() => {
    setFilteredItems(smartSortedItems);
  }, [smartSortedItems]);

  return (
    <div className="space-y-6">
      {/* Weather Context */}
      {weatherData && (
        <SmartMenuWeatherContext weatherData={weatherData} />
      )}

      {/* Category Filters */}
      <SmartMenuFilters
        categories={smartCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        aiInsights={aiInsights}
      />

      {/* Menu Items */}
      <SmartMenuItems
        items={filteredItems}
        onAddToCart={onAddToCart}
        aiInsights={aiInsights}
        weatherData={weatherData}
      />
    </div>
  );
};

export default SmartMenu;
