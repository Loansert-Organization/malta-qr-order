import { UnknownRecord } from '@/types/utilities';

export interface LayoutContext {
  vendor_id: string;
  session_id?: string;
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night';
  day_of_week: string;
  location?: string;
  weather?: string;
  user_preferences?: {
    dietary_restrictions?: string[];
    favorite_categories?: string[];
    price_sensitivity?: 'low' | 'medium' | 'high';
  };
  order_history?: UnknownRecord[];
}

export interface DynamicLayout {
  hero_section: {
    title: string;
    subtitle: string;
    cta_text: string;
    background_theme: string;
    show_promo: boolean;
  };
  menu_sections: {
    id: string;
    title: string;
    priority: number;
    display_style: 'grid' | 'carousel' | 'list';
    item_limit?: number;
  }[];
  promotional_zones: {
    type: 'happy_hour' | 'weather_based' | 'time_based' | 'personalized';
    content: string;
    active: boolean;
  }[];
  ui_enhancements: {
    animations: string[];
    color_scheme: string;
    card_style: string;
  };
}

export interface AIRouterRequest {
  model: string;
  task: string;
  context: UnknownRecord;
  prompt: string;
  config: {
    temperature: number;
    max_tokens: number;
    fallback_model: string;
  };
}
