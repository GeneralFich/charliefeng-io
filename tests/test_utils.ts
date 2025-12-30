
import { test } from 'node:test';
import * as assert from 'node:assert';
import { parseFollowUpPrompts, calculateReadTime, redactSensitiveInfo, escapeRegExp } from '../lib/utils';

test('escapeRegExp', async (t) => {
  await t.test('escapes special characters', () => {
    const input = '.*+?^${}()|[]\\';
    const expected = '\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\';
    assert.strictEqual(escapeRegExp(input), expected);
  });

  await t.test('does not change standard text', () => {
    const input = 'Hello World 123';
    assert.strictEqual(escapeRegExp(input), input);
  });

  await t.test('handles empty string', () => {
    assert.strictEqual(escapeRegExp(''), '');
  });

  await t.test('handles mixed content', () => {
    const input = 'Price: $5.00 (approx)';
    const expected = 'Price: \\$5\\.00 \\(approx\\)';
    assert.strictEqual(escapeRegExp(input), expected);
  });
});

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
    // With robust parsing, this should extract the first valid JSON array `["Q1"]`
    // and ignore the trailing noise even if it contains brackets.
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Answer.");
    assert.deepStrictEqual(result.prompts, ["Q1"]);
  });

  await t.test('handles brackets inside strings', () => {
    // The "Sliding Window" must not stop at the first ']' inside the string.
    const input = "Answer.\n[FOLLOW_UP] [\"Question with [brackets] inside\"]";
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Answer.");
    assert.deepStrictEqual(result.prompts, ["Question with [brackets] inside"]);
  });

  await t.test('handles nested arrays', () => {
    // Valid JSON with nested structures should be parseable
    const input = "Answer.\n[FOLLOW_UP] [[\"Nested\"], \"Normal\"]";
    const result = parseFollowUpPrompts(input);
    assert.strictEqual(result.cleanText, "Answer.");
    // Typescript might infer string[] but JSON.parse returns any.
    // parseFollowUpPrompts casts result to string[], but runtime it is mixed.
    assert.deepStrictEqual(result.prompts, [["Nested"], "Normal"]);
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
