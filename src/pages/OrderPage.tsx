
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useOrderDemo } from '@/hooks/useOrderDemo';
import LoadingState from '@/components/LoadingState';
import NotFoundState from '@/components/NotFoundState';
import Header from '@/components/MainContent/Header';
import LeftColumn from '@/components/MainContent/LeftColumn';
import CartSection from '@/components/MainContent/CartSection';
import AIModals from '@/components/MainContent/AIModals';

const OrderPage = () => {
  const { vendorSlug } = useParams<{ vendorSlug: string }>();
  const {
    vendor,
    menuItems,
    cart,
    loading: orderLoading,
    error,
    searchQuery,
    layout,
    weatherData,
    contextData,
    handleSearch,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  } = useOrderDemo(vendorSlug || '');

  const [showAIWaiter, setShowAIWaiter] = useState(false);
  const [showAIVerification, setShowAIVerification] = useState(false);

  // Generate guest session ID for anonymous users
  const [guestSessionId] = useState(() => {
    const existing = localStorage.getItem('icupa_guest_session');
    if (existing) return existing;
    
    const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('icupa_guest_session', newId);
    return newId;
  });

  useEffect(() => {
    console.log('OrderPage mounted for vendor:', vendorSlug);
    console.log('Guest session ID:', guestSessionId);
  }, [vendorSlug, guestSessionId]);

  if (orderLoading) {
    return <LoadingState />;
  }

  if (error || !vendor) {
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
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            getTotalPrice={getTotalPrice}
            getTotalItems={getTotalItems}
          />
        </div>
      </div>

      {/* AI Modals */}
      <AIModals
        vendor={vendor}
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
