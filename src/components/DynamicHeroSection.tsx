
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  location?: string;
  description?: string;
}

interface DynamicHeroSectionProps {
  vendor: Vendor;
}

const DynamicHeroSection: React.FC<DynamicHeroSectionProps> = ({ vendor }) => {
  const [heroContent, setHeroContent] = useState({
    title: "Welcome to " + vendor.name,
    subtitle: "Discover our menu with AI assistance",
    backgroundImage: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
  });
  
  const [timeBasedMessage, setTimeBasedMessage] = useState("");

  useEffect(() => {
    // Generate time-based messaging
    const now = new Date();
    const hour = now.getHours();
    
    if (hour >= 17 && hour <= 20) {
      setTimeBasedMessage("🍹 Happy Hour Special!");
      setHeroContent(prev => ({
        ...prev,
        title: "Happy Hour at " + vendor.name,
        subtitle: "Special drinks and offers until 8 PM"
      }));
    } else if (hour >= 12 && hour <= 14) {
      setTimeBasedMessage("🍽️ Lunch Time!");
      setHeroContent(prev => ({
        ...prev,
        subtitle: "Perfect time for our lunch specials"
      }));
    } else if (hour >= 19 && hour <= 22) {
      setTimeBasedMessage("🌙 Dinner Time!");
      setHeroContent(prev => ({
        ...prev,
        subtitle: "Experience our evening menu"
      }));
    }

    // Simulate AI layout generation
    generateDynamicContent();
  }, [vendor]);

  const generateDynamicContent = () => {
    // This would typically call the AI Router edge function
    // For now, we'll simulate dynamic content based on context
    // Removed contextData as it was unused

    // Simulate AI-generated hero variations
    const variations = [
      {
        title: `Welcome to ${vendor.name}`,
        subtitle: "Order with our AI waiter for personalized recommendations",
        cta: "Start Ordering"
      },
      {
        title: `${vendor.name} - Malta's Finest`,
        subtitle: "Experience authentic Maltese cuisine with modern AI service",
        cta: "Explore Menu"
      }
    ];

    const selectedVariation = variations[Math.floor(Math.random() * variations.length)];
    
    setHeroContent(prev => ({
      ...prev,
      ...selectedVariation
    }));
  };

  return (
    <div className="relative h-64 md:h-80 overflow-hidden rounded-b-lg">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroContent.backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
        {timeBasedMessage && (
          <div className="mb-4 px-4 py-2 bg-orange-600 rounded-full text-sm font-semibold animate-pulse">
            {timeBasedMessage}
          </div>
        )}
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {heroContent.title}
        </h1>
        
        <p className="text-lg md:text-xl mb-6 max-w-2xl opacity-90">
          {heroContent.subtitle}
        </p>

        {/* Vendor Info */}
        <div className="flex items-center space-x-4 text-sm opacity-80">
          {vendor.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{vendor.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-current text-yellow-400" />
            <span>AI-Powered Service</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>Open Now</span>
          </div>
        </div>

        {/* AI Enhancement Badge */}
        <div className="mt-4 px-3 py-1 bg-blue-600 bg-opacity-80 rounded-full text-xs font-medium">
          ✨ Enhanced with AI recommendations
        </div>
      </div>
    </div>
  );
};

export default DynamicHeroSection;
