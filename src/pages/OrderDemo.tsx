
import React from 'react';
import { useOrderDemo } from '@/hooks/useOrderDemo';
import LoadingState from '@/components/LoadingState';
import NotFoundState from '@/components/NotFoundState';
import VendorHeader from '@/components/VendorHeader';
import MainContent from '@/components/MainContent';

const OrderDemo = () => {
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
    trackInteraction,
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
      <VendorHeader vendor={vendor} />
      
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
        guestSessionId={guestSessionId}
      />
    </div>
  );
};

export default OrderDemo;
