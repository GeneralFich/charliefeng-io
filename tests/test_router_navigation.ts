import { describe, it } from 'node:test';
import assert from 'node:assert';
import { buildNavigationUrl } from '../lib/route_logic';
import { View } from '../types';

/**
 * @fileoverview Tests for buildNavigationUrl — the URL construction logic
 * extracted from hooks/useRouter.ts.
 *
 * The existing test_route_logic.ts covers parseRoute (URL → state).
 * This file covers buildNavigationUrl (state → URL), completing the
 * round-trip coverage of the routing layer.
 */

describe('buildNavigationUrl', () => {
  it('builds basic URL with view parameter', () => {
    const url = buildNavigationUrl('/', View.HOME);
    assert.strictEqual(url, '/?view=HOME');
  });

  it('includes essay slug when provided', () => {
    const url = buildNavigationUrl('/', View.ESSAYS, 'my-essay');
    assert.strictEqual(url, '/?view=ESSAYS&essay=my-essay');
  });

  it('adds hash with # prefix', () => {
    const url = buildNavigationUrl('/', View.ABOUT, undefined, 'experience');
    assert.strictEqual(url, '/?view=ABOUT#experience');
  });

  it('does not duplicate # when hash already has it', () => {
    const url = buildNavigationUrl('/', View.ABOUT, undefined, '#experience');
    assert.strictEqual(url, '/?view=ABOUT#experience');
  });

  it('handles slug + hash together', () => {
    const url = buildNavigationUrl('/', View.ESSAYS, 'whitepaper', 'section-3');
    assert.strictEqual(url, '/?view=ESSAYS&essay=whitepaper#section-3');
  });

  it('works with non-root pathnames', () => {
    const url = buildNavigationUrl('/app', View.ESSAYS, 'test');
    assert.strictEqual(url, '/app?view=ESSAYS&essay=test');
  });

  it('omits essay param when slug is undefined', () => {
    const url = buildNavigationUrl('/', View.ESSAYS);
    assert.strictEqual(url, '/?view=ESSAYS');
  });

  it('omits hash when hash is undefined', () => {
    const url = buildNavigationUrl('/', View.HOME);
    assert.ok(!url.includes('#'));
  });

  it('round-trips with parseRoute for basic views', async () => {
    const { parseRoute } = await import('../lib/route_logic');

    for (const view of [View.HOME, View.ABOUT, View.ESSAYS, View.DASHBOARD]) {
      const url = buildNavigationUrl('/', view);
      const params = new URLSearchParams(url.split('?')[1]);
      const parsed = parseRoute(params);
      assert.strictEqual(parsed.view, view, `Round-trip failed for view=${view}`);
    }
  });

  it('round-trips with parseRoute for ESSAYS with slug', async () => {
    const { parseRoute } = await import('../lib/route_logic');
    const slug = 'strategic-whitepaper';
    const url = buildNavigationUrl('/', View.ESSAYS, slug);
    const params = new URLSearchParams(url.split('?')[1]);
    const parsed = parseRoute(params);
    assert.strictEqual(parsed.view, View.ESSAYS);
    assert.strictEqual(parsed.slug, slug);
  });
});
