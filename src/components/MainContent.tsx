
import React, { useState } from 'react';
import CartSection from './CartSidebar';
import AIWaiterButton from './AIWaiterButton';
import Header from './MainContent/Header';
import LeftColumn from './MainContent/LeftColumn';
import AIModals from './MainContent/AIModals';

interface MainContentProps {
  vendor: any;
  layout: any;
  weatherData: any;
  menuItems: any[];
  cart: any[];
  searchQuery: string;
  contextData: any;
  handleHeroCtaClick: () => void;
  handleSearch: (query: string) => void;
  addToCart: (item: any) => void;
  removeFromCart: (itemId: string) => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  guestSessionId: string;
}

const MainContent = ({
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
}: MainContentProps) => {
  const [showAIWaiter, setShowAIWaiter] = useState(false);
  const [showAIVerification, setShowAIVerification] = useState(false);

  const handleOrderComplete = (orderId: string) => {
    console.log('Order completed:', orderId);
    // Additional order completion logic can be added here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        vendor={vendor}
        onAIWaiterClick={() => setShowAIWaiter(true)}
        onAIVerificationClick={() => setShowAIVerification(true)}
      />

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Menu and Content */}
          <LeftColumn
            layout={layout}
            vendor={vendor}
            weatherData={weatherData}
            contextData={contextData}
            searchQuery={searchQuery}
            menuItems={menuItems}
            handleHeroCtaClick={handleHeroCtaClick}
            handleSearch={handleSearch}
            addToCart={addToCart}
          />

          {/* Right Column - Cart */}
          <CartSection
            cart={cart}
            onAddToCart={addToCart}
            onRemoveFromCart={removeFromCart}
            getTotalPrice={getTotalPrice}
            getTotalItems={getTotalItems}
            vendorId={vendor.id}
            guestSessionId={guestSessionId}
            onOrderComplete={handleOrderComplete}
          />
        </div>
      </div>

      {/* AI Modals */}
      <AIModals
        showAIWaiter={showAIWaiter}
        showAIVerification={showAIVerification}
        onCloseAIWaiter={() => setShowAIWaiter(false)}
        onCloseAIVerification={() => setShowAIVerification(false)}
        onAddToCart={addToCart}
        vendorSlug={vendor.slug}
        guestSessionId={guestSessionId}
      />

      {/* AI Waiter Button */}
      <AIWaiterButton onClick={() => setShowAIWaiter(true)} />
    </div>
  );
};

export default MainContent;
