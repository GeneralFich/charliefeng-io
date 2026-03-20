
import { test } from 'node:test';
import * as assert from 'node:assert';
import { isSafeLink } from '../lib/utils';

test('Link Safety Logic', async (t) => {
  await t.test('allows http links', () => {
    assert.strictEqual(isSafeLink('http://example.com'), true);
  });

  await t.test('allows https links', () => {
    assert.strictEqual(isSafeLink('https://example.com'), true);
  });

  await t.test('allows mailto links', () => {
    assert.strictEqual(isSafeLink('mailto:user@example.com'), true);
  });

  await t.test('allows internal root-relative links', () => {
    assert.strictEqual(isSafeLink('/about'), true);
    assert.strictEqual(isSafeLink('/essays/my-post'), true);
  });

  await t.test('allows anchor links', () => {
    assert.strictEqual(isSafeLink('#section'), true);
  });

  await t.test('BLOCKS protocol-relative links (open redirect risk)', () => {
    assert.strictEqual(isSafeLink('//malicious.com'), false);
    assert.strictEqual(isSafeLink('//google.com'), false);
  });

  await t.test('BLOCKS javascript: schemes', () => {
    assert.strictEqual(isSafeLink('javascript:alert(1)'), false);
  });

  await t.test('BLOCKS data: schemes', () => {
    assert.strictEqual(isSafeLink('data:text/html,<script>alert(1)</script>'), false);
  });
});
