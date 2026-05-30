/** Frontend rate limiter with token bucket algorithm. */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

function refill(bucket: Bucket, config: RateLimitConfig): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(elapsed / config.windowMs) * config.maxRequests;
  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(bucket.tokens + tokensToAdd, config.maxRequests);
    bucket.lastRefill = now - (elapsed % config.windowMs);
  }
}

/**
 * Checks whether a request identified by `key` is within the rate limit.
 * Returns true if allowed, false if rate-limited.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  let bucket = buckets.get(key);
  if (!bucket) {
    bucket = { tokens: config.maxRequests, lastRefill: Date.now() };
    buckets.set(key, bucket);
  }
  refill(bucket, config);
  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }
  return false;
}

/**
 * React hook for rate-limited actions (e.g., form submits, API calls).
 * Usage:
 *   const { allow, remaining, reset } = useRateLimiter('search', { maxRequests: 5, windowMs: 60_000 });
 *   if (allow()) { doSearch(); }
 */
import { useState, useCallback, useRef } from "react";

export function useRateLimiter(
  key: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 60_000 }
) {
  const [remaining, setRemaining] = useState(config.maxRequests);
  const configRef = useRef(config);

  const allow = useCallback(() => {
    const allowed = checkRateLimit(key, configRef.current);
    if (!allowed) setRemaining(0);
    else setRemaining((r) => Math.max(0, r - 1));
    return allowed;
  }, [key]);

  const reset = useCallback(() => {
    buckets.delete(key);
    setRemaining(configRef.current.maxRequests);
  }, [key]);

  return { allow, remaining, reset };
}

/** Clean up stale buckets periodically. */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill > 600_000) {
        buckets.delete(key);
      }
    }
  }, 300_000);
}
