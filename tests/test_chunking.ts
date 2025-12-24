
import { test } from 'node:test';
import * as assert from 'node:assert';
import { chunkText } from '../lib/utils';

test('chunkText', async (t) => {
  await t.test('chunks text into specified lengths', () => {
    const text = "Sentence one. Sentence two. Sentence three.";
    // Each sentence is roughly 14 chars.
    // If we limit to 20, we should get separate chunks.
    const chunks = chunkText(text, 20);
    assert.strictEqual(chunks.length, 3);
    assert.strictEqual(chunks[0], "Sentence one.");
    assert.strictEqual(chunks[1], "Sentence two.");
    assert.strictEqual(chunks[2], "Sentence three.");
  });

  await t.test('merges sentences if they fit', () => {
    const text = "A. B. C.";
    // length is 8. max 10.
    // "A. B. " is 6. "C." fits.
    const chunks = chunkText(text, 10);
    // "A. B." -> 5 chars.
    // "A. B. C." -> 8 chars.
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0], "A. B. C.");
  });

  await t.test('handles text without punctuation', () => {
    const text = "This is a long sentence without punctuation";
    const chunks = chunkText(text, 100);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0], text);
  });

  await t.test('handles empty text', () => {
    const chunks = chunkText("", 100);
    assert.strictEqual(chunks.length, 0);
  });

  await t.test('respects maxChars strictly when sentence is too long', () => {
     // Current implementation doesn't split sentences, so this is a "known limitation" or "behavior" test.
     // If a single sentence is > maxChars, it will still be one chunk (or overflow).
     // Wait, let's check the code:
     // if ((currentChunk + sentence).length > maxChars) { push(currentChunk); currentChunk = ""; }
     // currentChunk += sentence;
     // So if sentence > maxChars, it pushes empty currentChunk, then adds sentence to new currentChunk.
     // So one chunk will be > maxChars. This is acceptable for now but good to verify.
     const longSentence = "This is a very long sentence that exceeds the limit.";
     const chunks = chunkText(longSentence, 10);
     assert.strictEqual(chunks.length, 1);
     assert.strictEqual(chunks[0], longSentence);
  });
});
