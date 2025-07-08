export interface Bar {
  id: string;
  name: string;
  address: string | null;
  contact_number: string | null;
  rating: number | null;
  review_count: number | null;
  google_place_id: string;
  data_quality_score?: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  location_gps?: unknown;
}

export interface FetchLog {
  id: string;
  operation_type: string;
  total_bars_processed: number;
  new_bars_added: number;
  bars_updated: number;
  errors_count: number;
  api_calls_made: number;
  operation_duration_ms: number;
  status: string;
  created_at: string;
  error_details?: any;
}

export interface ScheduledJob {
  id: string;
  job_name: string;
  last_run: string | null;
  next_run: string | null;
  status: string;
  run_count: number;
  success_count: number;
  failure_count: number;
  last_error?: string | null;
  config?: any;
}

export interface HealthMetrics {
  api_quota_used: number;
  api_quota_limit: number;
  success_rate: number;
  avg_response_time: number;
  last_successful_fetch: string | null;
  data_freshness_hours: number;
}

export type TabType = 'bars' | 'logs' | 'scheduling' | 'health' | 'management' | 'testing' | 'analytics';

export interface BarData {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  photos?: string[];
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  formatted_address: string;
  international_phone_number?: string;
  opening_hours?: {
    open_now: boolean;
    weekday_text?: string[];
  };
  price_level?: number;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

export interface GoogleMapsResponse {
  results: BarData[];
  status: string;
  next_page_token?: string;
}

export interface FetchBarsParams {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
  maxResults?: number;
}

export interface BarFetchResult {
  success: boolean;
  data?: BarData[];
  error?: string;
  totalResults?: number;
  error_details?: { message: string; code?: string; stack?: string };
}

export interface BarProcessingOptions {
  includePhotos: boolean;
  includeReviews: boolean;
  includeOpeningHours: boolean;
  maxPhotos?: number;
  maxReviews?: number;
  config?: {
    apiKey?: string;
    language?: string;
    region?: string;
  };
}
