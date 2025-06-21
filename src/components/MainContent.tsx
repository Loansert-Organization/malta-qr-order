
import React, { useState } from 'react';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import MenuSection from '@/components/MainContent/MenuSection';
import CartSection from '@/components/MainContent/CartSection';
import AIInsightsPanel from '@/components/AIInsightsPanel';
import { MenuItem, CartItem, Vendor, AIInsights } from '@/components/MainContent/types';

interface AIInsight {
  type: 'trending' | 'weather' | 'time' | 'social';
  title: string;
  description: string;
  items: string[];
  confidence: number;
}

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
  guestSessionId: string;
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
  getTotalItems,
  guestSessionId
}) => {
  const [focusedCategory, setFocusedCategory] = useState<string>('');

  const aiInsights: AIInsights = {
    trending_items: contextData?.ai_insights?.trending_items || [],
    recommended_categories: contextData?.ai_insights?.recommended_categories || [],
    weather_suggestions: contextData?.weather?.recommendations || [],
    time_based_priorities: contextData?.ai_insights?.time_based_priorities || []
  };

  const handleInsightClick = (insight: AIInsight) => {
    // Focus on the relevant category or items
    if (insight.items && insight.items.length > 0) {
      const category = insight.items[0];
      setFocusedCategory(category.toLowerCase());
      
      // Scroll to menu section
      const menuElement = document.getElementById('menu-section');
      if (menuElement) {
        menuElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* AI Insights Panel */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <AIInsightsPanel
            vendorId={vendor.id}
            contextData={contextData}
            onInsightClick={handleInsightClick}
          />
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <MenuSection
            menuItems={menuItems}
            searchQuery={searchQuery}
            aiInsights={aiInsights}
            weatherData={weatherData}
            handleSearch={handleSearch}
            addToCart={addToCart}
            focusedCategory={focusedCategory}
          />
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1 order-3">
          <CartSection
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            getTotalPrice={getTotalPrice}
            getTotalItems={getTotalItems}
            vendorId={vendor.id}
            guestSessionId={guestSessionId}
          />
        </div>
      </div>
    </div>
  );
};

export default MainContent;
