
import React, { useState } from 'react';
import AIWaiterChat from '@/components/AIWaiterChat';
import DynamicHeroSection from '@/components/DynamicHeroSection';
import VoiceSearch from '@/components/VoiceSearch';
import SmartMenu from '@/components/SmartMenu';
import VendorHeader from '@/components/VendorHeader';
import CartSidebar from '@/components/CartSidebar';
import AIWaiterButton from '@/components/AIWaiterButton';
import { useOrderDemo } from '@/hooks/useOrderDemo';

const OrderDemo = () => {
  const [showAIChat, setShowAIChat] = useState(false);
  
  const {
    vendor,
    menuItems,
    cart,
    loading,
    layoutLoading,
    searchQuery,
    weatherData,
    guestSessionId,
    layout,
    contextData,
    addToCart,
    removeFromCart,
    handleSearch,
    handleHeroCtaClick,
    getTotalPrice,
    getTotalItems
  } = useOrderDemo();

  if (loading || layoutLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Not Found</h1>
          <p className="text-gray-600">The restaurant you're looking for doesn't exist or is not active.</p>
        </div>
      </div>
    );
  }

  const aiInsights = {
    trending_items: contextData?.ai_insights?.trending_items || [],
    recommended_categories: contextData?.ai_insights?.recommended_categories || [],
    weather_suggestions: contextData?.weather?.recommendations || [],
    time_based_priorities: contextData?.ai_insights?.time_based_priorities || []
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <VendorHeader vendor={vendor} />

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

      {/* AI Waiter Chat Button */}
      <AIWaiterButton onClick={() => setShowAIChat(true)} />

      {/* AI Waiter Chat Modal */}
      {showAIChat && (
        <AIWaiterChat
          onClose={() => setShowAIChat(false)}
          onAddToCart={addToCart}
          vendorSlug={vendor.slug}
          guestSessionId={guestSessionId}
        />
      )}
    </div>
  );
};

export default OrderDemo;
