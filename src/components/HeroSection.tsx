
import React from 'react';
import { Clock, MapPin, Star } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  location?: string;
  description?: string;
}

interface HeroSectionProps {
  vendor: Vendor;
  onCtaClick?: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ vendor, onCtaClick }) => {
  return (
    <div className="relative h-64 md:h-80 overflow-hidden rounded-b-lg">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80)` 
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Welcome to {vendor.name}
        </h1>
        
        <p className="text-lg md:text-xl mb-6 max-w-2xl opacity-90">
          {vendor.description || "Experience our menu with AI assistance"}
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

        {onCtaClick && (
          <button 
            onClick={onCtaClick}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            Explore Menu
          </button>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
