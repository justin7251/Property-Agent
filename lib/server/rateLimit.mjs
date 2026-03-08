const buckets = new Map();

export function checkRateLimit(input) {
  const now = typeof input.now === 'number' ? input.now : Date.now();
  const existing = buckets.get(input.key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return { allowed: true, remaining: Math.max(input.limit - 1, 0), retryAfterMs: 0 };
  }

  if (existing.count >= input.limit) {
    return { allowed: false, remaining: 0, retryAfterMs: Math.max(existing.resetAt - now, 0) };
  }

  existing.count += 1;
  buckets.set(input.key, existing);
  return { allowed: true, remaining: Math.max(input.limit - existing.count, 0), retryAfterMs: 0 };
}

export function resetRateLimitStore() {
  buckets.clear();
}
