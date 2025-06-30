// ✨ Refactored by Cursor – Audit Phase 2: Security Headers Implementation

export const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co https://api.openai.com https://generativelanguage.googleapis.com https://maps.googleapis.com https://api.stripe.com",
    "frame-src 'self' https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'accelerometer=()',
    'gyroscope=()'
  ].join(', ')
};

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

export function createSecureResponse(
  data: unknown, 
  status = 200, 
  additionalHeaders: Record<string, string> = {}
): Response {
  const headers = {
    ...securityHeaders,
    ...additionalHeaders,
    'Content-Type': 'application/json',
    'X-Request-ID': crypto.randomUUID(),
    'X-Timestamp': new Date().toISOString()
  };

  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    { status, headers }
  );
}

export function createErrorResponse(
  message: string, 
  status = 500, 
  code?: string
): Response {
  const errorData = {
    error: {
      message,
      code: code || `ERROR_${status}`,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID()
    },
    success: false
  };

  return createSecureResponse(errorData, status);
}

export function handleCORS(request: Request): Response | null {
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400' // 24 hours
      }
    });
  }
  return null;
}

// Rate limiting types and utilities
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: Request) => string;
}

export class EdgeRateLimit {
  private static memory = new Map<string, { count: number; resetTime: number }>();

  static async check(
    request: Request, 
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number }> {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : this.getClientIdentifier(request);
    
    const now = Date.now();
    const windowStart = Math.floor(now / config.windowMs) * config.windowMs;
    const resetTime = windowStart + config.windowMs;
    
    const current = this.memory.get(key);
    
    if (!current || current.resetTime <= now) {
      // New window or expired window
      this.memory.set(key, { count: 1, resetTime });
      return {
        allowed: true,
        remainingRequests: config.maxRequests - 1,
        resetTime
      };
    }
    
    if (current.count >= config.maxRequests) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: current.resetTime
      };
    }
    
    // Increment counter
    current.count++;
    this.memory.set(key, current);
    
    return {
      allowed: true,
      remainingRequests: config.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }

  private static getClientIdentifier(request: Request): string {
    // Try to get IP from various headers
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const cfConnectingIp = request.headers.get('cf-connecting-ip');
    
    const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown';
    
    // Also consider user agent for additional uniqueness
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const authHeader = request.headers.get('authorization');
    
    // Create a hash of identifying information
    const identifier = `${ip}-${userAgent.slice(0, 50)}-${authHeader ? 'auth' : 'anon'}`;
    
    // Simple hash function for consistent key generation
    let hash = 0;
    for (let i = 0; i < identifier.length; i++) {
      const char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `rl_${Math.abs(hash)}`;
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.memory.entries()) {
      if (value.resetTime <= now) {
        this.memory.delete(key);
      }
    }
  }
}

// Security validation utilities
export function validateRequestSize(request: Request, maxSizeBytes = 1024 * 1024): boolean {
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const size = parseInt(contentLength, 10);
    return size <= maxSizeBytes;
  }
  return true; // Allow if no content-length header
}

export function validateContentType(request: Request, allowedTypes: string[] = ['application/json']): boolean {
  const contentType = request.headers.get('content-type');
  if (!contentType) return true; // Allow if no content-type
  
  return allowedTypes.some(type => contentType.includes(type));
}

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Basic XSS prevention
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove all HTML tags
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Cleanup rate limit memory periodically (call this in edge functions)
setInterval(() => {
  EdgeRateLimit.cleanup();
}, 5 * 60 * 1000); // Every 5 minutes 