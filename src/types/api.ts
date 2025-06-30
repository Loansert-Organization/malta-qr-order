// ✨ Refactored by Cursor – Audit Phase 1: Complete Type Safety System
import { z } from 'zod';

// =============================================================================
// CORE API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: ApiError;
  success: boolean;
  message?: string;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// =============================================================================
// USER & SESSION TYPES
// =============================================================================

export interface User {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role: 'client' | 'vendor' | 'admin';
  preferences?: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  dietary_restrictions?: string[];
  favorite_cuisines?: string[];
}

export interface UserSession {
  id: string;
  user_id?: string | null;
  session_token: string;
  device_info?: {
    userAgent: string;
    platform: string;
    language: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  is_anonymous: boolean;
  expires_at: string;
  created_at: string;
  last_activity: string;
}

export interface GuestSession {
  id: string;
  session_token: string;
  vendor_id?: string | null;
  preferences?: UserPreferences;
  cart_data?: CartData;
  created_at: string;
  last_activity: string;
  metadata: Record<string, unknown>;
}

// =============================================================================
// VENDOR & BUSINESS TYPES
// =============================================================================

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  location?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  phone_number?: string | null;
  email?: string | null;
  website?: string | null;
  opening_hours?: OpeningHours | null;
  contact_person?: string | null;
  revolut_link?: string | null;
  stripe_link?: string | null;
  active: boolean;
  verified: boolean;
  rating?: number | null;
  total_orders?: number;
  user_id?: string | null;
  settings?: VendorSettings;
  created_at: string;
  updated_at: string;
}

export interface OpeningHours {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
  holidays?: HolidaySchedule[];
}

export interface DaySchedule {
  open: string; // HH:MM format
  close: string; // HH:MM format
  closed: boolean;
}

export interface HolidaySchedule {
  date: string; // YYYY-MM-DD
  closed: boolean;
  special_hours?: DaySchedule;
  note?: string;
}

export interface VendorSettings {
  auto_accept_orders: boolean;
  max_preparation_time: number; // minutes
  delivery_radius?: number; // km
  minimum_order?: number; // currency amount
  tax_rate?: number; // percentage
  service_fee?: number; // percentage
  accepts_cash: boolean;
  accepts_card: boolean;
  theme_colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

// =============================================================================
// BAR & LOCATION TYPES
// =============================================================================

export interface Bar {
  id: string;
  name: string;
  address?: string | null;
  contact_number?: string | null;
  rating?: number | null;
  review_count?: number | null;
  location_gps?: string | null; // PostGIS point format
  google_place_id?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  user_ratings_total?: number | null;
  photo_ref?: string | null;
  photo_url?: string | null;
  tagline?: string | null;
  website_url?: string | null;
  cuisine_types?: string[];
  price_range?: 'budget' | 'moderate' | 'expensive' | 'fine_dining';
  features?: BarFeature[];
  created_at: string;
  updated_at: string;
}

export interface BarFeature {
  id: string;
  name: string;
  icon?: string;
  category: 'amenity' | 'service' | 'cuisine' | 'atmosphere';
}

// =============================================================================
// MENU & ITEM TYPES
// =============================================================================

export interface Menu {
  id: string;
  vendor_id: string;
  bar_id?: string | null;
  name: string;
  description?: string | null;
  active: boolean;
  display_order: number;
  availability_schedule?: AvailabilitySchedule;
  is_reviewed: boolean;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  vendor_id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  display_order: number;
  is_smart_category: boolean;
  smart_rules?: SmartCategoryRules;
  active: boolean;
  created_at: string;
}

export interface SmartCategoryRules {
  time_based?: {
    breakfast?: string[];
    lunch?: string[];
    dinner?: string[];
    late_night?: string[];
  };
  weather_based?: {
    hot?: string[];
    cold?: string[];
    rainy?: string[];
  };
  popularity_threshold?: number;
}

export interface MenuItem {
  id: string;
  menu_id: string;
  category_id?: string | null;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string | null;
  available: boolean;
  popular: boolean;
  featured: boolean;
  prep_time?: string | null;
  dietary_tags?: string[];
  allergens?: string[];
  nutritional_info?: NutritionalInfo;
  customization_options?: CustomizationOption[];
  bar_id?: string | null;
  source_url?: string | null;
  inventory_count?: number | null;
  calories?: number | null;
  spice_level?: 1 | 2 | 3 | 4 | 5;
  created_at: string;
  updated_at: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: number; // grams
  carbs?: number; // grams
  fat?: number; // grams
  fiber?: number; // grams
  sugar?: number; // grams
  sodium?: number; // mg
}

export interface CustomizationOption {
  id: string;
  name: string;
  type: 'single' | 'multiple' | 'text';
  required: boolean;
  options?: {
    id: string;
    name: string;
    price_modifier: number;
    available: boolean;
  }[];
  max_selections?: number;
}

export interface MenuItemModifier {
  id: string;
  menu_item_id: string;
  name: string;
  additional_price: number;
  category: 'size' | 'ingredient' | 'preparation' | 'side' | 'drink';
  required: boolean;
  available: boolean;
}

export interface AvailabilitySchedule {
  always_available: boolean;
  time_slots?: {
    start: string; // HH:MM
    end: string; // HH:MM
    days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  }[];
  blackout_dates?: string[]; // YYYY-MM-DD
}

// =============================================================================
// ORDER & CART TYPES
// =============================================================================

export interface Order {
  id: string;
  vendor_id?: string | null;
  bar_id?: string | null;
  user_id?: string | null;
  guest_session_id?: string | null;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  tax_amount: number;
  service_fee: number;
  delivery_fee: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  country: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  preparation_time?: number | null; // minutes
  estimated_completion?: string | null;
  customer_info: CustomerInfo;
  delivery_info?: DeliveryInfo;
  special_instructions?: string | null;
  agreed_to_terms: boolean;
  whatsapp_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'completed' 
  | 'cancelled' 
  | 'refunded';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'confirmed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export interface CustomerInfo {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  table_number?: string | null;
  room_number?: string | null;
}

export interface DeliveryInfo {
  type: 'pickup' | 'delivery' | 'dine_in';
  address?: string | null;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  delivery_instructions?: string | null;
  estimated_time?: number; // minutes
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item?: MenuItem; // populated field
  quantity: number;
  unit_price: number;
  total_price: number;
  special_requests?: string | null;
  modifiers?: OrderItemModifier[];
  customizations?: Record<string, unknown>;
}

export interface OrderItemModifier {
  id: string;
  modifier_id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartData {
  items: CartItem[];
  subtotal: number;
  estimated_total: number;
  item_count: number;
  vendor_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  menu_item_id: string;
  menu_item?: MenuItem;
  quantity: number;
  unit_price: number;
  total_price: number;
  modifiers?: CartItemModifier[];
  customizations?: Record<string, unknown>;
  special_requests?: string;
  added_at: string;
}

export interface CartItemModifier {
  modifier_id: string;
  name: string;
  price: number;
  selected: boolean;
}

// =============================================================================
// PAYMENT TYPES
// =============================================================================

export interface Payment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  provider: PaymentProvider;
  status: PaymentStatus;
  amount: number;
  currency: string;
  provider_transaction_id?: string | null;
  provider_reference?: string | null;
  momo_code?: string | null;
  revolut_link?: string | null;
  stripe_payment_intent_id?: string | null;
  failure_reason?: string | null;
  processing_fee?: number | null;
  net_amount?: number | null;
  metadata?: PaymentMetadata;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export type PaymentMethod = 
  | 'credit_card' 
  | 'debit_card' 
  | 'mobile_money' 
  | 'bank_transfer' 
  | 'revolut' 
  | 'paypal' 
  | 'cash';

export type PaymentProvider = 
  | 'stripe' 
  | 'revolut' 
  | 'momo' 
  | 'paypal' 
  | 'manual';

export interface PaymentMetadata {
  card_last_four?: string;
  card_brand?: string;
  billing_address?: Address;
  receipt_email?: string;
  processing_time_ms?: number;
  gateway_response?: Record<string, unknown>;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

// =============================================================================
// AI & SYSTEM TYPES
// =============================================================================

export interface AIWaiterLog {
  id: string;
  content: string;
  message_type: AIMessageType;
  guest_session_id: string;
  vendor_id: string;
  user_id?: string | null;
  conversation_id?: string | null;
  processing_metadata?: AIProcessingMetadata;
  ai_model_used?: string;
  confidence_score?: number;
  intent_detected?: string;
  entities_extracted?: AIEntity[];
  response_time_ms?: number;
  created_at: string;
}

export type AIMessageType = 
  | 'user_message' 
  | 'ai_response' 
  | 'system_notification' 
  | 'error_handler' 
  | 'ai_error_fix' 
  | 'task_review_request' 
  | 'ux_recommendation_request' 
  | 'system_hook'
  | 'menu_recommendation'
  | 'order_assistance'
  | 'customer_service';

export interface AIProcessingMetadata {
  model_used: string;
  tokens_used?: number;
  processing_time_ms: number;
  temperature?: number;
  max_tokens?: number;
  context_window_size?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface AIEntity {
  type: string;
  value: string;
  confidence: number;
  start_index?: number;
  end_index?: number;
}

export interface AIResponse {
  id: string;
  model_used: string;
  response: string;
  processing_time_ms: number;
  success: boolean;
  error?: string | null;
  metadata?: AIProcessingMetadata;
  suggestions?: AISuggestion[];
  created_at: string;
}

export interface AISuggestion {
  type: 'menu_item' | 'upsell' | 'cross_sell' | 'alternative';
  item_id?: string;
  title: string;
  description: string;
  confidence: number;
  price?: number;
}

// =============================================================================
// SYSTEM & AUDIT TYPES
// =============================================================================

export interface SystemLog {
  id: string;
  log_type: LogType;
  component: string;
  message: string;
  metadata?: Record<string, unknown>;
  severity: LogSeverity;
  user_id?: string | null;
  session_id?: string | null;
  request_id?: string | null;
  stack_trace?: string | null;
  created_at: string;
}

export type LogType = 
  | 'info' 
  | 'warning' 
  | 'error' 
  | 'debug' 
  | 'security' 
  | 'performance' 
  | 'audit' 
  | 'fullstack_audit';

export type LogSeverity = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export interface ErrorLog {
  id: string;
  error_type?: string | null;
  error_message?: string | null;
  stack_trace?: string | null;
  user_id?: string | null;
  session_id?: string | null;
  component?: string | null;
  url?: string | null;
  user_agent?: string | null;
  severity: LogSeverity;
  resolved: boolean;
  resolved_at?: string | null;
  resolution_notes?: string | null;
  created_at: string;
}

export interface AuditFinding {
  id: string;
  category: AuditCategory;
  location: string;
  type: AuditType;
  severity: AuditSeverity;
  status: AuditStatus;
  description: string;
  proposed_fix: string;
  impact: string;
  business_impact?: 'low' | 'medium' | 'high' | 'critical';
  technical_debt_score?: number;
  created_at: string;
  updated_at: string;
}

export type AuditCategory = 
  | 'frontend' 
  | 'backend' 
  | 'database' 
  | 'security' 
  | 'performance' 
  | 'ai_integration' 
  | 'error_handling' 
  | 'deployment';

export type AuditType = 
  | 'bug' 
  | 'missing' 
  | 'ux' 
  | 'integration' 
  | 'error' 
  | 'incomplete' 
  | 'security_vulnerability' 
  | 'performance_issue';

export type AuditSeverity = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical';

export type AuditStatus = 
  | 'ready' 
  | 'needs_fixing' 
  | 'broken' 
  | 'in_progress' 
  | 'resolved';

export interface AuditReport {
  id: string;
  timestamp: string;
  audit_type: 'manual' | 'automated' | 'scheduled';
  findings: AuditFinding[];
  summary: AuditSummary;
  categories: Record<AuditCategory, AuditFinding[]>;
  recommendations: string[];
  next_audit_date?: string;
  auditor?: string;
  version: string;
}

export interface AuditSummary {
  total_findings: number;
  critical_issues: number;
  high_issues: number;
  medium_issues: number;
  low_issues: number;
  ready_items: number;
  broken_items: number;
  production_readiness_score: number;
  previous_score?: number;
  improvement_percentage?: number;
}

// =============================================================================
// ANALYTICS TYPES
// =============================================================================

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id?: string | null;
  session_id?: string | null;
  vendor_id?: string | null;
  properties: Record<string, unknown>;
  timestamp: string;
  created_at: string;
}

export interface PerformanceMetric {
  id: string;
  metric_name: string;
  metric_value: number;
  dimensions: Record<string, unknown>;
  timestamp: string;
  session_id?: string;
  user_id?: string;
  created_at: string;
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

export interface TableColumnDef<T = unknown> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  showTotal?: boolean;
  showSizeChanger?: boolean;
}

export interface FormField<T = unknown> {
  name: keyof T;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: unknown) => string | undefined;
  };
}

// =============================================================================
// EVENT HANDLER TYPES
// =============================================================================

export type FormSubmitHandler<T = Record<string, unknown>> = (data: T) => Promise<void> | void;
export type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
export type SelectHandler<T = string> = (value: T) => void;
export type AsyncHandler<T = unknown> = (data: T) => Promise<void>;
export type ErrorHandler = (error: Error) => void;

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  menu_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  price: z.number().min(0),
  image_url: z.string().url().nullable().optional(),
  available: z.boolean(),
  popular: z.boolean(),
  dietary_tags: z.array(z.string()).optional(),
  allergens: z.array(z.string()).optional(),
});

export const OrderSchema = z.object({
  vendor_id: z.string().uuid().optional(),
  items: z.array(z.object({
    menu_item_id: z.string().uuid(),
    quantity: z.number().min(1),
    unit_price: z.number().min(0),
  })).min(1),
  customer_info: z.object({
    name: z.string().min(1).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  total_amount: z.number().min(0),
  currency: z.string().length(3),
  agreed_to_terms: z.boolean().refine(val => val === true),
});

export const PaymentSchema = z.object({
  order_id: z.string().uuid(),
  payment_method: z.enum(['credit_card', 'debit_card', 'mobile_money', 'bank_transfer', 'revolut', 'paypal', 'cash']),
  amount: z.number().min(0),
  currency: z.string().length(3),
});

// =============================================================================
// UTILITY TYPES
// =============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonNullable<T> = T extends null | undefined ? never : T;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Type guards
export function isMenuItem(item: unknown): item is MenuItem {
  return typeof item === 'object' && item !== null && 'id' in item && 'name' in item && 'price' in item;
}

export function isOrder(order: unknown): order is Order {
  return typeof order === 'object' && order !== null && 'id' in order && 'items' in order && 'total_amount' in order;
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error;
} 