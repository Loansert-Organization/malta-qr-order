
import React from 'react';
import VoiceSearch from '@/components/VoiceSearch';
import SmartMenu from '@/components/SmartMenu';

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

interface AIInsights {
  trending_items: string[];
  recommended_categories: string[];
  weather_suggestions: string[];
  time_based_priorities: string[];
}

interface MenuSectionProps {
  menuItems: MenuItem[];
  searchQuery: string;
  aiInsights: AIInsights;
  weatherData: any;
  handleSearch: (query: string) => void;
  addToCart: (item: MenuItem) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  menuItems,
  searchQuery,
  aiInsights,
  weatherData,
  handleSearch,
  addToCart
}) => {
  return (
    <div id="menu-section" className="mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Our Menu</h2>
      
      {/* Voice Search */}
      <VoiceSearch
        onSearch={handleSearch}
        placeholder="Search menu items or ask for recommendations..."
      />
      
      {/* Smart Menu */}
      <SmartMenu
        menuItems={menuItems}
        onAddToCart={addToCart}
        aiInsights={aiInsights}
        weatherData={weatherData}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default MenuSection;
