import { test } from 'node:test';
import * as assert from 'node:assert';
import { parseRoute } from '../lib/route_logic';
import { View } from '../types';

test('parseRoute', async (t) => {
  await t.test('returns HOME when no params present', () => {
    const params = new URLSearchParams('');
    const result = parseRoute(params);
    assert.strictEqual(result.view, View.HOME);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns HOME when view param is invalid', () => {
    const params = new URLSearchParams('view=INVALID_VIEW');
    const result = parseRoute(params);
    assert.strictEqual(result.view, View.HOME);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns correct view for valid view param', () => {
    const params = new URLSearchParams(`view=${View.ABOUT}`);
    const result = parseRoute(params);
    assert.strictEqual(result.view, View.ABOUT);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns correct view and slug for ESSAYS view with slug', () => {
    const slug = 'test-essay-slug';
    const params = new URLSearchParams(`view=${View.ESSAYS}&essay=${slug}`);
    const result = parseRoute(params);
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, slug);
  });

  await t.test('ignores slug if view is not ESSAYS', () => {
    const slug = 'should-be-ignored';
    const params = new URLSearchParams(`view=${View.ABOUT}&essay=${slug}`);
    const result = parseRoute(params);
    assert.strictEqual(result.view, View.ABOUT);
    assert.strictEqual(result.slug, null);
  });

  await t.test('returns ESSAYS view with null slug if slug is missing', () => {
    const params = new URLSearchParams(`view=${View.ESSAYS}`);
    const result = parseRoute(params);
    assert.strictEqual(result.view, View.ESSAYS);
    assert.strictEqual(result.slug, null);
  });

  await t.test('is case sensitive for view param values', () => {
    // Assuming enum values are uppercase 'HOME', 'ABOUT', etc.
    const params = new URLSearchParams('view=essays'); // lowercase
    const result = parseRoute(params);
    // Should default to HOME because 'essays' !== 'ESSAYS'
    assert.strictEqual(result.view, View.HOME);
    assert.strictEqual(result.slug, null);
  });
});
