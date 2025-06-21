
import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, MessageCircle, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  vendor: any;
  onAIWaiterClick: () => void;
  onAIVerificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ vendor, onAIWaiterClick, onAIVerificationClick }) => {
  return (
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
              onClick={onAIVerificationClick}
              className="hidden md:flex"
            >
              <Bot className="h-4 w-4 mr-2" />
              AI System Test
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onAIWaiterClick}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Ask Kai AI</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
