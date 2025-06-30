import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Star, Percent } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  discount_percentage?: number;
  discount_amount?: number;
  valid_until: string;
}

interface CarouselPromoProps {
  promotions: Promotion[];
  onPromoClick?: (promo: Promotion) => void;
  className?: string;
}

export const CarouselPromo: React.FC<CarouselPromoProps> = ({
  promotions,
  onPromoClick,
  className = ""
}) => {
  if (!promotions || promotions.length === 0) {
    return null;
  }

  const formatTimeLeft = (validUntil: string) => {
    const now = new Date();
    const end = new Date(validUntil);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d left`;
    }
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const getDiscountText = (promo: Promotion) => {
    if (promo.discount_percentage) {
      return `${promo.discount_percentage}% OFF`;
    }
    if (promo.discount_amount) {
      return `${promo.discount_amount} RWF OFF`;
    }
    return 'SPECIAL OFFER';
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🔥 Special Offers
        </h3>
        <Badge variant="secondary" className="text-xs">
          {promotions.length} active
        </Badge>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {promotions.map((promo) => (
          <Card 
            key={promo.id} 
            className="flex-shrink-0 w-80 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-700"
            onClick={() => onPromoClick?.(promo)}
          >
            <CardContent className="p-0">
              {/* Image Section */}
              <div className="relative h-32 bg-gradient-to-r from-orange-400 to-red-500 rounded-t-lg overflow-hidden">
                {promo.image_url ? (
                  <img 
                    src={promo.image_url} 
                    alt={promo.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-3xl mb-2">🍽️</div>
                      <div className="text-sm font-medium">ICUPA Special</div>
                    </div>
                  </div>
                )}
                
                {/* Discount Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-yellow-400 text-yellow-900 font-bold">
                    <Percent className="w-3 h-3 mr-1" />
                    {getDiscountText(promo)}
                  </Badge>
                </div>

                {/* Time Left Badge */}
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="bg-white/90 text-gray-700">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeLeft(promo.valid_until)}
                  </Badge>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-4 space-y-3">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {promo.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {promo.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-medium">Limited Time</span>
                  </div>
                  
                  <Button 
                    size="sm" 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPromoClick?.(promo);
                    }}
                  >
                    Claim
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default CarouselPromo;
