
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import SmartMenu from '@/components/SmartMenu';
import { MenuItem, AIInsights } from '@/components/MainContent/types';

interface MenuSectionProps {
  menuItems: MenuItem[];
  searchQuery: string;
  aiInsights: AIInsights;
  weatherData: any;
  handleSearch: (query: string) => void;
  addToCart: (item: MenuItem) => void;
  focusedCategory?: string;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  searchQuery,
  aiInsights,
  weatherData,
  handleSearch,
  addToCart,
  focusedCategory
}) => {
  // Filter items by focused category if provided
  const filteredItems = focusedCategory 
    ? menuItems.filter(item => 
        item.category.toLowerCase().includes(focusedCategory) ||
        item.name.toLowerCase().includes(focusedCategory)
      )
    : menuItems;

  return (
    <div id="menu-section" className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Focused Category Badge */}
      {focusedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              Showing items related to: <strong className="capitalize">{focusedCategory}</strong>
            </span>
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear filter
            </button>
          </div>
        </div>
      )}

      {/* Smart Menu */}
      <SmartMenu
        menuItems={filteredItems}
        onAddToCart={addToCart}
        aiInsights={aiInsights}
        weatherData={weatherData}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default MenuSection;
