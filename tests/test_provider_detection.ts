/**
 * Unit tests for lib/providerDetection.ts
 *
 * The detection logic probes `generativelanguage.googleapis.com` via a HEAD
 * request.  We replace global.fetch with a mock to control whether the probe
 * succeeds or fails, then verify that detectProvider() returns the expected
 * provider token.
 *
 * Note: sessionStorage is not available in Node.js, so the try/catch inside
 * detectProvider() silently skips caching — every call runs a fresh probe,
 * which is exactly what we want for testing.
 */

import { describe, it, beforeEach, after, mock } from 'node:test';
import assert from 'node:assert';

const { detectProvider } = await import('../lib/providerDetection');

describe('detectProvider', () => {
  const savedFetch = global.fetch;

  beforeEach(() => { global.fetch = savedFetch; });
  after(() => { global.fetch = savedFetch; });

  it('returns "gemini" when the Google API endpoint is reachable', async () => {
    global.fetch = mock.fn(async () => new Response(null, { status: 200 })) as any;

    const provider = await detectProvider();
    assert.strictEqual(provider, 'gemini');
  });

  it('returns "deepseek" when the probe throws a network error', async () => {
    global.fetch = mock.fn(async () => {
      throw new TypeError('Failed to fetch');
    }) as any;

    const provider = await detectProvider();
    assert.strictEqual(provider, 'deepseek');
  });

  it('returns "deepseek" when the probe is aborted (timeout)', async () => {
    global.fetch = mock.fn(async () => {
      throw Object.assign(new Error('The operation was aborted'), { name: 'AbortError' });
    }) as any;

    const provider = await detectProvider();
    assert.strictEqual(provider, 'deepseek');
  });

  it('probes the correct Google endpoint', async () => {
    let capturedUrl: string | undefined;
    global.fetch = mock.fn(async (url: any) => {
      capturedUrl = String(url);
      return new Response(null, { status: 200 });
    }) as any;

    await detectProvider();
    assert.ok(
      capturedUrl?.includes('generativelanguage.googleapis.com'),
      `Expected Google API URL, got: ${capturedUrl}`
    );
  });
});
