
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Heart, Star, Clock } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image?: string;
  rating: number;
  prepTime: string;
  isAvailable: boolean;
  isPopular?: boolean;
  allergens?: string[];
}

interface MobileMenuItemProps {
  item: MenuItem;
  quantity: number;
  isFavorite: boolean;
  onAddToCart: (itemId: string) => void;
  onRemoveFromCart: (itemId: string) => void;
  onToggleFavorite: (itemId: string) => void;
}

const MobileMenuItem: React.FC<MobileMenuItemProps> = ({
  item,
  quantity,
  isFavorite,
  onAddToCart,
  onRemoveFromCart,
  onToggleFavorite
}) => {
  return (
    <Card className={`transition-all duration-200 ${
      !item.isAvailable ? 'opacity-60' : 'hover:shadow-md'
    }`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-4">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              {item.isPopular && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                  Popular
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Star className="h-3 w-3 mr-1 text-yellow-500 fill-current" />
                <span className="font-medium">{item.rating}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>{item.prepTime}</span>
              </div>
            </div>
            
            {item.allergens && (
              <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                <strong>Contains:</strong> {item.allergens.join(', ')}
              </div>
            )}
          </div>
          
          <div className="text-right flex flex-col items-end space-y-2">
            <div className="font-bold text-lg text-gray-900">€{item.price.toFixed(2)}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleFavorite(item.id)}
              className="p-1 h-8 w-8"
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={`h-4 w-4 transition-colors ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                }`} 
              />
            </Button>
          </div>
        </div>

        {item.isAvailable ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRemoveFromCart(item.id)}
                disabled={!quantity}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Remove one item"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-8 text-center text-sm font-medium min-w-[2rem]">
                {quantity || 0}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddToCart(item.id)}
                className="h-8 w-8 p-0 rounded-full"
                aria-label="Add one item"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={() => onAddToCart(item.id)}
              className="ml-4 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add to Cart
            </Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <Badge variant="destructive" className="bg-red-100 text-red-800">
              Currently Unavailable
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileMenuItem;
