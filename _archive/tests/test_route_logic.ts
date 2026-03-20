import { test } from 'node:test';
import * as assert from 'node:assert';
import { parseRoute } from '../lib/route_logic';
import { View } from '../types';

test('parseRoute', async (t) => {
  await t.test('returns HOME for root path', () => {
    const result = parseRoute('/');
    assert.strictEqual(result.view, View.HOME);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns HOME for empty string', () => {
    const result = parseRoute('');
    assert.strictEqual(result.view, View.HOME);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns HOME for unknown paths', () => {
    const result = parseRoute('/unknown-page');
    assert.strictEqual(result.view, View.HOME);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns ABOUT for /about', () => {
    const result = parseRoute('/about');
    assert.strictEqual(result.view, View.ABOUT);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns ESSAYS for /essays', () => {
    const result = parseRoute('/essays');
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns ESSAYS with slug for /essays/my-slug', () => {
    const result = parseRoute('/essays/my-slug');
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, 'my-slug');
  });

  await t.test('returns DASHBOARD for /dashboard', () => {
    const result = parseRoute('/dashboard');
    assert.strictEqual(result.view, View.DASHBOARD);
    assert.strictEqual(result.slug, null);
  });

  await t.test('strips trailing slashes', () => {
    const result = parseRoute('/about/');
    assert.strictEqual(result.view, View.ABOUT);
    assert.strictEqual(result.slug, null);
  });

  await t.test('strips trailing slashes from essay paths', () => {
    const result = parseRoute('/essays/my-slug/');
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, 'my-slug');
  });

  await t.test('returns ESSAYS list for /essays/ with trailing slash', () => {
    const result = parseRoute('/essays/');
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, null);
  });

  await t.test('strips /zh prefix for essays', () => {
    const result = parseRoute('/zh/essays/my-slug');
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, 'my-slug');
  });

  await t.test('strips /zh prefix for about', () => {
    const result = parseRoute('/zh/about');
    assert.strictEqual(result.view, View.ABOUT);
    assert.strictEqual(result.slug, null);
  });

  await t.test('strips /zh prefix for essays list', () => {
    const result = parseRoute('/zh/essays');
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, null);
  });
});
