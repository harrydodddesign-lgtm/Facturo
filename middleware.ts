import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkRateLimit } from '@/lib/rate-limit'

const AUTH_ROUTES = new Set(['/login', '/signup', '/forgot-password'])
// 5 attempts per 15 minutes per IP per route
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

export async function middleware(request: NextRequest) {
    if (request.method === 'POST' && AUTH_ROUTES.has(request.nextUrl.pathname)) {
        const ip =
            request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
            request.headers.get('x-real-ip') ||
            'unknown'

        const key = `auth:${ip}:${request.nextUrl.pathname}`
        const { allowed, resetAt } = checkRateLimit(key, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)

        if (!allowed) {
            return new NextResponse('Too many requests. Please try again later.', {
                status: 429,
                headers: {
                    'Content-Type': 'text/plain',
                    'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
                    'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
                    'X-RateLimit-Remaining': '0',
                },
            })
        }
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
