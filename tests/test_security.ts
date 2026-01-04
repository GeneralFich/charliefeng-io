import { test } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit } from '../lib/security';

test('checkRateLimit allows requests within limit', () => {
  const windowMs = 60000;
  const maxRequests = 5;
  const timestamps: number[] = [];

  const result = checkRateLimit(timestamps, windowMs, maxRequests);

  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.newTimestamps.length, 1);
});

test('checkRateLimit blocks requests over limit', () => {
  const windowMs = 60000;
  const maxRequests = 2;
  const now = Date.now();
  // Simulate 2 requests in the last second
  const timestamps = [now - 100, now - 50];

  const result = checkRateLimit(timestamps, windowMs, maxRequests);

  assert.strictEqual(result.allowed, false);
  // Timestamps should not increase when blocked
  assert.strictEqual(result.newTimestamps.length, 2);
});

test('checkRateLimit clears old timestamps', () => {
  const windowMs = 1000; // 1 second window
  const maxRequests = 2;
  const now = Date.now();
  // Request from 2 seconds ago (expired) and 1 from now (valid)
  const timestamps = [now - 2000, now];

  // We are checking at 'now' + epsilon effectively, but the function uses Date.now() internally.
  // Wait, the function uses Date.now(). In a test, we can't easily mock Date.now() without a library or DI.
  // However, we can infer behavior.
  // If we pass timestamps, the function filters them against its *own* Date.now().
  // So if we pass timestamps from the "past", they will be filtered.

  // Let's rely on the fact that [Date.now() - 2000] is definitely older than 1000ms ago.

  const result = checkRateLimit(timestamps, windowMs, maxRequests);

  // The old one should be gone. The one at 'now' (simulated) is technically "just happened" or "future" if test runs fast?
  // Actually, if we pass `now` (generated outside), and `checkRateLimit` calls `Date.now()` (inside),
  // the inside time will be >= outside time.
  // So `now_inside - (now_outside - 2000)` = `2000 + delta` > 1000. So it expires.
  // `now_inside - now_outside` = `delta` (very small) < 1000. So it stays.
  // So we have 1 valid timestamp.
  // Max is 2. So we are allowed.
  // New timestamps should contain the valid one + the new one.

  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.newTimestamps.length, 2);
});
