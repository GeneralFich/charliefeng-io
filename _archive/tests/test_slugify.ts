import { test } from 'node:test';
import assert from 'node:assert';
import { slugify, extractTextFromMarkdown } from '../lib/utils';

test('slugify', async (t) => {
  await t.test('converts to lowercase', () => {
    assert.strictEqual(slugify('Hello World'), 'hello-world');
  });

  await t.test('removes special characters', () => {
    assert.strictEqual(slugify('Hello, World!'), 'hello-world');
  });

  await t.test('handles multiple spaces', () => {
    assert.strictEqual(slugify('Hello   World'), 'hello-world');
  });

  await t.test('handles numbers', () => {
    assert.strictEqual(slugify('Section 123'), 'section-123');
  });

  await t.test('handles dashes', () => {
    assert.strictEqual(slugify('User-defined'), 'user-defined');
  });

  await t.test('strips emojis', () => {
     assert.strictEqual(slugify('🚀 Blast Off'), 'blast-off');
  });
});

test('extractTextFromMarkdown', async (t) => {
  await t.test('removes bold', () => {
    assert.strictEqual(extractTextFromMarkdown('**Bold** Title'), 'Bold Title');
  });

  await t.test('removes italic', () => {
    assert.strictEqual(extractTextFromMarkdown('*Italic* Title'), 'Italic Title');
  });

  await t.test('removes links', () => {
    assert.strictEqual(extractTextFromMarkdown('[Link](http://example.com)'), 'Link');
  });

  await t.test('removes code', () => {
    assert.strictEqual(extractTextFromMarkdown('`Code`'), 'Code');
  });
});
