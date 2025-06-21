
export interface MaltaAIWaiterRequest {
  message: string;
  vendorSlug: string;
  guestSessionId: string;
  language?: 'en' | 'mt' | 'it';
  locationContext?: LocationContext;
}

export interface LocationContext {
  vendorLocation?: string;
  nearbyBars?: NearbyBar[];
  area?: string;
}

export interface NearbyBar {
  id: string;
  name: string;
  rating?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  popular?: boolean;
  available?: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  location?: string;
  menus: Array<{
    id: string;
    menu_items: MenuItem[];
  }>;
}

export interface AIWaiterResponse {
  response: string;
  suggestions: MenuItem[];
  layoutHints: LayoutHints;
}

export interface LayoutHints {
  cardStyle?: 'vertical' | 'horizontal';
  highlight?: 'popular' | 'price';
  animation?: 'subtle' | 'none';
  maltaTheme?: boolean;
}

export interface ProcessingMetadata {
  language?: string;
  location_context?: LocationContext;
  time_context?: string;
  nearby_venues?: number;
  malta_features?: LayoutHints;
}
