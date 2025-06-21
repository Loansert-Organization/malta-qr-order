
import React from 'react';
import HeroSection from '../HeroSection';
import SearchSection from '../SearchSection';
import AIInsightsPanel from '../AIInsightsPanel';
import SmartMenu from '../SmartMenu';

interface LeftColumnProps {
  layout: any;
  vendor: any;
  weatherData: any;
  contextData: any;
  searchQuery: string;
  menuItems: any[];
  handleHeroCtaClick: () => void;
  handleSearch: (query: string) => void;
  addToCart: (item: any) => void;
}

const LeftColumn: React.FC<LeftColumnProps> = ({
  layout,
  vendor,
  weatherData,
  contextData,
  searchQuery,
  menuItems,
  handleHeroCtaClick,
  handleSearch,
  addToCart
}) => {
  return (
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
  );
};

export default LeftColumn;
