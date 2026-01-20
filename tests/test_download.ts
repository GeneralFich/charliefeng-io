import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import { formatChatHistory, downloadTextFile, downloadChatHistory } from '../lib/download';
import { Message } from '../types';

describe('formatChatHistory', () => {
  it('formats messages correctly', () => {
    const messages: Message[] = [
      { role: 'user', text: 'Hello' },
      { role: 'model', text: 'Hi there!' }
    ];

    const formatted = formatChatHistory(messages);

    // Check if all parts are present
    assert.ok(formatted.includes('[You]:\nHello\n'));
    assert.ok(formatted.includes('[Charlie (AI)]:\nHi there!\n'));
    assert.ok(formatted.includes('-'.repeat(40)));
  });

  it('handles empty messages', () => {
    const messages: Message[] = [];
    const formatted = formatChatHistory(messages);
    assert.strictEqual(formatted, '');
  });

  it('handles single message', () => {
    const messages: Message[] = [{ role: 'user', text: 'Just one' }];
    const formatted = formatChatHistory(messages);
    assert.strictEqual(formatted, '[You]:\nJust one\n');
  });
});

describe('downloadTextFile', () => {
  let originalWindow: any;
  let originalDocument: any;
  let originalBlob: any;
  let originalURL: any;

  before(() => {
    originalWindow = global.window;
    originalDocument = global.document;
    originalBlob = global.Blob;
    originalURL = global.URL;
  });

  after(() => {
    global.window = originalWindow;
    global.document = originalDocument;
    global.Blob = originalBlob;
    global.URL = originalURL;
  });

  it('safely returns in non-browser environment', () => {
    global.window = undefined as any;
    global.document = undefined as any;

    // Should not throw
    downloadTextFile('content', 'file.txt');
  });

  it('creates and clicks download link in browser environment', () => {
    const appendChildMock = mock.fn();
    const removeChildMock = mock.fn();
    const clickMock = mock.fn();
    const createObjectURLMock = mock.fn(() => 'blob:url');
    const revokeObjectURLMock = mock.fn();

    // Mock Browser Environment
    global.window = {} as any;

    // Mock Anchor Element
    const anchorMock = {
        click: clickMock,
        href: '',
        download: ''
    };

    global.document = {
      createElement: (tag: string) => {
        if (tag === 'a') return anchorMock;
        return {};
      },
      body: {
        appendChild: appendChildMock,
        removeChild: removeChildMock
      }
    } as any;

    global.Blob = class {
      constructor(content: any[], options: any) {
         assert.deepStrictEqual(content, ['content']);
         assert.deepStrictEqual(options, { type: 'text/plain' });
      }
    } as any;

    global.URL = {
      createObjectURL: createObjectURLMock,
      revokeObjectURL: revokeObjectURLMock
    } as any;

    downloadTextFile('content', 'file.txt');

    // Verification
    assert.strictEqual(createObjectURLMock.mock.callCount(), 1);

    // Check anchor attributes
    assert.strictEqual(anchorMock.href, 'blob:url');
    assert.strictEqual(anchorMock.download, 'file.txt');

    assert.strictEqual(appendChildMock.mock.callCount(), 1);
    assert.strictEqual(clickMock.mock.callCount(), 1);
    assert.strictEqual(removeChildMock.mock.callCount(), 1);
    assert.strictEqual(revokeObjectURLMock.mock.callCount(), 1);
  });
});

describe('downloadChatHistory', () => {
    let originalWindow: any;
    let originalDocument: any;
    let originalBlob: any;
    let originalURL: any;

    before(() => {
      originalWindow = global.window;
      originalDocument = global.document;
      originalBlob = global.Blob;
      originalURL = global.URL;
    });

    after(() => {
      global.window = originalWindow;
      global.document = originalDocument;
      global.Blob = originalBlob;
      global.URL = originalURL;
    });

    it('does not download if history is empty or too short', () => {
        // Mock to fail if called
        const createObjectURLMock = mock.fn();
        global.URL = { createObjectURL: createObjectURLMock } as any;
        global.window = {} as any;
        global.document = {} as any;

        const messages: Message[] = [{ role: 'user', text: 'Hi' }];
        // downloadChatHistory has check: if (messages.length <= 1) return;

        downloadChatHistory(messages);

        assert.strictEqual(createObjectURLMock.mock.callCount(), 0);
    });

    it('downloads formatted history', () => {
        const createObjectURLMock = mock.fn(() => 'blob:url');
        const clickMock = mock.fn();
        const anchorMock = { click: clickMock, href: '', download: '' };

        global.window = {} as any;
        global.document = {
            createElement: () => anchorMock,
            body: {
                appendChild: () => {},
                removeChild: () => {}
            }
        } as any;
        global.Blob = class {} as any;
        global.URL = {
            createObjectURL: createObjectURLMock,
            revokeObjectURL: () => {}
        } as any;

        const messages: Message[] = [
            { role: 'user', text: 'Hi' },
            { role: 'model', text: 'Hello' }
        ];

        downloadChatHistory(messages);

        assert.strictEqual(createObjectURLMock.mock.callCount(), 1);
        assert.ok(anchorMock.download.startsWith('charlie-feng-chat-'));
        assert.ok(anchorMock.download.endsWith('.txt'));
    });
});
