
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Star } from 'lucide-react';

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

interface HeroSectionProps {
  layout: Layout;
  vendor: Vendor;
  weatherData: WeatherData;
  contextData: ContextData;
  onCtaClick: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  layout,
  vendor: _vendor,
  weatherData: _weatherData,
  contextData,
  onCtaClick
}) => {
  const getTimeBasedMessage = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "Good Morning! Start your day right";
    if (hour >= 12 && hour < 17) return "Perfect time for lunch";
    if (hour >= 17 && hour < 22) return "Evening dining awaits";
    return "Late night cravings? We've got you covered";
  };

  const isHappyHour = contextData?.isHappyHour || (new Date().getHours() >= 17 && new Date().getHours() <= 19);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">{layout.heroSection.title}</h2>
                  <p className="text-blue-100 text-lg">{getTimeBasedMessage()}</p>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">4.8 (127 reviews)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">15-25 min</span>
                  </div>
                </div>
                
                {isHappyHour && (
                  <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-400">
                    🍹 Happy Hour until 8 PM!
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                onClick={onCtaClick}
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                {layout.heroSection.ctaText}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HeroSection;
