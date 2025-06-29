import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyPrefix: string // Redis key prefix
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  '/bars': { windowMs: 60000, maxRequests: 10, keyPrefix: 'rl:bars:' },
  '/menus': { windowMs: 60000, maxRequests: 20, keyPrefix: 'rl:menus:' },
  '/orders': { windowMs: 60000, maxRequests: 30, keyPrefix: 'rl:orders:' },
  '/payments': { windowMs: 60000, maxRequests: 10, keyPrefix: 'rl:payments:' },
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiter (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

function isRateLimited(key: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    requestCounts.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return false
  }

  if (record.count >= config.maxRequests) {
    return true
  }

  record.count++
  return false
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname
    const method = req.method

    // Only rate limit POST requests to sensitive endpoints
    if (method !== 'POST') {
      return new Response(
        JSON.stringify({ message: 'Method not rate limited' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Find matching rate limit config
    let config: RateLimitConfig | undefined
    let endpoint: string | undefined

    for (const [pattern, limitConfig] of Object.entries(RATE_LIMITS)) {
      if (path.includes(pattern)) {
        config = limitConfig
        endpoint = pattern
        break
      }
    }

    if (!config || !endpoint) {
      return new Response(
        JSON.stringify({ message: 'Endpoint not rate limited' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Get client identifier (IP or user ID)
    const authHeader = req.headers.get('Authorization')
    let clientId = req.headers.get('x-forwarded-for') || 'anonymous'

    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? ''
      )

      const token = authHeader.replace('Bearer ', '')
      const { data: { user } } = await supabase.auth.getUser(token)
      
      if (user) {
        clientId = user.id
      }
    }

    const rateLimitKey = `${config.keyPrefix}${clientId}`

    // Check rate limit
    if (isRateLimited(rateLimitKey, config)) {
      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Max ${config.maxRequests} requests per ${config.windowMs / 1000} seconds.`,
          retryAfter: Math.ceil(config.windowMs / 1000),
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
          },
          status: 429,
        }
      )
    }

    // Log rate limit usage
    console.log(`Rate limit check passed for ${clientId} on ${endpoint}`)

    return new Response(
      JSON.stringify({ 
        message: 'Request allowed',
        endpoint,
        clientId,
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.maxRequests.toString(),
        }, 
        status: 200 
      }
    )
  } catch (error) {
    console.error('Rate limiter error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}) 