
import { test } from 'node:test';
import * as assert from 'node:assert';
import { escapeHtml } from '../lib/utils';

test('escapeHtml', async (t) => {
  await t.test('escapes basic HTML characters', () => {
    assert.strictEqual(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  await t.test('escapes quotes', () => {
    assert.strictEqual(escapeHtml('""\'\''), '&quot;&quot;&#039;&#039;');
  });

  await t.test('escapes ampersands', () => {
    assert.strictEqual(escapeHtml('&'), '&amp;');
  });

  await t.test('does not double escape ampersands if already escaped (simple check)', () => {
    // Note: The function IS dumb, it WILL double escape &amp; to &amp;amp;
    // This is expected behavior for simple sanitizers unless complex logic is added.
    assert.strictEqual(escapeHtml('&amp;'), '&amp;amp;');
  });

  await t.test('returns original string if safe', () => {
    assert.strictEqual(escapeHtml('Hello World'), 'Hello World');
  });

  await t.test('handles empty string', () => {
    assert.strictEqual(escapeHtml(''), '');
  });
});
