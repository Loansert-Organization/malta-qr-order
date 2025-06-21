
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  category: string;
  popular: boolean;
  prep_time?: string;
  available: boolean;
}

export interface AIInsights {
  trending_items: string[];
  recommended_categories: string[];
  weather_suggestions: string[];
  time_based_priorities: string[];
}

export interface WeatherData {
  condition: string;
  temperature: number;
  recommendations: string[];
}

export interface SmartMenuProps {
  menuItems: MenuItem[];
  onAddToCart: (item: MenuItem) => void;
  aiInsights?: AIInsights;
  weatherData?: WeatherData;
  searchQuery?: string;
}

export interface BadgeInfo {
  text: string;
  variant: 'default' | 'secondary' | 'outline';
  icon: React.ComponentType<{ className?: string }>;
}
