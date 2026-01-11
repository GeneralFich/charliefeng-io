
import { test } from 'node:test';
import * as assert from 'node:assert';
import { safeJsonParse } from '../lib/utils';

test('safeJsonParse', async (t) => {
  await t.test('parses standard JSON correctly', () => {
    assert.deepStrictEqual(safeJsonParse('{"key": "value"}'), { key: 'value' });
    assert.deepStrictEqual(safeJsonParse('[1, 2, 3]'), [1, 2, 3]);
    assert.deepStrictEqual(safeJsonParse('"string"'), 'string');
    assert.deepStrictEqual(safeJsonParse('123'), 123);
    assert.deepStrictEqual(safeJsonParse('true'), true);
    assert.deepStrictEqual(safeJsonParse('null'), null);
  });

  await t.test('parses embedded JSON (Bracket Balance strategy)', () => {
    const input = 'Here is the data: [1, 2, 3] and some noise';
    assert.deepStrictEqual(safeJsonParse(input), [1, 2, 3]);
  });

  await t.test('handles multiple bracket structures', () => {
    // Should find the first valid array structure
    const input = 'Text [ [1], [2] ] Text';
    assert.deepStrictEqual(safeJsonParse(input), [[1], [2]]);
  });

  await t.test('handles brackets inside strings', () => {
    // The "Sliding Window" must not stop at the first ']' inside the string.
    const input = 'Prefix ["String with [brackets] inside"] Suffix';
    assert.deepStrictEqual(safeJsonParse(input), ["String with [brackets] inside"]);
  });

  await t.test('handles escaped quotes inside strings', () => {
    const input = 'Prefix ["String with \\"quoted\\" text"] Suffix';
    assert.deepStrictEqual(safeJsonParse(input), ["String with \"quoted\" text"]);
  });

  await t.test('handles escaped backslashes', () => {
    // Input representation of: ["Path\\To\\File"]
    // String literal needs escaping: '["Path\\\\To\\\\File"]'
    const input = 'Prefix ["Path\\\\To\\\\File"] Suffix';
    assert.deepStrictEqual(safeJsonParse(input), ["Path\\To\\File"]);
  });

  await t.test('handles unbalanced brackets', () => {
    const input = '[1, 2';
    assert.strictEqual(safeJsonParse(input), null);
  });

  await t.test('handles balanced but invalid JSON', () => {
    const input = '[1, 2,]'; // Trailing comma is invalid JSON
    assert.strictEqual(safeJsonParse(input), null);
  });

  await t.test('handles empty string', () => {
    assert.strictEqual(safeJsonParse(''), null);
  });

  await t.test('handles no JSON present', () => {
    assert.strictEqual(safeJsonParse('Just plain text'), null);
  });

  await t.test('handles nested objects within arrays', () => {
    const input = 'Start [{"id": 1, "val": [2, 3]}] End';
    assert.deepStrictEqual(safeJsonParse(input), [{id: 1, val: [2, 3]}]);
  });

  await t.test('ignores brackets inside escaped quotes (complex)', () => {
    // Case: "String with \"[brackets]\" inside"
    const input = 'Start ["String with \\"[brackets]\\" inside"] End';
    assert.deepStrictEqual(safeJsonParse(input), ["String with \"[brackets]\" inside"]);
  });
});
