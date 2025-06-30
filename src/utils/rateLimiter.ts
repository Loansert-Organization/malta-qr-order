
import { createClient } from '@supabase/supabase-js';

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
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  async checkRateLimit(
    userId: string | null,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - config.windowMs);
    
    // Use IP as fallback if no user ID
    const identifier = userId || 'anonymous';

    try {
      // Get current rate limit record
      const { data: existingLimit } = await this.supabase
        .from('rate_limits')
        .select('*')
        .eq('user_id', identifier)
        .eq('endpoint', config.endpoint)
        .gte('window_start', windowStart.toISOString())
        .single();

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
          await this.supabase
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
        await this.supabase
          .from('rate_limits')
          .update({
            requests_count: existingLimit.requests_count + 1,
            updated_at: now.toISOString()
          })
          .eq('id', existingLimit.id);

        return {
          allowed: true,
          remaining: config.max - (existingLimit.requests_count + 1),
          resetTime: new Date(existingLimit.window_start.getTime() + config.windowMs)
        };
      } else {
        // Create new rate limit record
        await this.supabase
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
      await this.supabase
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

// Middleware wrapper for Next.js API routes
export function withRateLimit(config: RateLimitConfig) {
  return function rateLimitMiddleware(handler: any) {
    return async function(req: any, res: any) {
      const rateLimiter = new RateLimiter();
      
      // Extract user ID from request (adjust based on your auth setup)
      const userId = req.user?.id || req.headers['x-user-id'] || null;
      
      const result = await rateLimiter.checkRateLimit(userId, config);
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', config.max);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime.getTime() / 1000));
      
      if (!result.allowed) {
        if (result.retryAfter) {
          res.setHeader('Retry-After', result.retryAfter);
        }
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded',
          retryAfter: result.retryAfter
        });
      }
      
      return handler(req, res);
    };
  };
}

// Edge function rate limiter for Supabase
export async function checkEdgeRateLimit(
  request: Request,
  config: RateLimitConfig
): Promise<Response | null> {
  const rateLimiter = new RateLimiter();
  
  // Extract user ID from request headers or JWT
  const authHeader = request.headers.get('Authorization');
  const userId = null;
  
  if (authHeader?.startsWith('Bearer ')) {
    try {
      // Decode JWT to get user ID (implement based on your auth setup)
      const token = authHeader.slice(7);
      // userId = decodeJWT(token).sub; // Implement JWT decoding
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
