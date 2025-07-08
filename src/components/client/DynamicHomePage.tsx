import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Clock, 
  MapPin, 
  Sparkles, 
  TrendingUp,
  Sun,
  CloudRain,
  MessageCircle
} from 'lucide-react';
import { UnknownRecord } from '@/types/utilities';

interface VendorData {
  business_name?: string;
}

interface WeatherData {
  weather?: Array<{ main: string }>;
  main?: { temp: number };
}

interface ContextData {
  timeOfDay?: string;
}

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  background: string;
  cta: string;
}

interface PromoContent {
  type: string;
  title: string;
  description: string;
  timeLeft: string;
  urgent: boolean;
}

interface DynamicHomePageProps {
  vendorData: VendorData;
  weatherData: WeatherData;
  contextData: ContextData;
  onCategorySelect: (category: string) => void;
  onItemSelect: (item: MenuItem) => void;
  onOpenAIWaiter: () => void;
}

const DynamicHomePage: React.FC<DynamicHomePageProps> = ({
  vendorData,
  weatherData,
  contextData,
  onCategorySelect,
  onItemSelect,
  onOpenAIWaiter
}) => {
  const [heroContent, setHeroContent] = useState<HeroContent | null>(null);
  const [promoSection, setPromoSection] = useState<PromoContent | null>(null);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);

  const generateDynamicContent = useCallback(() => {
    const timeOfDay = contextData?.timeOfDay || 'evening';
    const isHappyHour = checkHappyHour();
    const weatherCondition = weatherData?.weather?.[0]?.main || 'Clear';

    // Generate hero content based on context
    const heroData = generateHeroContent(timeOfDay, weatherCondition, isHappyHour);
    setHeroContent(heroData);

    // Generate promotional content
    const promoData = generatePromoContent(timeOfDay, isHappyHour);
    setPromoSection(promoData);

    // Generate featured items
    const featured = generateFeaturedItems(timeOfDay, weatherCondition);
    setFeaturedItems(featured);
  }, [vendorData, weatherData, contextData]);

  useEffect(() => {
    generateDynamicContent();
  }, [generateDynamicContent]);

  const checkHappyHour = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 17 && hour <= 19; // 5 PM to 7 PM
  };

  const generateHeroContent = (timeOfDay: string, weather: string, isHappyHour: boolean): HeroContent => {
    if (isHappyHour) {
      return {
        title: "🍹 Happy Hour Active!",
        subtitle: "Special prices until 7 PM",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        cta: "View Happy Hour Menu"
      };
    }

    if (timeOfDay === 'morning') {
      return {
        title: "☀️ Good Morning Malta!",
        subtitle: "Start your day with fresh breakfast",
        background: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
        cta: "Browse Breakfast"
      };
    }

    if (weather === 'Rain') {
      return {
        title: "🌧️ Cozy Indoor Vibes",
        subtitle: "Warm drinks and comfort food",
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        cta: "Hot Beverages"
      };
    }

    return {
      title: `Welcome to ${vendorData?.business_name || 'ICUPA Malta'}`,
      subtitle: "Discover amazing flavors tonight",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      cta: "Explore Menu"
    };
  };

  const generatePromoContent = (timeOfDay: string, isHappyHour: boolean): PromoContent | null => {
    if (isHappyHour) {
      return {
        type: "happy_hour",
        title: "🎉 Happy Hour Special",
        description: "25% off all cocktails and appetizers",
        timeLeft: "2 hours remaining",
        urgent: true
      };
    }

    if (timeOfDay === 'evening') {
      return {
        type: "dinner_combo",
        title: "🍽️ Dinner Combo Deal",
        description: "Main course + drink for €18",
        timeLeft: "Today only",
        urgent: false
      };
    }

    return null;
  };

  const generateFeaturedItems = (timeOfDay: string, weather: string): MenuItem[] => {
    // Mock featured items based on context
    const baseItems: MenuItem[] = [
      { id: 1, name: "Maltese Ftira", price: 8.50, category: "local", image: "🥖" },
      { id: 2, name: "Mediterranean Salad", price: 12.00, category: "healthy", image: "🥗" },
      { id: 3, name: "Kinnie Cocktail", price: 7.50, category: "drinks", image: "🍹" },
      { id: 4, name: "Pastizzi Platter", price: 6.00, category: "snacks", image: "🥧" }
    ];

    // Filter based on context
    if (timeOfDay === 'morning') {
      return baseItems.filter(item => ['healthy', 'local'].includes(item.category));
    }

    if (weather === 'Rain') {
      return baseItems.filter(item => ['drinks', 'snacks'].includes(item.category));
    }

    return baseItems;
  };

  const getWeatherIcon = () => {
    const condition = weatherData?.weather?.[0]?.main;
    switch (condition) {
      case 'Rain': return <CloudRain className="h-5 w-5" />;
      case 'Clear': return <Sun className="h-5 w-5" />;
      default: return <Sun className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Dynamic Hero Section */}
      {heroContent && (
        <div 
          className="relative h-64 flex items-center justify-center text-center"
          style={{ background: heroContent.background }}
        >
          <div className="max-w-md mx-auto p-6">
            <h1 className="text-3xl font-bold mb-2 text-white">
              {heroContent.title}
            </h1>
            <p className="text-lg mb-4 text-white/90">
              {heroContent.subtitle}
            </p>
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => onCategorySelect('featured')}
            >
              {heroContent.cta}
            </Button>
          </div>
          
          {/* Weather indicator */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 text-white/80">
            {getWeatherIcon()}
            <span className="text-sm">
              {weatherData?.main?.temp ? `${Math.round(weatherData.main.temp)}°C` : 'Malta'}
            </span>
          </div>
        </div>
      )}

      {/* Promotional Section */}
      {promoSection && (
        <div className="p-4">
          <Card className={`bg-gradient-to-r ${promoSection.urgent ? 'from-red-600 to-pink-600' : 'from-blue-600 to-purple-600'} border-none`}>
            <CardContent className="p-4 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                {promoSection.title}
              </h3>
              <p className="text-white/90 mb-2">
                {promoSection.description}
              </p>
              <Badge variant="secondary" className="bg-white/20 text-white">
                <Clock className="h-3 w-3 mr-1" />
                {promoSection.timeLeft}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Categories */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Picks</h2>
          <Sparkles className="h-5 w-5 text-yellow-400" />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {['🍽️ Mains', '🍹 Drinks', '🥗 Light Bites', '🍰 Desserts'].map((category, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-16 bg-gray-800 border-gray-700 hover:bg-gray-700"
              onClick={() => onCategorySelect(category.split(' ')[1].toLowerCase())}
            >
              <div className="text-center">
                <div className="text-2xl mb-1">{category.split(' ')[0]}</div>
                <div className="text-sm">{category.split(' ')[1]}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Featured Items */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured Tonight</h2>
          <TrendingUp className="h-5 w-5 text-green-400" />
        </div>
        
        <div className="space-y-3">
          {featuredItems.map((item) => (
            <Card key={item.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{item.image}</div>
                  <div>
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <p className="text-green-400 font-semibold">€{item.price.toFixed(2)}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => onItemSelect(item)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Add
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Waiter CTA */}
      <div className="p-4">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-none">
          <CardContent className="p-4 text-center">
            <MessageCircle className="h-8 w-8 mx-auto mb-2 text-white" />
            <h3 className="font-semibold text-white mb-2">Need Help Choosing?</h3>
            <p className="text-white/90 text-sm mb-3">
              Chat with our AI waiter for personalized recommendations
            </p>
            <Button
              variant="secondary"
              onClick={onOpenAIWaiter}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Chat with AI Waiter
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Location Info */}
      <div className="p-4 pb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">
                  {vendorData?.location || 'Malta'}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-300">4.8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DynamicHomePage;
