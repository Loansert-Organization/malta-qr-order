
export interface Bar {
  id: string;
  name: string;
  address: string | null;
  contact_number: string | null;
  rating: number | null;
  review_count: number | null;
  google_place_id: string | null;
  website_url?: string | null;
  has_menu: boolean;
  data_quality_score?: number;
  is_active?: boolean;
  created_at: string | null;
  updated_at: string | null;
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
