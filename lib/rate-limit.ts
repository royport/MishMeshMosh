import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Simple in-memory rate limiter
// In production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

export async function rateLimit(
  identifier: string,
  limit = RATE_LIMIT_MAX_REQUESTS,
  window = RATE_LIMIT_WINDOW
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + window,
    });
    return { success: true, remaining: limit - 1, reset: now + window };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count++;
  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}

export function rateLimitResponse(reset: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
        'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
      },
    }
  );
}

// Rate limit middleware for API routes
export async function withRateLimit(
  request: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Get identifier (IP or user ID)
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const forwardedFor = request.headers.get('x-forwarded-for');
  const ip = forwardedFor?.split(',')[0] || 'unknown';
  const identifier = user?.id || ip;

  const { success, remaining, reset } = await rateLimit(identifier);

  if (!success) {
    return rateLimitResponse(reset);
  }

  const response = await handler();
  
  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', String(RATE_LIMIT_MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(remaining));
  response.headers.set('X-RateLimit-Reset', String(reset));

  return response;
}
