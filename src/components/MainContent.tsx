
import React from 'react';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import VoiceSearch from '@/components/VoiceSearch';
import SmartMenu from '@/components/SmartMenu';
import CartSidebar from '@/components/CartSidebar';

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

interface CartItem extends MenuItem {
  quantity: number;
}

interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
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
  const aiInsights = {
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
        </div>

        {/* Cart Sidebar */}
        <div className="lg:col-span-1">
          <CartSidebar
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
