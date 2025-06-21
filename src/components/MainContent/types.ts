
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

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  location: string;
  description: string;
}

export interface AIInsights {
  trending_items: string[];
  recommended_categories: string[];
  weather_suggestions: string[];
  time_based_priorities: string[];
}
