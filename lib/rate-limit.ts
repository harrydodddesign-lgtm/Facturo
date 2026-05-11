// Simple in-memory fixed-window rate limiter.
// State is per-process and is NOT shared across multiple server instances or
// Edge replicas. For multi-instance/serverless production deployments, replace
// with a Redis-backed solution such as @upstash/ratelimit.

const store = new Map<string, { count: number; resetAt: number }>()

const PRUNE_INTERVAL_MS = 5 * 60 * 1000
let lastPruneAt = Date.now()

function pruneExpired() {
    const now = Date.now()
    if (now - lastPruneAt < PRUNE_INTERVAL_MS) return
    lastPruneAt = now
    for (const [key, entry] of store) {
        if (now > entry.resetAt) store.delete(key)
    }
}

export function checkRateLimit(
    key: string,
    maxRequests: number,
    windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
    pruneExpired()
    const now = Date.now()
    const entry = store.get(key)

    if (!entry || now > entry.resetAt) {
        const resetAt = now + windowMs
        store.set(key, { count: 1, resetAt })
        return { allowed: true, remaining: maxRequests - 1, resetAt }
    }

    if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, resetAt: entry.resetAt }
    }

    entry.count++
    return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}
