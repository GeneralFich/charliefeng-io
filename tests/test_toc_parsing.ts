import { test } from 'node:test';
import assert from 'node:assert';
import { parseTableOfContents } from '../lib/utils';

/**
 * @fileoverview Unit Tests for Table of Contents Parsing Logic
 *
 * NOTE: The parsing logic is now centralized in `lib/utils.ts` and used by
 * `components/TableOfContents.tsx`. This test file verifies that shared logic.
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
    // Map to text to match previous test expectations
    const headers = parseTableOfContents(markdown).map(item => item.text);
    assert.deepStrictEqual(headers, ['Title', 'Real Header']);
  });

  await t.test('handles frontmatter', () => {
    const markdown = `---
title: # Fake Header
---
# Real Header`;
    const headers = parseTableOfContents(markdown).map(item => item.text);
    assert.deepStrictEqual(headers, ['Real Header']);
  });

  await t.test('extracts correct structure', () => {
    const markdown = `
# H1
## H2
### H3
`;
    const items = parseTableOfContents(markdown);
    assert.strictEqual(items.length, 3);
    assert.strictEqual(items[0].text, 'H1');
    assert.strictEqual(items[0].level, 1);
    assert.strictEqual(items[0].id, 'h1');

    assert.strictEqual(items[1].text, 'H2');
    assert.strictEqual(items[1].level, 2);
    assert.strictEqual(items[1].id, 'h2');

    assert.strictEqual(items[2].text, 'H3');
    assert.strictEqual(items[2].level, 3);
    assert.strictEqual(items[2].id, 'h3');
  });
});
