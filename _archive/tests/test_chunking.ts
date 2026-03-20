
import { test } from 'node:test';
import * as assert from 'node:assert';
import { chunkText } from '../lib/utils';

test('chunkText Logic', async (t) => {
  await t.test('chunks text by sentences', () => {
    const text = "Hello world. This is a test. Another sentence.";
    // Max chars large enough to hold all
    const chunks = chunkText(text, 1000);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].trim(), text);
  });

  await t.test('splits when maxChars is exceeded', () => {
    const text = "Sentence 1. Sentence 2. Sentence 3.";
    // Make maxChars small enough to force split
    // "Sentence 1. " is 12 chars
    const chunks = chunkText(text, 15);
    // Chunk 1: "Sentence 1. " (12 chars)
    // Chunk 2: "Sentence 2. " (12 chars)
    // Chunk 3: "Sentence 3. " (12 chars)
    assert.strictEqual(chunks.length, 3);
    assert.strictEqual(chunks[0], "Sentence 1.");
    assert.strictEqual(chunks[1], "Sentence 2.");
    assert.strictEqual(chunks[2], "Sentence 3.");
  });

  await t.test('handles single sentence exceeding maxChars', () => {
    const longSentence = "This is a very long sentence that exceeds the limit.";
    const chunks = chunkText(longSentence, 10);
    // Logic: if (current + sentence > max), push current.
    // Then current += sentence.
    // So it effectively pushes one giant chunk if the sentence itself is huge.
    // The current implementation does NOT hard-split sentences.
    assert.strictEqual(chunks.length, 1);
    assert.ok(chunks[0].length > 10);
  });

  await t.test('handles empty input', () => {
    const chunks = chunkText("", 100);
    assert.strictEqual(chunks.length, 0);
  });

  await t.test('handles text without punctuation', () => {
    const text = "No punctuation here";
    const chunks = chunkText(text, 100);
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0], text);
  });

  await t.test('handles standard abbreviations (limitation)', () => {
    // Current regex `/[^.!?]+[.!?]+/g` is naive.
    // "Mr. Smith" -> ["Mr.", " Smith"]
    const text = "Mr. Smith went to Washington.";
    const chunks = chunkText(text, 100);
    // Since maxChars is 100, they will likely be joined into one chunk anyway.
    assert.strictEqual(chunks.length, 1);
    assert.strictEqual(chunks[0].replace(/\s+/g, ' ').trim(), "Mr. Smith went to Washington.");
  });

  await t.test('handles naive split behavior with small limits', () => {
    // Demonstrating the "limitation" or "feature" where "Mr." might split if limit is tiny
    const text = "Mr. Smith.";
    // "Mr." is 3 chars. " Smith." is 7 chars.
    const chunks = chunkText(text, 5);
    // "Mr." (3) < 5. Current = "Mr. "
    // " Smith." (7). "Mr. " + " Smith." = 11 > 5.
    // Push "Mr.". Current = " Smith. "
    // Push "Smith.".
    assert.strictEqual(chunks.length, 2);
    assert.strictEqual(chunks[0], "Mr.");
    assert.strictEqual(chunks[1], "Smith.");
  });
});
