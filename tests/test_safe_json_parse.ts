
import { test } from 'node:test';
import * as assert from 'node:assert';
import { safeJsonParse } from '../lib/utils';

test('safeJsonParse', async (t) => {
  await t.test('parses standard valid JSON', () => {
    const input = '["item1", "item2"]';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, ["item1", "item2"]);
  });

  await t.test('parses JSON object', () => {
    const input = '{"key": "value"}';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, { key: "value" });
  });

  await t.test('extracts JSON array from text with noise', () => {
    const input = 'Here is the data: ["item1", "item2"] and some trailing text.';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, ["item1", "item2"]);
  });

  await t.test('extracts nested JSON array from text', () => {
    const input = 'Result: [["nested", "item"], "top"] end.';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, [["nested", "item"], "top"]);
  });

  await t.test('handles brackets inside strings correctly', () => {
    // The parser should not count the ] inside the string as a closing bracket
    const input = 'Prefix ["This has [brackets] inside"] Suffix';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, ["This has [brackets] inside"]);
  });

  await t.test('handles escaped quotes inside strings', () => {
    const input = 'Prefix ["String with \\"quoted\\" text"] Suffix';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, ["String with \"quoted\" text"]);
  });

  await t.test('handles escaped backslashes', () => {
    // Input represents: ["Backslash \\ test"]
    const input = 'Prefix ["Backslash \\\\ test"] Suffix';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, ["Backslash \\ test"]);
  });

  await t.test('returns null if no JSON found', () => {
    const input = 'Just some text without brackets.';
    const result = safeJsonParse(input);
    assert.strictEqual(result, null);
  });

  await t.test('returns null for unbalanced brackets', () => {
    const input = 'Start ["item1", "item2" incomplete...';
    const result = safeJsonParse(input);
    assert.strictEqual(result, null);
  });

  await t.test('returns null for valid bracket structure but invalid JSON', () => {
    // Trailing comma is invalid in JSON
    const input = 'Start ["item1",] End';
    const result = safeJsonParse(input);
    assert.strictEqual(result, null);
  });

  await t.test('handles multiple arrays, returning the first one', () => {
    const input = 'First: ["one"] Second: ["two"]';
    const result = safeJsonParse(input);
    assert.deepStrictEqual(result, ["one"]);
  });

  await t.test('returns null for noisy objects (fallback only supports arrays)', () => {
    // The fallback strategy explicitly looks for '[' so it does not support extracting objects from noise
    const input = 'Noise {"key": "value"}';
    const result = safeJsonParse(input);
    assert.strictEqual(result, null);
  });
});
