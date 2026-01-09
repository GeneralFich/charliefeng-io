import { test } from 'node:test';
import assert from 'node:assert';
import { checkRateLimit, validateChatInput, MAX_NEW_MESSAGE_LENGTH, MAX_TOTAL_HISTORY_LENGTH } from '../lib/security';
import { Message } from '../types';

test('checkRateLimit allows requests within limit', () => {
  const timestamps = [Date.now() - 2000];
  const windowMs = 60000;
  const maxRequests = 5;

  const result = checkRateLimit(timestamps, windowMs, maxRequests);
  assert.strictEqual(result.allowed, true);
  assert.strictEqual(result.newTimestamps.length, 2);
});

test('checkRateLimit blocks requests over limit', () => {
  const now = Date.now();
  // Simulate 5 requests already made in the last minute
  const timestamps = [now, now, now, now, now];
  const windowMs = 60000;
  const maxRequests = 5;

  const result = checkRateLimit(timestamps, windowMs, maxRequests);
  assert.strictEqual(result.allowed, false);
});

test('checkRateLimit clears old timestamps', () => {
  const oldTime = Date.now() - 70000; // Older than 1 min
  const timestamps = [oldTime];
  const windowMs = 60000;
  const maxRequests = 5;

  const result = checkRateLimit(timestamps, windowMs, maxRequests);
  assert.strictEqual(result.allowed, true);
  // Should remove the old one and add the new one
  assert.strictEqual(result.newTimestamps.length, 1);
});

test('validateChatInput', async (t) => {
    await t.test('accepts valid input', () => {
        const history: Message[] = [{ role: 'user', text: 'Hello' }];
        const newMessage = 'World';
        const result = validateChatInput(history, newMessage);
        assert.strictEqual(result.valid, true);
    });

    await t.test('rejects message exceeding max length', () => {
        const history: Message[] = [];
        const newMessage = 'a'.repeat(MAX_NEW_MESSAGE_LENGTH + 1);
        const result = validateChatInput(history, newMessage);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.error, "Message is too long. Please shorten your query.");
    });

    await t.test('rejects history exceeding max total length', () => {
        const largeText = 'a'.repeat(MAX_TOTAL_HISTORY_LENGTH);
        const history: Message[] = [{ role: 'user', text: largeText }];
        const newMessage = 'Short';
        const result = validateChatInput(history, newMessage);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.error, "Conversation history is too long. Please clear chat to continue.");
    });

    await t.test('rejects malformed history (invalid object)', () => {
        const history = [{ foo: 'bar' }] as unknown as Message[];
        const newMessage = 'Test';
        const result = validateChatInput(history, newMessage);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.error, "Invalid message format in history.");
    });

    await t.test('rejects malformed history (missing text)', () => {
        const history = [{ role: 'user' }] as unknown as Message[];
        const newMessage = 'Test';
        const result = validateChatInput(history, newMessage);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.error, "Invalid message format in history.");
    });

    await t.test('rejects not array', () => {
        const history = "Not an array" as unknown as Message[];
        const newMessage = 'Test';
        const result = validateChatInput(history, newMessage);
        assert.strictEqual(result.valid, false);
        assert.strictEqual(result.error, "Invalid history format.");
    });
});
