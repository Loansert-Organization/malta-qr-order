
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, MapPin, Clock } from 'lucide-react';

interface HeaderProps {
  vendor: any;
  onAIWaiterClick: () => void;
  onAIVerificationClick: () => void;
}

const Header: React.FC<HeaderProps> = ({
  vendor,
  onAIWaiterClick,
  onAIVerificationClick
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Vendor Info */}
          <div className="flex items-center space-x-4">
            {vendor.logo_url && (
              <img 
                src={vendor.logo_url} 
                alt={vendor.name}
                className="h-12 w-12 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                {vendor.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{vendor.location}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Open until 11:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAIVerificationClick}
              className="flex items-center space-x-1"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">AI Status</span>
            </Button>
            
            <Button
              onClick={onAIWaiterClick}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Bot className="h-4 w-4" />
              <span>Ask AI Waiter</span>
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">
                Online
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
