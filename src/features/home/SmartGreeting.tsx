import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Clock, MapPin } from 'lucide-react';

interface SmartGreetingProps {
  greeting: {
    message: string;
    subtext: string;
  };
  tableNumber?: string;
  className?: string;
}

export const SmartGreeting: React.FC<SmartGreetingProps> = ({
  greeting,
  tableNumber,
  className = ""
}) => {
  const getTimeBasedIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "🌅";
    if (hour < 17) return "☀️";
    return "🌙";
  };

  const getTimeBasedGradient = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "from-orange-400 to-pink-400";
    if (hour < 17) return "from-blue-400 to-purple-400";
    return "from-purple-600 to-blue-600";
  };

  return (
    <Card className={`relative overflow-hidden border-0 ${className}`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-r ${getTimeBasedGradient()} opacity-90`} />
      
      {/* Content */}
      <div className="relative p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getTimeBasedIcon()}</span>
            <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          
          {tableNumber && (
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <MapPin className="w-3 h-3 mr-1" />
              Table #{tableNumber}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-wide">
            {greeting.message}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-white/90">
            <Clock className="w-4 h-4" />
            <span>{greeting.subtext}</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-2 right-2 opacity-20">
          <div className="w-20 h-20 border border-white/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-2 left-2 opacity-10">
          <div className="w-16 h-16 border border-white/30 rounded-full"></div>
        </div>
      </div>
    </Card>
  );
};

export default SmartGreeting;
