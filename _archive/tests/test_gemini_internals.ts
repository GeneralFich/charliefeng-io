import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { Language, Message } from '../types';

/**
 * @fileoverview Tests for the internal helper functions of geminiService.ts
 *
 * These test the pure functions (buildGeminiMessages, validateRequest,
 * handleServiceError) that were previously unexported and untested.
 * The existing test_gemini_service.ts covers the public API; this file
 * tests the internal logic directly.
 */

// Mock dependencies before importing service internals
mock.module('@google/genai', {
  namedExports: {
    GoogleGenAI: class {
      constructor() {}
      models = { generateContent: async () => ({ text: 'ok' }) };
    },
  },
});

mock.module('../lib/rag', {
  namedExports: {
    getRelevantContext: async () => [],
  },
});

mock.module('../lib/knowledge', {
  namedExports: {
    FULL_CONTEXT: 'System Prompt',
    getFullContext: () => 'System Prompt',
  },
});

process.env.API_KEY = 'test-key-for-internals';

const { buildGeminiMessages, validateRequest, handleServiceError } = await import(
  '../services/geminiService'
);

describe('buildGeminiMessages', () => {
  it('maps history messages to Gemini Content format', () => {
    const history: Message[] = [
      { role: 'user', text: 'Hello' },
      { role: 'model', text: 'Hi there' },
    ];

    const result = buildGeminiMessages(history, 'New question', '');

    assert.strictEqual(result.length, 3);
    assert.deepStrictEqual(result[0], { role: 'user', parts: [{ text: 'Hello' }] });
    assert.deepStrictEqual(result[1], { role: 'model', parts: [{ text: 'Hi there' }] });
    assert.deepStrictEqual(result[2], { role: 'user', parts: [{ text: 'New question' }] });
  });

  it('injects RAG context into the new message when present', () => {
    const history: Message[] = [];
    const context = '\n\nTitle: Test\nExcerpt: some context';

    const result = buildGeminiMessages(history, 'My query', context);

    assert.strictEqual(result.length, 1);
    assert.ok(result[0].parts[0].text.includes('Context for this query:'));
    assert.ok(result[0].parts[0].text.includes('some context'));
    assert.ok(result[0].parts[0].text.includes('User Query: My query'));
  });

  it('does not inject context prefix when context is empty', () => {
    const result = buildGeminiMessages([], 'Plain question', '');

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].parts[0].text, 'Plain question');
  });

  it('handles empty history', () => {
    const result = buildGeminiMessages([], 'First message', '');

    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].role, 'user');
  });

  it('preserves message order', () => {
    const history: Message[] = [
      { role: 'user', text: 'Q1' },
      { role: 'model', text: 'A1' },
      { role: 'user', text: 'Q2' },
      { role: 'model', text: 'A2' },
    ];

    const result = buildGeminiMessages(history, 'Q3', '');

    assert.strictEqual(result.length, 5);
    assert.strictEqual(result[0].parts[0].text, 'Q1');
    assert.strictEqual(result[1].parts[0].text, 'A1');
    assert.strictEqual(result[4].parts[0].text, 'Q3');
  });
});

describe('validateRequest', () => {
  it('returns sanitized message for valid input', () => {
    const result = validateRequest([], 'Hello');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.sanitizedMessage, 'Hello');
  });

  it('strips control characters during sanitization', () => {
    const result = validateRequest([], 'Hello\x00World');
    assert.strictEqual(result.isValid, true);
    assert.strictEqual(result.sanitizedMessage, 'HelloWorld');
  });

  it('rejects messages that are too long', () => {
    const longMsg = 'a'.repeat(2001);
    const result = validateRequest([], longMsg);
    assert.strictEqual(result.isValid, false);
    assert.ok(result.error);
    assert.match(result.error!, /too long/i);
  });

  it('rejects empty messages', () => {
    const result = validateRequest([], '');
    assert.strictEqual(result.isValid, false);
  });

  it('rejects invalid history format', () => {
    const result = validateRequest('not-an-array' as any, 'hello');
    assert.strictEqual(result.isValid, false);
  });

  it('rejects repeated messages', () => {
    const history: Message[] = [
      { role: 'user', text: 'same message' },
      { role: 'model', text: 'response' },
      { role: 'user', text: 'same message' },
    ];
    const result = validateRequest(history, 'same message');
    assert.strictEqual(result.isValid, false);
    assert.match(result.error!, /repeat/i);
  });
});

describe('handleServiceError', () => {
  it('returns a user-friendly error message for generic errors', () => {
    const result = handleServiceError(new Error('something broke'));
    assert.match(result, /Connection to the neural link failed/);
  });

  it('re-throws when abort signal is aborted', () => {
    const controller = new AbortController();
    controller.abort();

    assert.throws(() => {
      handleServiceError(new Error('AbortError'), controller.signal);
    });
  });

  it('handles non-Error throwables', () => {
    const result = handleServiceError('string error');
    assert.match(result, /Connection to the neural link failed/);
  });

  it('handles null/undefined errors', () => {
    const result = handleServiceError(undefined);
    assert.match(result, /Connection to the neural link failed/);
  });
});
