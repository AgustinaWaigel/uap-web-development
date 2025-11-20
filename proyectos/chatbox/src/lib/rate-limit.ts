// Simple in-memory rate limiter
// For production, consider using Redis or a proper rate limiting service

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 10 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests?: number // Max requests per window
  windowMs?: number    // Time window in milliseconds
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

/**
 * Check if a request should be rate limited
 * @param identifier Unique identifier (IP address, user ID, etc.)
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const maxRequests = config.maxRequests || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
  const windowMs = config.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') // 15 min default

  const now = Date.now()
  const record = store[identifier]

  // No record or window expired - create new record
  if (!record || record.resetTime < now) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs
    }
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: store[identifier].resetTime
    }
  }

  // Within window - check if limit exceeded
  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: record.resetTime
    }
  }

  // Increment counter
  record.count++
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (when behind proxy)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback to a generic identifier for development
  return 'default-client'
}
