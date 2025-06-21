
import React, { useState } from 'react';
import AIWaiterChat from '@/components/AIWaiterChat';
import VendorHeader from '@/components/VendorHeader';
import AIWaiterButton from '@/components/AIWaiterButton';
import LoadingState from '@/components/LoadingState';
import NotFoundState from '@/components/NotFoundState';
import MainContent from '@/components/MainContent';
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
    return <LoadingState />;
  }

  if (!vendor) {
    return <NotFoundState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <VendorHeader vendor={vendor} />

      {/* Main Content */}
      <MainContent
        vendor={vendor}
        layout={layout}
        weatherData={weatherData}
        menuItems={menuItems}
        cart={cart}
        searchQuery={searchQuery}
        contextData={contextData}
        handleHeroCtaClick={handleHeroCtaClick}
        handleSearch={handleSearch}
        addToCart={addToCart}
        removeFromCart={removeFromCart}
        getTotalPrice={getTotalPrice}
        getTotalItems={getTotalItems}
      />

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
