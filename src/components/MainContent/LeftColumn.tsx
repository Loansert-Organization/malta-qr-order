import React from 'react';
import HeroSection from './HeroSection';
import MenuSection from './MenuSection';
import SearchBar from './SearchBar';

interface Layout {
  heroSection: {
    title: string;
    ctaText: string;
  };
}

interface Vendor {
  name: string;
  logo_url?: string;
  location?: string;
}

interface WeatherData {
  temperature?: number;
  condition?: string;
  humidity?: number;
}

interface ContextData {
  isHappyHour?: boolean;
  timeOfDay?: string;
  specialOffers?: string[];
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category?: string;
  is_available?: boolean;
}

interface LeftColumnProps {
  layout: Layout;
  vendor: Vendor;
  weatherData: WeatherData;
  contextData: ContextData;
  searchQuery: string;
  menuItems: MenuItem[];
  handleHeroCtaClick: () => void;
  handleSearch: (query: string) => void;
  addToCart: (item: MenuItem) => Promise<void>;
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
  // const [data, setData] = useState();
  // const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const result = await fetch('/api/data');
  //       const json = await result.json();
  //       setData(json);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //     setLoading(false);
  //   };

  //   fetchData();
  // }, []);

  // const processData = (items: any[]) => {
  //   return items.map(item => ({
  //     ...item,
  //     processed: true
  //   }));
  // };

  // if (loading) return <div>Loading...</div>;

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
