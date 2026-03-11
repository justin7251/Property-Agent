import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, resetRateLimitStore } from '../lib/server/rateLimit.mjs';

test('checkRateLimit allows requests up to limit', () => {
  resetRateLimitStore();
  const key = 'k-1';
  const first = checkRateLimit({ key, limit: 2, windowMs: 1000, now: 100 });
  const second = checkRateLimit({ key, limit: 2, windowMs: 1000, now: 200 });
  const third = checkRateLimit({ key, limit: 2, windowMs: 1000, now: 300 });
  assert.equal(first.allowed, true);
  assert.equal(second.allowed, true);
  assert.equal(third.allowed, false);
  assert.ok(third.retryAfterMs > 0);
});

test('checkRateLimit resets after window', () => {
  resetRateLimitStore();
  const key = 'k-2';
  checkRateLimit({ key, limit: 1, windowMs: 1000, now: 100 });
  const blocked = checkRateLimit({ key, limit: 1, windowMs: 1000, now: 200 });
  const allowedAfter = checkRateLimit({ key, limit: 1, windowMs: 1000, now: 1200 });
  assert.equal(blocked.allowed, false);
  assert.equal(allowedAfter.allowed, true);
});
