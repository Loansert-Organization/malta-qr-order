
import { Badge } from '@/components/ui/badge';
import { Star, TrendingUp, Thermometer } from 'lucide-react';
import { MenuItem, AIInsights, WeatherData, BadgeInfo } from './types';

interface SmartMenuBadgesProps {
  item: MenuItem;
  aiInsights?: AIInsights;
  weatherData?: WeatherData;
}

export const SmartMenuBadges = ({ item, aiInsights, weatherData }: SmartMenuBadgesProps) => {
  const getBadges = (): BadgeInfo[] => {
    const badges: BadgeInfo[] = [];

    if (item.popular) {
      badges.push({ text: 'Popular', variant: 'default', icon: Star });
    }

    if (aiInsights?.trending_items.includes(item.name)) {
      badges.push({ text: 'Trending', variant: 'secondary', icon: TrendingUp });
    }

    if (weatherData?.recommendations.some(rec => 
      item.category.toLowerCase().includes(rec) || 
      item.name.toLowerCase().includes(rec)
    )) {
      badges.push({ text: 'Perfect Weather', variant: 'outline', icon: Thermometer });
    }

    return badges;
  };

  const badges = getBadges();

  return (
    <div className="flex space-x-1">
      {badges.map((badge, idx) => {
        const IconComponent = badge.icon;
        return (
          <Badge key={idx} variant={badge.variant} className="text-xs flex items-center space-x-1">
            <IconComponent className="h-3 w-3" />
            <span>{badge.text}</span>
          </Badge>
        );
      })}
    </div>
  );
};
