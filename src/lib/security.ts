// Security utilities for Malta QR Order platform
import { z } from 'zod';

// =============================================================================
// INPUT VALIDATION SCHEMAS
// =============================================================================

export const UserInputSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format').optional(),
});

export const OrderItemSchema = z.object({
  menu_item_id: z.string().uuid('Invalid menu item ID'),
  quantity: z.number().int().positive('Quantity must be positive').max(100, 'Quantity too high'),
  special_requests: z.string().max(500, 'Special requests too long').optional(),
});

export const OrderSchema = z.object({
  vendor_id: z.string().uuid('Invalid vendor ID'),
  items: z.array(OrderItemSchema).min(1, 'At least one item required'),
  customer_info: UserInputSchema,
  delivery_info: z.object({
    type: z.enum(['pickup', 'delivery', 'dine_in']),
    address: z.string().max(200).optional(),
    table_number: z.string().max(20).optional(),
  }).optional(),
});

export const PaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  payment_method: z.enum(['revolut', 'momo', 'stripe', 'cash']),
  order_id: z.string().uuid('Invalid order ID'),
});

// =============================================================================
// INPUT SANITIZATION
// =============================================================================

export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim().substring(0, 254);
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\s\-\(\)\+]/g, '').substring(0, 20);
}

// =============================================================================
// SECURITY CHECKS
// =============================================================================

export function validateApiKey(apiKey: string | undefined): boolean {
  if (!apiKey) return false;
  
  // Check if it's a valid Supabase anon key format
  const anonKeyPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return anonKeyPattern.test(apiKey);
}

export function validateServiceRoleKey(key: string | undefined): boolean {
  if (!key) return false;
  
  // Service role keys should never be exposed to frontend
  if (typeof window !== 'undefined') {
    console.error('CRITICAL: Service role key detected in frontend code');
    return false;
  }
  
  const serviceKeyPattern = /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
  return serviceKeyPattern.test(key);
}

export function validateOrigin(origin: string): boolean {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://localhost:8081',
    'http://localhost:8082',
    'https://nireplgrlwhwppjtfxbb.supabase.co',
  ];
  
  return allowedOrigins.includes(origin);
}

// =============================================================================
// RATE LIMITING UTILITIES
// =============================================================================

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [now]);
      return true;
    }

    const userRequests = this.requests.get(identifier)!;
    const recentRequests = userRequests.filter(time => time > windowStart);
    
    if (recentRequests.length >= this.config.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);
    return true;
  }

  cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => time > windowStart);
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'SecurityError';
  }
}

export function handleSecurityError(error: unknown): never {
  if (error instanceof SecurityError) {
    throw error;
  }
  
  if (error instanceof z.ZodError) {
    throw new SecurityError(
      'Invalid input data',
      'VALIDATION_ERROR',
      400
    );
  }
  
  // Don't expose internal errors to client
  console.error('Security error:', error);
  throw new SecurityError(
    'An error occurred',
    'INTERNAL_ERROR',
    500
  );
}

// =============================================================================
// ENVIRONMENT VALIDATION
// =============================================================================

export function validateEnvironment(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    throw new SecurityError(
      `Missing required environment variables: ${missing.join(', ')}`,
      'ENV_ERROR',
      500
    );
  }

  // Validate Supabase configuration
  if (!validateApiKey(import.meta.env.VITE_SUPABASE_ANON_KEY)) {
    throw new SecurityError(
      'Invalid Supabase configuration',
      'CONFIG_ERROR',
      500
    );
  }
}

// =============================================================================
// EXPORT TYPES
// =============================================================================

export type ValidatedUserInput = z.infer<typeof UserInputSchema>;
export type ValidatedOrder = z.infer<typeof OrderSchema>;
export type ValidatedPayment = z.infer<typeof PaymentSchema>; 