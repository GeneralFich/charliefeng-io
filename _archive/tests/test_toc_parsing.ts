import { test } from 'node:test';
import assert from 'node:assert';
import { extractTextFromMarkdown, slugify } from '../lib/utils';

/**
 * @fileoverview Unit Tests for Table of Contents Parsing Logic
 *
 * NOTE ON TESTING STRATEGY:
 * The parsing logic below (`parseToc`) is a REPLICA of the internal logic found in
 * `components/TableOfContents.tsx`.
 *
 * "Why": The component logic is not exported (it's inside `useMemo`), making it inaccessible
 * to unit tests without refactoring the component to export it. To ensure the regex and
 * filtering logic is correct without making the component API messy, we test this replica.
 *
 * ⚠️ MAINTENANCE WARNING:
 * If you modify the parsing logic in `components/TableOfContents.tsx`, you MUST update
 * the `parseToc` function in this file to match. Otherwise, tests will pass while the
 * component fails (False Positive).
 */

function parseToc(markdown: string) {
    const items: any[] = [];
    const lines = markdown.split('\n');
    const headerRegex = /^\s*(#{1,3})\s+(.+)$/;
    let inFrontmatter = false;
    let inCodeBlock = false;
    let lineIndex = 0;

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (lineIndex === 0 && trimmedLine === '---') {
        inFrontmatter = true;
        lineIndex++;
        continue;
      }
      if (inFrontmatter) {
        if (trimmedLine === '---') {
            inFrontmatter = false;
        }
        lineIndex++;
        continue;
      }

      if (trimmedLine.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        lineIndex++;
        continue;
      }
      if (inCodeBlock) {
        lineIndex++;
        continue;
      }

      const match = line.match(headerRegex);
      if (match) {
        const rawText = match[2];
        const cleanText = extractTextFromMarkdown(rawText);
        // Only valid headers
        if (cleanText) items.push(cleanText);
      }
      lineIndex++;
    }
    return items;
}

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
    const headers = parseToc(markdown);
    assert.deepStrictEqual(headers, ['Title', 'Real Header']);
  });

  await t.test('handles frontmatter', () => {
    const markdown = `---
title: # Fake Header
---
# Real Header`;
    const headers = parseToc(markdown);
    assert.deepStrictEqual(headers, ['Real Header']);
  });
});
