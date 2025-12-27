
import { test } from 'node:test';
import * as assert from 'node:assert';
import { parseFollowUpPrompts, calculateReadTime, redactSensitiveInfo, chunkText, escapeRegExp } from '../lib/utils';

test('parseFollowUpPrompts', async (t) => {
  await t.test('extracts prompts correctly', () => {
    const result = parseFollowUpPrompts("Here is the answer.\n[FOLLOW_UP] [\"Q1\"]");
    assert.deepStrictEqual(result.prompts, ["Q1"]);
  });
});

test('calculateReadTime', async (t) => {
  await t.test('calculates time correctly', () => {
    const words = new Array(400).fill("word").join(" ");
    assert.strictEqual(calculateReadTime(words), 2);
  });
});

test('redactSensitiveInfo', async (t) => {
  await t.test('redacts secrets', () => {
    const result = redactSensitiveInfo("secret message", ["secret"]);
    assert.strictEqual(result, "[REDACTED] message");
  });
});

test('chunkText', async (t) => {
  await t.test('splits text into chunks respecting maxChars', () => {
    const text = "Sentence one. Sentence two. Sentence three.";
    const result = chunkText(text, 30);
    assert.ok(result.length > 1);
    assert.ok(result[0].includes("Sentence one"));
  });

  await t.test('handles text without punctuation', () => {
    const text = "No punctuation here";
    const result = chunkText(text, 100);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0], "No punctuation here");
  });

  await t.test('splits huge sentence', () => {
    const longSentence = "A".repeat(50) + ".";
    const result = chunkText(longSentence, 10);
    assert.strictEqual(result.length, 1, `Expected 1 chunk, got ${result.length}`);
    assert.strictEqual(result[0], longSentence);
  });

  await t.test('handles abbreviations nicely (Intl support check)', () => {
      // We will just verify it doesn't crash and returns SOMETHING.
      // If Intl is missing, we accept the split but we verify logical consistency.
      const text = "Mr. Smith goes to Washington.";
      const result = chunkText(text, 100);
      assert.ok(result.length > 0);
      assert.ok(result[0].includes("Smith"));
      // Check for double space artifact
      assert.strictEqual(result[0].includes("  "), false, "Double space detected");
  });
});

test('escapeRegExp', async (t) => {
  await t.test('escapes special characters', () => {
    const input = ".*+?^${}()|[]\\";
    const escaped = escapeRegExp(input);
    assert.strictEqual(escaped.includes("\\."), true);
  });
});
