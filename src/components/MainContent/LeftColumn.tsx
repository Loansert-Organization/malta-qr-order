import React, { useState, useEffect } from 'react';
import HeroSection from './HeroSection';
import MenuSection from './MenuSection';
import SearchBar from './SearchBar';

interface LeftColumnProps {
  layout: any;
  vendor: any;
  weatherData: any;
  contextData: any;
  searchQuery: string;
  menuItems: any[];
  handleHeroCtaClick: () => void;
  handleSearch: (query: string) => void;
  addToCart: (item: any) => Promise<void>;
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
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await fetch('/api/data');
        const json = await result.json();
        setData(json);
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const processData = (items) => {
    return items.map(item => ({
      ...item,
      processed: true
    }));
  };

  if (loading) return <div>Loading...</div>;

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

      {/* Search Bar */}
      <SearchBar
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />

      {/* Menu Section */}
      <MenuSection
        menuItems={menuItems}
        searchQuery={searchQuery}
        onAddToCart={addToCart}
      />
    </div>
  );
};

export default LeftColumn;
