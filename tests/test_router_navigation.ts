import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildNavigationUrl } from '../lib/route_logic';
import { View } from '../types';

/**
 * @fileoverview Tests for buildNavigationUrl — the URL construction logic
 * extracted from hooks/useRouter.ts.
 *
 * The existing test_route_logic.ts covers parseRoute (pathname → state).
 * This file covers buildNavigationUrl (state → URL path), completing the
 * round-trip coverage of the routing layer.
 */

describe('buildNavigationUrl', () => {
  it('builds root path for HOME view', () => {
    const url = buildNavigationUrl(View.HOME);
    assert.strictEqual(url, '/');
  });

  it('builds /about for ABOUT view', () => {
    const url = buildNavigationUrl(View.ABOUT);
    assert.strictEqual(url, '/about');
  });

  it('builds /essays for ESSAYS view without slug', () => {
    const url = buildNavigationUrl(View.ESSAYS);
    assert.strictEqual(url, '/essays');
  });

  it('builds /essays/slug for ESSAYS view with slug', () => {
    const url = buildNavigationUrl(View.ESSAYS, 'my-essay');
    assert.strictEqual(url, '/essays/my-essay');
  });

  it('builds /dashboard for DASHBOARD view', () => {
    const url = buildNavigationUrl(View.DASHBOARD);
    assert.strictEqual(url, '/dashboard');
  });

  it('adds hash with # prefix', () => {
    const url = buildNavigationUrl(View.ABOUT, undefined, 'experience');
    assert.strictEqual(url, '/about#experience');
  });

  it('does not duplicate # when hash already has it', () => {
    const url = buildNavigationUrl(View.ABOUT, undefined, '#experience');
    assert.strictEqual(url, '/about#experience');
  });

  it('handles slug + hash together', () => {
    const url = buildNavigationUrl(View.ESSAYS, 'whitepaper', 'section-3');
    assert.strictEqual(url, '/essays/whitepaper#section-3');
  });

  it('omits essay slug when slug is undefined', () => {
    const url = buildNavigationUrl(View.ESSAYS);
    assert.ok(!url.includes('/essays/'));
    assert.strictEqual(url, '/essays');
  });

  it('omits hash when hash is undefined', () => {
    const url = buildNavigationUrl(View.HOME);
    assert.ok(!url.includes('#'));
  });

  it('round-trips with parseRoute for basic views', async () => {
    const { parseRoute } = await import('../lib/route_logic');

    for (const view of [View.HOME, View.ABOUT, View.ESSAYS, View.DASHBOARD]) {
      const url = buildNavigationUrl(view);
      const parsed = parseRoute(url);
      assert.strictEqual(parsed.view, view, `Round-trip failed for view=${view}`);
    }
  });

  it('round-trips with parseRoute for ESSAYS with slug', async () => {
    const { parseRoute } = await import('../lib/route_logic');
    const slug = 'strategic-whitepaper';
    const url = buildNavigationUrl(View.ESSAYS, slug);
    const parsed = parseRoute(url);
    assert.strictEqual(parsed.view, View.ESSAYS);
    assert.strictEqual(parsed.slug, slug);
  });
});
