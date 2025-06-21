
import React from 'react';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import MenuSection from '@/components/MainContent/MenuSection';
import CartSection from '@/components/MainContent/CartSection';
import { MenuItem, CartItem, Vendor, AIInsights } from '@/components/MainContent/types';

interface MainContentProps {
  vendor: Vendor;
  layout: any;
  weatherData: any;
  menuItems: MenuItem[];
  cart: CartItem[];
  searchQuery: string;
  contextData: any;
  handleHeroCtaClick: () => void;
  handleSearch: (query: string) => void;
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const MainContent: React.FC<MainContentProps> = ({
  vendor,
  layout,
  weatherData,
  menuItems,
  cart,
  searchQuery,
  contextData,
  handleHeroCtaClick,
  handleSearch,
  addToCart,
  removeFromCart,
  getTotalPrice,
  getTotalItems
}) => {
  const aiInsights: AIInsights = {
    trending_items: contextData?.ai_insights?.trending_items || [],
    recommended_categories: contextData?.ai_insights?.recommended_categories || [],
    weather_suggestions: contextData?.weather?.recommendations || [],
    time_based_priorities: contextData?.ai_insights?.time_based_priorities || []
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Dynamic Hero Section */}
      {layout?.hero_section && (
        <DynamicHeroSection
          heroSection={layout.hero_section}
          onCtaClick={handleHeroCtaClick}
          vendorName={vendor.name}
          location={vendor.location || 'Malta'}
          weatherData={weatherData}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Items */}
        <div className="lg:col-span-2">
          <MenuSection
            menuItems={menuItems}
            searchQuery={searchQuery}
            aiInsights={aiInsights}
            weatherData={weatherData}
            handleSearch={handleSearch}
            addToCart={addToCart}
          />
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <CartSection
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            getTotalPrice={getTotalPrice}
            getTotalItems={getTotalItems}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
