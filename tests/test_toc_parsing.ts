import { test } from 'node:test';
import assert from 'node:assert';
import { parseTableOfContents } from '../lib/utils';

/**
 * @fileoverview Unit Tests for Table of Contents Parsing Logic
 *
 * This tests the shared `parseTableOfContents` utility used by `components/TableOfContents.tsx`.
 */

test('TOC Parsing', async (t) => {
  await t.test('ignores headers in code blocks', () => {
    const markdown = `
# Title

Some text.

\`\`\`python
# This is a comment, not a header
def foo():
    pass
\`\`\`

## Real Header
`;
    const items = parseTableOfContents(markdown);
    const headers = items.map(i => i.text);
    assert.deepStrictEqual(headers, ['Title', 'Real Header']);
  });

  await t.test('handles frontmatter', () => {
    const markdown = `---
title: # Fake Header
---
# Real Header`;
    const items = parseTableOfContents(markdown);
    const headers = items.map(i => i.text);
    assert.deepStrictEqual(headers, ['Real Header']);
  });

  await t.test('extracts correct hierarchy levels', () => {
      const markdown = `
# H1
## H2
### H3
#### H4 (Ignored)
      `;
      const items = parseTableOfContents(markdown);
      assert.deepStrictEqual(items.map(i => i.level), [1, 2, 3]);
  });

  await t.test('slugifies IDs correctly', () => {
      const markdown = `
# Hello World
## Foo Bar
      `;
      const items = parseTableOfContents(markdown);
      assert.deepStrictEqual(items.map(i => i.id), ['hello-world', 'foo-bar']);
  });

  await t.test('handles duplicate headers (known limitation: duplicate IDs)', () => {
      const markdown = `
# Intro
# Intro
      `;
      const items = parseTableOfContents(markdown);
      assert.deepStrictEqual(items.map(i => i.id), ['intro', 'intro']);
  });

  await t.test('handles weird spacing', () => {
      const markdown = `
   #    Spaced Header
`;
      const items = parseTableOfContents(markdown);
      assert.strictEqual(items[0].text, 'Spaced Header');
      assert.strictEqual(items[0].level, 1);
  });
});
