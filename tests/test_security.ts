import { test } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit } from '../lib/security';

test('checkRateLimit allows requests within limit', () => {
  const windowMs = 60000;
  const maxRequests = 5;
  const now = 1000000;
  const timestamps: number[] = [];

  const result = checkRateLimit(timestamps, windowMs, maxRequests, now);

  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.newTimestamps.length, 1);
  assert.strictEqual(result.newTimestamps[0], now);
});

test('checkRateLimit blocks requests over limit', () => {
  const windowMs = 60000;
  const maxRequests = 2;
  const now = 1000000;
  // Simulate 2 requests in the last second
  const timestamps = [now - 100, now - 50];

  const result = checkRateLimit(timestamps, windowMs, maxRequests, now);

  assert.strictEqual(result.allowed, false);
  // Timestamps should not increase when blocked
  assert.strictEqual(result.newTimestamps.length, 2);
  assert.deepStrictEqual(result.newTimestamps, timestamps);
});

test('checkRateLimit clears old timestamps', () => {
  const windowMs = 1000; // 1 second window
  const maxRequests = 2;
  const now = 2000;
  // Request from 2 seconds ago (expired) and 1 from now (valid)
  const timestamps = [now - 2000, now - 500];

  const result = checkRateLimit(timestamps, windowMs, maxRequests, now);

  // The old one (now - 2000 = 0) is < (now - window = 1000). 0 < 1000 is true, wait.
  // Condition: now - t < windowMs
  // 2000 - 0 = 2000. 2000 < 1000 is False. Expired.
  // 2000 - 1500 = 500. 500 < 1000 is True. Valid.

  assert.strictEqual(result.allowed, true);
  // Should contain the valid one (1500) and the new one (2000)
  assert.strictEqual(result.newTimestamps.length, 2);
  assert.deepStrictEqual(result.newTimestamps, [1500, 2000]);
});

test('checkRateLimit boundary condition (exact window edge)', () => {
  const windowMs = 1000;
  const maxRequests = 5;
  const now = 2000;

  // Exact boundary: t = now - windowMs = 1000.
  // 2000 - 1000 < 1000 => 1000 < 1000 => False.
  // So a request made EXACTLY windowMs ago should be expired.
  const timestamps = [now - windowMs];

  const result = checkRateLimit(timestamps, windowMs, maxRequests, now);

  assert.strictEqual(result.allowed, true);
  // Old one expired, so only new one remains
  assert.deepStrictEqual(result.newTimestamps, [now]);
});

test('checkRateLimit boundary condition (inside window)', () => {
  const windowMs = 1000;
  const maxRequests = 5;
  const now = 2000;

  // Inside boundary: t = now - windowMs + 1 = 1001.
  // 2000 - 1001 = 999. 999 < 1000 => True.
  const timestamps = [now - windowMs + 1];

  const result = checkRateLimit(timestamps, windowMs, maxRequests, now);

  assert.strictEqual(result.allowed, true);
  // Old one valid, plus new one
  assert.deepStrictEqual(result.newTimestamps, [now - windowMs + 1, now]);
});

test('checkRateLimit with default now (sanity check)', () => {
  // Ensure it still works without passing `now` (using Date.now())
  const windowMs = 60000;
  const maxRequests = 5;
  const timestamps: number[] = [];

  const result = checkRateLimit(timestamps, windowMs, maxRequests);

  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.newTimestamps.length, 1);
  // Can't assert exact value but can assert it's recent
  assert.ok(Date.now() - result.newTimestamps[0] < 100);
});
