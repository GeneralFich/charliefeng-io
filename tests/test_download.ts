import { test } from 'node:test';
import assert from 'node:assert';
import { formatChatHistory } from '../lib/download';
import { Message } from '../types';

test('formatChatHistory formats messages correctly', () => {
  const messages: Message[] = [
    { role: 'user', text: 'Hello' },
    { role: 'model', text: 'Hi there!' }
  ];

  const formatted = formatChatHistory(messages);

  const expectedParts = [
    '[You]:\nHello\n',
    '-'.repeat(40),
    '[Charlie (AI)]:\nHi there!\n'
  ];

  // Check if all parts are present
  assert.ok(formatted.includes('[You]:\nHello\n'));
  assert.ok(formatted.includes('[Charlie (AI)]:\nHi there!\n'));
  assert.ok(formatted.includes('-'.repeat(40)));
});

test('formatChatHistory handles empty messages', () => {
  const messages: Message[] = [];
  const formatted = formatChatHistory(messages);
  assert.strictEqual(formatted, '');
});

test('formatChatHistory handles single message', () => {
    const messages: Message[] = [{ role: 'user', text: 'Just one' }];
    const formatted = formatChatHistory(messages);
    assert.strictEqual(formatted, '[You]:\nJust one\n');
});
