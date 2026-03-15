/**
 * Unit tests for services/deepseekService.ts
 *
 * Uses Node's built-in test runner with mock.module() to stub dependencies,
 * and replaces global.fetch to test the HTTP layer without live network calls.
 */

import { describe, it, beforeEach, after, mock } from 'node:test';
import assert from 'node:assert';
import { Language } from '../types';

// ── Mocks (must come before dynamic import) ──────────────────────────────────

mock.module('../lib/knowledge', {
  namedExports: {
    getFullContext: (_lang: any) => "Mocked system prompt"
  }
});

// Set API key before the module is loaded (it reads the const at module level)
process.env.DEEPSEEK_API_KEY = 'test-deepseek-key';

const { sendMessageToDeepSeek, streamMessageToDeepSeek } =
  await import('../services/deepseekService');

// ── Test helpers ──────────────────────────────────────────────────────────────

/** A successful non-streaming JSON response from DeepSeek */
function makeJsonResponse(content: string, status = 200): Response {
  return new Response(
    JSON.stringify({ choices: [{ message: { content } }] }),
    { status, headers: { 'Content-Type': 'application/json' } }
  );
}

/** A successful streaming SSE response from DeepSeek */
function makeSseResponse(chunks: string[]): Response {
  const encoder = new TextEncoder();
  const lines =
    chunks
      .map(c => `data: ${JSON.stringify({ choices: [{ delta: { content: c } }] })}\n\n`)
      .join('') + 'data: [DONE]\n\n';

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(lines));
      controller.close();
    }
  });
  return new Response(stream, { status: 200 });
}

// ── sendMessageToDeepSeek ─────────────────────────────────────────────────────

describe('sendMessageToDeepSeek', () => {
  const savedFetch = global.fetch;

  beforeEach(() => { global.fetch = savedFetch; });
  after(() => { global.fetch = savedFetch; });

  it('returns the response text on success', async () => {
    global.fetch = mock.fn(async () => makeJsonResponse('Hello from DeepSeek')) as any;

    const result = await sendMessageToDeepSeek([], 'Hi', Language.EN);
    assert.strictEqual(result, 'Hello from DeepSeek');
  });

  it('sends correct Authorization header', async () => {
    let capturedHeaders: Record<string, string> | undefined;
    global.fetch = mock.fn(async (_url: any, init?: RequestInit) => {
      capturedHeaders = init?.headers as Record<string, string>;
      return makeJsonResponse('OK');
    }) as any;

    await sendMessageToDeepSeek([], 'test', Language.EN);
    assert.strictEqual(capturedHeaders?.['Authorization'], 'Bearer test-deepseek-key');
  });

  it('sends the system prompt as a leading system message', async () => {
    let capturedBody: any;
    global.fetch = mock.fn(async (_url: any, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return makeJsonResponse('OK');
    }) as any;

    await sendMessageToDeepSeek([], 'Hi', Language.EN);
    assert.strictEqual(capturedBody.messages[0].role, 'system');
    assert.strictEqual(capturedBody.messages[0].content, 'Mocked system prompt');
  });

  it('maps model history role to "assistant"', async () => {
    let capturedBody: any;
    global.fetch = mock.fn(async (_url: any, init?: RequestInit) => {
      capturedBody = JSON.parse(init?.body as string);
      return makeJsonResponse('OK');
    }) as any;

    const history = [{ role: 'model' as const, text: 'Previous answer' }];
    await sendMessageToDeepSeek(history, 'Follow-up', Language.EN);

    const historyMsg = capturedBody.messages[1];
    assert.strictEqual(historyMsg.role, 'assistant');
    assert.strictEqual(historyMsg.content, 'Previous answer');
  });

  it('returns validation error for oversized input without calling fetch', async () => {
    let fetchCalled = false;
    global.fetch = mock.fn(async () => { fetchCalled = true; return makeJsonResponse(''); }) as any;

    const result = await sendMessageToDeepSeek([], 'a'.repeat(10001), Language.EN);
    assert.match(result, /Message is too long/);
    assert.strictEqual(fetchCalled, false);
  });

  it('returns friendly error on non-200 response', async () => {
    global.fetch = mock.fn(async () => new Response('Unauthorized', { status: 401 })) as any;
    const result = await sendMessageToDeepSeek([], 'Hi', Language.EN);
    assert.match(result, /Error:.*neural link failed/);
  });

  it('returns friendly error on network failure', async () => {
    global.fetch = mock.fn(async () => { throw new TypeError('Failed to fetch'); }) as any;
    const result = await sendMessageToDeepSeek([], 'Hi', Language.EN);
    assert.match(result, /Error:.*neural link failed/);
  });

  it('re-throws AbortError when signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    global.fetch = mock.fn(async () => {
      throw Object.assign(new Error('Aborted'), { name: 'AbortError' });
    }) as any;

    await assert.rejects(
      () => sendMessageToDeepSeek([], 'Hi', Language.EN, controller.signal),
      (err: any) => err.name === 'AbortError'
    );
  });
});

// ── streamMessageToDeepSeek ───────────────────────────────────────────────────

describe('streamMessageToDeepSeek', () => {
  const savedFetch = global.fetch;

  beforeEach(() => { global.fetch = savedFetch; });
  after(() => { global.fetch = savedFetch; });

  it('calls onChunk for each SSE delta and returns the full assembled text', async () => {
    global.fetch = mock.fn(async () => makeSseResponse(['Hello', ',', ' world'])) as any;

    const chunks: string[] = [];
    const result = await streamMessageToDeepSeek(
      [], 'Hi', Language.EN, (c) => chunks.push(c)
    );

    assert.deepStrictEqual(chunks, ['Hello', ',', ' world']);
    assert.strictEqual(result, 'Hello, world');
  });

  it('validates input and delivers error via onChunk without calling fetch', async () => {
    let fetchCalled = false;
    global.fetch = mock.fn(async () => { fetchCalled = true; return makeSseResponse([]); }) as any;

    const chunks: string[] = [];
    const result = await streamMessageToDeepSeek(
      [], 'a'.repeat(10001), Language.EN, (c) => chunks.push(c)
    );

    assert.match(result, /Message is too long/);
    assert.ok(chunks.length > 0, 'onChunk should be called with the error text');
    assert.strictEqual(fetchCalled, false);
  });

  it('returns friendly error on non-200 response', async () => {
    global.fetch = mock.fn(async () => new Response('Server Error', { status: 500 })) as any;
    const result = await streamMessageToDeepSeek([], 'Hi', Language.EN, () => {});
    assert.match(result, /neural link failed/);
  });

  it('returns friendly error on network failure', async () => {
    global.fetch = mock.fn(async () => { throw new TypeError('Failed to fetch'); }) as any;
    const result = await streamMessageToDeepSeek([], 'Hi', Language.EN, () => {});
    assert.match(result, /neural link failed/);
  });

  it('re-throws AbortError when signal is aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    global.fetch = mock.fn(async () => {
      throw Object.assign(new Error('Aborted'), { name: 'AbortError' });
    }) as any;

    await assert.rejects(
      () => streamMessageToDeepSeek([], 'Hi', Language.EN, () => {}, controller.signal),
      (err: any) => err.name === 'AbortError'
    );
  });
});
