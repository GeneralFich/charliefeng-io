
import { test } from 'node:test';
import * as assert from 'node:assert';
import { parseFollowUpPrompts, calculateReadTime, redactSensitiveInfo } from '../lib/utils';

test('parseFollowUpPrompts', async (t) => {
  await t.test('extracts prompts correctly', () => {
    const input = "Here is the answer.\n[FOLLOW_UP] [\"Q1\", \"Q2\"]";
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Here is the answer.");
    assert.deepStrictEqual(result.prompts, ["Q1", "Q2"]);
  });

  await t.test('handles missing FOLLOW_UP tag', () => {
    const input = "Just text.";
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Just text.");
    assert.deepStrictEqual(result.prompts, []);
  });

  await t.test('handles malformed JSON with fallback', () => {
    const input = "Answer.\n[FOLLOW_UP] some noise [\"Q1\"] more noise";
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Answer.");
    assert.deepStrictEqual(result.prompts, ["Q1"]);
  });

  await t.test('handles completely invalid JSON', () => {
    const input = "Answer.\n[FOLLOW_UP] invalid json";
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Answer.");
    assert.deepStrictEqual(result.prompts, []);
  });

  await t.test('handles multiple markers (preserves rest)', () => {
    const input = "Answer.\n[FOLLOW_UP] [\"Q1\"] and [FOLLOW_UP] more";
    // `potentialJson` is `["Q1"] and [FOLLOW_UP] more`
    // `safeJsonParse` fallback tries to parse JSON from first `[` to last `]`.
    // First `[` is at index 0. Last `]` is inside `[FOLLOW_UP]` (index 19) or `more`? No.
    // The string is: `["Q1"] and [FOLLOW_UP] more`
    // Indices:
    // 0: [
    // 5: ]
    // 11: [ (from FOLLOW_UP)
    // 21: ] (from FOLLOW_UP)

    // Last `]` is 21.
    // So substring is `["Q1"] and [FOLLOW_UP]`
    // JSON.parse on that will FAIL.

    // The original implementation logic was:
    // `prompts = JSON.parse(potentialJson)` -> fails.
    // Fallback: `substring(first, last+1)`.

    // My test assumes it would extract `["Q1"]`.
    // But if there are brackets LATER in the string (like in `[FOLLOW_UP]`), the `lastIndexOf(']')` will grab them.

    // This reveals a flaw in the original logic (or my understanding of it) if the noise contains brackets.
    // However, `[FOLLOW_UP]` contains `]`.

    // If I change the input to not have brackets in the noise, it should pass.
    // OR I accept that the original logic was naive about trailing brackets.

    // Let's adjust the test case to be realistic about what we expect: handled gracefully (empty prompts) OR if we want it to work, we need smarter parsing.
    // Since this is a refactor, I should stick to original behavior.
    // Original behavior: `lastIndexOf(']')` would indeed pick the last one.
    // So `["Q1"] and [FOLLOW_UP]` is NOT valid JSON.
    // So `prompts` would be `[]`.

    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Answer.");
    assert.deepStrictEqual(result.prompts, []);
  });
});

test('calculateReadTime', async (t) => {
  await t.test('returns 1 for empty text', () => {
    assert.strictEqual(calculateReadTime(""), 1);
  });

  await t.test('returns 1 for whitespace only', () => {
    assert.strictEqual(calculateReadTime("   "), 1);
  });

  await t.test('calculates time correctly', () => {
    const words = new Array(400).fill("word").join(" ");
    assert.strictEqual(calculateReadTime(words), 2);
  });

  await t.test('calculates time for 201 words (2 mins)', () => {
    const words = new Array(201).fill("word").join(" ");
    assert.strictEqual(calculateReadTime(words), 2);
  });

  await t.test('calculates time for 200 words (1 min)', () => {
    const words = new Array(200).fill("word").join(" ");
    assert.strictEqual(calculateReadTime(words), 1);
  });
});

test('redactSensitiveInfo', async (t) => {
  await t.test('redacts secrets', () => {
    const secret = "supersecret";
    const text = "This is a supersecret message.";
    const result = redactSensitiveInfo(text, [secret]);
    assert.strictEqual(result, "This is a [REDACTED] message.");
  });

  await t.test('ignores short secrets', () => {
    const secret = "123";
    const text = "123 testing.";
    const result = redactSensitiveInfo(text, [secret]);
    assert.strictEqual(result, "123 testing.");
  });

  await t.test('handles regex special chars in secret', () => {
    const secret = "secret.";
    const text = "This is a secret. message.";
    const result = redactSensitiveInfo(text, [secret]);
    assert.strictEqual(result, "This is a [REDACTED] message.");
  });

  await t.test('handles undefined/null secrets', () => {
    const text = "Message.";
    const result = redactSensitiveInfo(text, [undefined, null]);
    assert.strictEqual(result, "Message.");
  });
});
