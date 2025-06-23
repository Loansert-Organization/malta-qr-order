
import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useOrderDemo } from '@/hooks/useOrderDemo';
import LoadingState from '@/components/LoadingState';
import NotFoundState from '@/components/NotFoundState';
import Header from '@/components/MainContent/Header';
import LeftColumn from '@/components/MainContent/LeftColumn';
import CartSection from '@/components/MainContent/CartSection';
import AIModals from '@/components/MainContent/AIModals';
import RealTimeOrderTracker from '@/components/tracking/RealTimeOrderTracker';

const OrderPage = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const {
    vendor,
    menuItems,
    cart,
    loading: orderLoading,
    searchQuery,
    layout,
    weatherData,
    contextData,
    guestSessionId,
    handleSearch,
    addToCart,
    removeFromCart,
    getTotalPrice,
    getTotalItems
  } = useOrderDemo(vendorSlug || '');

  const [showAIWaiter, setShowAIWaiter] = useState(false);
  const [showAIVerification, setShowAIVerification] = useState(false);

  useEffect(() => {
    console.log('OrderPage mounted for vendor:', vendorSlug);
    console.log('Guest session ID:', guestSessionId);
    if (orderId) {
      console.log('Order ID from URL:', orderId);
    }
  }, [vendorSlug, guestSessionId, orderId]);

  if (orderLoading) {
    return <LoadingState />;
  }

  if (!vendor) {
    return (
      <NotFoundState
        title="Restaurant Not Found"
        description="The restaurant you're looking for doesn't exist or is currently unavailable."
        actionText="Browse All Restaurants"
        actionTo="/"
      />
    );
  }

  const handleHeroCtaClick = () => {
    // Scroll to menu section or open AI waiter
    const menuSection = document.getElementById('menu-section');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      setShowAIWaiter(true);
    }
  };

  // If we have an order ID in the URL, show order tracking
  if (orderId && guestSessionId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          vendor={vendor}
          onAIWaiterClick={() => setShowAIWaiter(true)}
          onAIVerificationClick={() => setShowAIVerification(true)}
        />
        
        <div className="container mx-auto px-4 py-6">
          <RealTimeOrderTracker
            orderId={orderId}
            guestSessionId={guestSessionId}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        vendor={vendor}
        onAIWaiterClick={() => setShowAIWaiter(true)}
        onAIVerificationClick={() => setShowAIVerification(true)}
      />

      {/* Main Content */}
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
            vendor={vendor}
            guestSessionId={guestSessionId}
            removeFromCart={removeFromCart}
            getTotalPrice={getTotalPrice}
            getTotalItems={getTotalItems}
          />
        </div>
      </div>

      {/* AI Modals */}
      <AIModals
        vendorId={vendor.id}
        vendorName={vendor.name}
        guestSessionId={guestSessionId}
        showAIWaiter={showAIWaiter}
        showAIVerification={showAIVerification}
        onCloseAIWaiter={() => setShowAIWaiter(false)}
        onCloseAIVerification={() => setShowAIVerification(false)}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default OrderPage;
