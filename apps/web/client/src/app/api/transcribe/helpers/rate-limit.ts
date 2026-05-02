/**
 * Simple in-memory sliding-window rate limiter for the transcription endpoint.
 *
 * Prevents abuse from a single user spamming the mic button. Per-user (not per-IP)
 * because we only allow authenticated requests. Lives in process memory — adequate
 * for basic anti-spam protection; not a replacement for distributed rate limiting.
 */

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 transcriptions / minute / user

const requestLog = new Map<string, number[]>();

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
}

export function checkTranscribeRateLimit(userId: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW_MS;

    const previous = requestLog.get(userId) ?? [];
    const recent = previous.filter((t) => t > windowStart);

    if (recent.length >= RATE_LIMIT_MAX) {
        const oldest = recent[0] ?? now;
        const retryAfterMs = Math.max(0, oldest + RATE_LIMIT_WINDOW_MS - now);
        // Keep the pruned log so we don't grow unbounded
        requestLog.set(userId, recent);
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
        };
    }

    recent.push(now);
    requestLog.set(userId, recent);

    // Opportunistic cleanup so the map doesn't accumulate stale users forever.
    // Cheap because Map iteration order is insertion order and we only sweep
    // when the map is large.
    if (requestLog.size > 1000) {
        for (const [uid, timestamps] of requestLog) {
            if (timestamps.every((t) => t <= windowStart)) {
                requestLog.delete(uid);
            }
        }
    }

    return {
        allowed: true,
        remaining: RATE_LIMIT_MAX - recent.length,
        retryAfterSeconds: 0,
    };
}
