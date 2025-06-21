import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, X, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HeroSection from './HeroSection';
import SearchSection from './SearchSection';
import AIInsightsPanel from './AIInsightsPanel';
import SmartMenu from './SmartMenu';
import CartSection from './CartSidebar';
import AIWaiterChat from './AIWaiterChat';
import AIWaiterButton from './AIWaiterButton';
import AISystemVerification from './AISystemVerification';

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
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-primary hover:text-primary/80">
                ← Back to Restaurants
              </Link>
              {vendor.logo_url && (
                <img 
                  src={vendor.logo_url} 
                  alt={vendor.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
                {vendor.location && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {vendor.location}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* AI System Verification Button (Admin/Development) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIVerification(true)}
                className="hidden md:flex"
              >
                <Bot className="h-4 w-4 mr-2" />
                AI System Test
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIWaiter(true)}
                className="flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Ask Kai AI</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Menu and Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Section */}
            <HeroSection
              layout={layout}
              vendor={vendor}
              weatherData={weatherData}
              contextData={contextData}
              onCtaClick={handleHeroCtaClick}
            />

            {/* Search and Filters */}
            <SearchSection
              searchQuery={searchQuery}
              onSearch={handleSearch}
              contextData={contextData}
            />

            {/* AI Insights Panel */}
            <AIInsightsPanel
              vendorId={vendor.id}
              contextData={contextData}
              onInsightClick={(insight) => {
                console.log('AI Insight clicked:', insight);
              }}
            />

            {/* Menu Items */}
            <SmartMenu
              menuItems={menuItems}
              onAddToCart={addToCart}
              aiInsights={contextData?.ai_insights}
              weatherData={weatherData}
              searchQuery={searchQuery}
            />
          </div>

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

      {/* AI Waiter Chat */}
      {showAIWaiter && (
        <AIWaiterChat
          onClose={() => setShowAIWaiter(false)}
          onAddToCart={addToCart}
          vendorSlug={vendor.slug}
          guestSessionId={guestSessionId}
        />
      )}

      {/* AI System Verification Modal */}
      {showAIVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">AI System Verification</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIVerification(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
              <AISystemVerification />
            </div>
          </div>
        </div>
      )}

      {/* AI Waiter Button */}
      <AIWaiterButton onClick={() => setShowAIWaiter(true)} />
    </div>
  );
};

export default MainContent;
