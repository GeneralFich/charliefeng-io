import { test } from 'node:test';
import assert from 'node:assert';
import { extractTextFromMarkdown, slugify } from '../lib/utils';

// We need to test the logic inside TableOfContents component.
// Since it's inside a component, we can replicate the logic here for testing.

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
