
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  endpoint: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

export class RateLimiter {
  async checkRateLimit(
    userId: string | null,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);
    
    // Use IP or anonymous identifier as fallback if no user ID
    const identifier = userId || 'anonymous';

    try {
      // Get current rate limit record
      const { data: existingLimit } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', identifier)
        .eq('endpoint', config.endpoint)
        .gte('window_start', windowStart.toISOString())
        .maybeSingle();

      if (existingLimit) {
        // Check if blocked
        if (existingLimit.blocked_until && new Date(existingLimit.blocked_until) > now) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: new Date(existingLimit.blocked_until),
            retryAfter: Math.ceil((new Date(existingLimit.blocked_until).getTime() - now.getTime()) / 1000)
          };
        }

        // Check if limit exceeded
        if (existingLimit.requests_count >= config.max) {
          const blockUntil = new Date(now.getTime() + config.windowMs);
          
          // Update to block user
          await supabase
            .from('rate_limits')
            .update({
              blocked_until: blockUntil.toISOString(),
              updated_at: now.toISOString()
            })
            .eq('id', existingLimit.id);

          return {
            allowed: false,
            remaining: 0,
            resetTime: blockUntil,
            retryAfter: Math.ceil(config.windowMs / 1000)
          };
        }

        // Increment counter
        await supabase
          .from('rate_limits')
          .update({
            requests_count: existingLimit.requests_count + 1,
            updated_at: now.toISOString()
          })
          .eq('id', existingLimit.id);

        return {
          allowed: true,
          remaining: config.max - (existingLimit.requests_count + 1),
          resetTime: new Date(new Date(existingLimit.window_start).getTime() + config.windowMs)
        };
      } else {
        // Create new rate limit record
        await supabase
          .from('rate_limits')
          .insert({
            user_id: identifier,
            endpoint: config.endpoint,
            requests_count: 1,
            window_start: now.toISOString()
          });

        return {
          allowed: true,
          remaining: config.max - 1,
          resetTime: new Date(now.getTime() + config.windowMs)
        };
      }
    } catch (error) {
      console.error('Rate limiting error:', error);
      // On error, allow the request but log it
      await this.logError('rate_limiter_error', error);
      return {
        allowed: true,
        remaining: config.max,
        resetTime: new Date(now.getTime() + config.windowMs)
      };
    }
  }

  private async logError(type: string, error: any) {
    try {
      await supabase
        .from('error_logs')
        .insert({
          error_type: type,
          error_message: error.message || String(error),
          stack_trace: error.stack,
          severity: 'medium',
          context: { timestamp: new Date().toISOString() }
        });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }
}

// Rate limiting configurations
export const RATE_LIMIT_CONFIGS = {
  API_DEFAULT: { windowMs: 60000, max: 100, endpoint: 'api_default' }, // 100 req/min
  AI_CHAT: { windowMs: 60000, max: 20, endpoint: 'ai_chat' }, // 20 req/min
  ORDER_CREATE: { windowMs: 300000, max: 10, endpoint: 'order_create' }, // 10 req/5min
  AUTH_LOGIN: { windowMs: 900000, max: 5, endpoint: 'auth_login' }, // 5 req/15min
  ADMIN_ACTIONS: { windowMs: 60000, max: 50, endpoint: 'admin_actions' }, // 50 req/min
} as const;

// Helper function for checking rate limits in components
export async function checkRateLimit(
  userId: string | null,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const rateLimiter = new RateLimiter();
  return rateLimiter.checkRateLimit(userId, config);
}

// Edge function rate limiter for Supabase
export async function checkEdgeRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const rateLimiter = new RateLimiter();
  
  // Extract user ID from request headers or JWT
  const authHeader = request.headers.get('Authorization');
  let userId = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    try {
      // For now, we'll use anonymous - JWT decoding would require additional setup
      userId = 'authenticated_user';
    } catch (error) {
      console.error('JWT decode error:', error);
    }
  }
  
  const result = await rateLimiter.checkRateLimit(userId, config);
  
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded',
        retryAfter: result.retryAfter
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.max.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
          ...(result.retryAfter && { 'Retry-After': result.retryAfter.toString() })
        }
      }
    );
  }
  
  return null; // Allow request to proceed
}
