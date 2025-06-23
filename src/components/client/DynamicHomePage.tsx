
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Search, Mic, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Vendor {
  id: string;
  name: string;
  location?: string;
  description?: string;
}

interface DynamicHomePageProps {
  vendor: Vendor;
  onMenuClick: () => void;
  onAIWaiterClick: () => void;
  onQRScanClick: () => void;
}

interface AILayoutData {
  heroMessage: string;
  sections: Array<{
    title: string;
    items: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      image?: string;
      popular?: boolean;
    }>;
  }>;
  promoMessage?: string;
  timeBasedMessage?: string;
}

const DynamicHomePage: React.FC<DynamicHomePageProps> = ({
  vendor,
  onMenuClick,
  onAIWaiterClick,
  onQRScanClick
}) => {
  const [layoutData, setLayoutData] = useState<AILayoutData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVoiceSearch, setIsVoiceSearch] = useState(false);

  useEffect(() => {
    generateAILayout();
  }, [vendor.id]);

  const generateAILayout = async () => {
    // Mock AI-generated layout based on time, location, and vendor
    const currentHour = new Date().getHours();
    const isHappyHour = currentHour >= 17 && currentHour <= 19;
    const isEvening = currentHour >= 18;
    
    const mockLayout: AILayoutData = {
      heroMessage: isHappyHour 
        ? "🍹 Happy Hour until 8 PM! Special prices on cocktails"
        : isEvening 
          ? "✨ Perfect evening for dining! Check out tonight's specials"
          : "🌟 Welcome! Discover our signature dishes",
      sections: [
        {
          title: isEvening ? "Popular Tonight" : "Most Ordered Today",
          items: [
            {
              id: '1',
              name: 'Maltese Ftira',
              description: 'Traditional sourdough with local cheese',
              price: 8.50,
              popular: true
            },
            {
              id: '2', 
              name: 'Bragioli',
              description: 'Maltese beef olives with herbs',
              price: 18.50,
              popular: true
            }
          ]
        },
        {
          title: isHappyHour ? "Happy Hour Specials" : "Chef's Recommendations",
          items: [
            {
              id: '3',
              name: 'Kinnie Cocktail',
              description: 'Malta\'s signature drink with a twist',
              price: isHappyHour ? 5.50 : 7.50
            }
          ]
        }
      ],
      promoMessage: isHappyHour ? "🎉 All cocktails 25% off until 8 PM!" : undefined,
      timeBasedMessage: `📍 ${vendor.location} • Open until 11 PM`
    };

    setLayoutData(mockLayout);
  };

  const handleVoiceSearch = () => {
    setIsVoiceSearch(true);
    // Mock voice search - in real implementation would use Web Speech API
    setTimeout(() => {
      setSearchQuery("What's good with wine?");
      setIsVoiceSearch(false);
    }, 2000);
  };

  if (!layoutData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>AI is personalizing your experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* AI-Curated Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-blue-600 to-purple-600 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative p-6 flex flex-col justify-center h-full">
          <h1 className="text-2xl font-bold mb-2">{vendor.name}</h1>
          <p className="text-lg mb-4">{layoutData.heroMessage}</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{vendor.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Open Now</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span>AI-Enhanced</span>
            </div>
          </div>
        </div>
      </div>

      {/* Promo Message */}
      {layoutData.promoMessage && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 text-center">
          <p className="font-semibold">{layoutData.promoMessage}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="p-4 bg-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search menu or ask AI... (e.g., 'What's good with wine?')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-12 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
          />
          <Button
            size="sm"
            variant={isVoiceSearch ? "default" : "ghost"}
            className="absolute right-1 top-1 h-8 w-8 p-0"
            onClick={handleVoiceSearch}
            disabled={isVoiceSearch}
          >
            <Mic className={`h-4 w-4 ${isVoiceSearch ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Smart Menu Sections */}
      <div className="p-4 space-y-6">
        {layoutData.sections.map((section, index) => (
          <div key={index}>
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              {section.title}
              {section.title.includes('Popular') && (
                <Badge variant="secondary" className="ml-2">🔥 Trending</Badge>
              )}
            </h2>
            <div className="grid gap-4">
              {section.items.map((item) => (
                <Card key={item.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white">{item.name}</h3>
                          {item.popular && (
                            <Badge variant="secondary" className="text-xs">Popular</Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{item.description}</p>
                        <p className="text-blue-400 font-semibold">€{item.price.toFixed(2)}</p>
                      </div>
                      <Button size="sm" className="ml-4">
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="p-4 space-y-3">
        <Button 
          onClick={onMenuClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3"
        >
          View Complete Menu
        </Button>
        
        <Button 
          onClick={onAIWaiterClick}
          variant="outline"
          className="w-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-lg py-3"
        >
          🤖 Chat with AI Waiter
        </Button>

        <Button 
          onClick={onQRScanClick}
          variant="outline"
          className="w-full border-gray-500 text-gray-300 hover:bg-gray-700 flex items-center justify-center space-x-2"
        >
          <QrCode className="h-5 w-5" />
          <span>Scan QR to Order</span>
        </Button>
      </div>

      {/* Time-based Message */}
      {layoutData.timeBasedMessage && (
        <div className="p-4 text-center text-gray-400 text-sm">
          {layoutData.timeBasedMessage}
        </div>
      )}
    </div>
  );
};

export default DynamicHomePage;
