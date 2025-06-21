
import { MapPin, Star, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface LocationAwareBannerProps {
  locationContext: {
    area: string;
    nearbyCount: number;
    avgRating: number;
  };
  nearbyBars: any[];
  language: 'en' | 'mt' | 'it';
}

const LocationAwareBanner = ({ locationContext, nearbyBars, language }: LocationAwareBannerProps) => {
  const texts = {
    en: {
      exploring: "Exploring",
      nearby: "nearby venues",
      avgRating: "avg rating",
      popular: "Popular spots nearby"
    },
    mt: {
      exploring: "Qed nesplora",
      nearby: "postijiet fil-qrib",
      avgRating: "rating medju",
      popular: "Postijiet popolari fil-qrib"
    },
    it: {
      exploring: "Esplorando",
      nearby: "locali nelle vicinanze",
      avgRating: "valutazione media",
      popular: "Posti popolari nelle vicinanze"
    }
  };

  const t = texts[language];

  return (
    <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {t.exploring} {locationContext.area}
          </span>
          <Badge variant="secondary" className="text-xs">
            {locationContext.nearbyCount} {t.nearby}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Star className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-gray-600">
            {locationContext.avgRating.toFixed(1)} {t.avgRating}
          </span>
        </div>
      </div>

      {nearbyBars.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 mb-1">{t.popular}:</p>
          <div className="flex flex-wrap gap-1">
            {nearbyBars.slice(0, 3).map((bar) => (
              <Badge key={bar.id} variant="outline" className="text-xs">
                {bar.name}
                {bar.rating && (
                  <span className="ml-1 text-yellow-600">
                    ★{bar.rating.toFixed(1)}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAwareBanner;
