
import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrderDemo } from '@/hooks/useOrderDemo';
import LoadingState from '@/components/LoadingState';
import NotFoundState from '@/components/NotFoundState';
import MainContent from '@/components/MainContent';

const OrderDemo = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const {
    // Data
    vendor,
    layout,
    weatherData,
    menuItems,
    cart,
    searchQuery,
    contextData,
    guestSessionId,
    
    // State
    loading,
    
    // Actions
    handleHeroCtaClick,
    handleSearch,
    addToCart,
    removeFromCart,
    getTotalPrice,
    getTotalItems
  } = useOrderDemo();

  if (loading) {
    return <LoadingState />;
  }

  if (!vendor) {
    return (
      <NotFoundState
        title="Restaurant Not Found"
        description={`No restaurant found with the identifier "${slug}"`}
        suggestions={[
          "Check the URL for typos",
          "Try scanning the QR code again",
          "Contact the restaurant for the correct link"
        ]}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Always render the MainContent, even with empty menu items
  // The SmartMenu component will handle the empty state gracefully
  return (
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
  );
};

export default OrderDemo;
