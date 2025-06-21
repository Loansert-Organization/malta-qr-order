
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Cloud, Sun, CloudRain } from 'lucide-react';

interface HeroSection {
  title: string;
  subtitle: string;
  cta_text: string;
  background_theme: 'warm' | 'cool' | 'neutral';
  show_promo: boolean;
  promo_text?: string;
  weather_context?: string;
  time_context?: string;
}

interface DynamicHeroProps {
  heroSection: HeroSection;
  onCtaClick: () => void;
  vendorName: string;
  location: string;
  weatherData?: {
    condition: string;
    temperature: number;
    description: string;
  };
}

const DynamicHeroSection = ({ 
  heroSection, 
  onCtaClick, 
  vendorName, 
  location, 
  weatherData 
}: DynamicHeroProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  const getWeatherIcon = () => {
    if (!weatherData) return <Cloud className="h-4 w-4" />;
    
    const condition = weatherData.condition.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) {
      return <Sun className="h-4 w-4 text-yellow-500" />;
    }
    if (condition.includes('rain') || condition.includes('storm')) {
      return <CloudRain className="h-4 w-4 text-blue-500" />;
    }
    return <Cloud className="h-4 w-4 text-gray-500" />;
  };

  const getBackgroundClass = () => {
    switch (heroSection.background_theme) {
      case 'warm':
        return 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-200';
      case 'cool':
        return 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200';
      default:
        return 'bg-gradient-to-r from-gray-100 to-slate-100 border-gray-200';
    }
  };

  // Ensure background_theme is properly typed
  const normalizedHeroSection: HeroSection = {
    ...heroSection,
    background_theme: (['warm', 'cool', 'neutral'].includes(heroSection.background_theme) 
      ? heroSection.background_theme 
      : 'neutral') as 'warm' | 'cool' | 'neutral'
  };

  return (
    <Card className={`mb-6 ${getBackgroundClass()} animate-fade-in`}>
      <CardContent className="p-6">
        {/* Context Bar */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{getTimeGreeting()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
            {weatherData && (
              <div className="flex items-center space-x-1">
                {getWeatherIcon()}
                <span>{weatherData.temperature}°C</span>
              </div>
            )}
          </div>
          {normalizedHeroSection.show_promo && normalizedHeroSection.promo_text && (
            <Badge variant="secondary" className="animate-pulse">
              {normalizedHeroSection.promo_text}
            </Badge>
          )}
        </div>

        {/* Main Hero Content */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 animate-scale-in">
            {normalizedHeroSection.title}
          </h1>
          <p className="text-gray-600 mb-4 text-lg">
            {normalizedHeroSection.subtitle}
          </p>
          
          {/* Weather-based recommendations */}
          {weatherData && (
            <p className="text-sm text-gray-500 mb-4 italic">
              {weatherData.description} - Perfect for {
              weatherData.temperature > 25 
                ? 'refreshing drinks and light meals' 
                : weatherData.temperature < 18 
                  ? 'warm comfort food and hot beverages'
                  : 'our full menu selection'
              }
            </p>
          )}

          <Button 
            onClick={onCtaClick}
            size="lg"
            className="bg-primary hover:bg-primary/90 transform hover:scale-105 transition-all duration-200"
          >
            {normalizedHeroSection.cta_text}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicHeroSection;
