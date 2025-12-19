
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseFollowUpPrompts } from '../lib/utils';

describe('parseFollowUpPrompts', () => {
  it('should return clean text and prompts when valid JSON is present', () => {
    const input = 'Here is the answer. [FOLLOW_UP] ["Why?", "How?"]';
    const { cleanText, prompts } = parseFollowUpPrompts(input);

    assert.strictEqual(cleanText, 'Here is the answer.');
    assert.deepStrictEqual(prompts, ['Why?', 'How?']);
  });

  it('should return original text and empty prompts when no tag is present', () => {
    const input = 'Just a normal response.';
    const { cleanText, prompts } = parseFollowUpPrompts(input);

    assert.strictEqual(cleanText, 'Just a normal response.');
    assert.deepStrictEqual(prompts, []);
  });

  it('should return clean text and empty prompts when JSON is invalid', () => {
    const input = 'Response. [FOLLOW_UP] ["Broken JSON"';
    // Logic: if fallback fails, prompts remains []
    const { cleanText, prompts } = parseFollowUpPrompts(input);

    assert.strictEqual(cleanText, 'Response.');
    assert.deepStrictEqual(prompts, []);
  });

  it('should use fallback logic for trailing text', () => {
    const input = 'Response. [FOLLOW_UP] ["Q1", "Q2"] some junk text';
    const { cleanText, prompts } = parseFollowUpPrompts(input);

    assert.strictEqual(cleanText, 'Response.');
    assert.deepStrictEqual(prompts, ['Q1', 'Q2']);
  });

  it('should use fallback logic for prefix text in the json part', () => {
     // Ideally the split ensures this doesn't happen usually, but if the model outputs:
     // [FOLLOW_UP] Here are questions: ["Q1"]
     const input = 'Response. [FOLLOW_UP] Here are questions: ["Q1"]';
     const { cleanText, prompts } = parseFollowUpPrompts(input);

     assert.strictEqual(cleanText, 'Response.');
     assert.deepStrictEqual(prompts, ['Q1']);
  });

  it('should handle empty JSON array', () => {
    const input = 'Response. [FOLLOW_UP] []';
    const { cleanText, prompts } = parseFollowUpPrompts(input);

    assert.strictEqual(cleanText, 'Response.');
    assert.deepStrictEqual(prompts, []);
  });

  it('should handle whitespace around the tag', () => {
    const input = 'Response.   [FOLLOW_UP]   ["Q1"]';
    const { cleanText, prompts } = parseFollowUpPrompts(input);

    assert.strictEqual(cleanText, 'Response.');
    assert.deepStrictEqual(prompts, ['Q1']);
  });
});
