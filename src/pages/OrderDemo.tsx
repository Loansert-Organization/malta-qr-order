
import React from 'react';
import { useParams } from 'react-router-dom';
import { useOrderDemo } from '@/hooks/useOrderDemo';
import LoadingState from '@/components/LoadingState';
import NoDataState from '@/components/NoDataState';
import MainContent from '@/components/MainContent';
import { Store } from 'lucide-react';

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
    addToCart,
    removeFromCart,
    handleSearch,
    getTotalPrice,
    getTotalItems
  } = useOrderDemo(slug || '');

  const handleHeroCtaClick = () => {
    // Scroll to menu section
    const menuElement = document.getElementById('menu-section');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (!vendor) {
    return (
      <NoDataState
        icon={Store}
        title="Restaurant Not Found"
        description={`No restaurant found with the identifier "${slug}"`}
        suggestions={[
          "Check the URL for typos",
          "Try scanning the QR code again",
          "Contact the restaurant for the correct link"
        ]}
        actionText="Try Again"
        onAction={() => window.location.reload()}
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
