import { test, describe, it, before, after, beforeEach, mock } from 'node:test';
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

describe('Browser Download Logic', () => {
    let windowMock: any;
    let documentMock: any;
    let blobMock: any;
    let urlMock: any;

    let createdElement: any;
    let appendedChild: any;
    let removedChild: any;
    let revokedUrl: any;

    // We store the original globals to restore them later
    const originalWindow = (global as any).window;
    const originalDocument = (global as any).document;
    const originalBlob = (global as any).Blob;
    const originalURL = (global as any).URL;

    before(() => {
        // Mock Blob
        blobMock = class {
            content: any[];
            options: any;
            constructor(content: any[], options: any) {
                this.content = content;
                this.options = options;
            }
        };
        (global as any).Blob = blobMock;

        // Mock URL
        urlMock = {
            createObjectURL: mock.fn((blob: any) => 'mock-url'),
            revokeObjectURL: mock.fn((url: string) => { revokedUrl = url; })
        };
        (global as any).URL = urlMock;

        // Mock document
        documentMock = {
            createElement: mock.fn((tag: string) => {
                createdElement = {
                    tagName: tag,
                    click: mock.fn(),
                    href: '',
                    download: ''
                };
                return createdElement;
            }),
            body: {
                appendChild: mock.fn((child: any) => { appendedChild = child; }),
                removeChild: mock.fn((child: any) => { removedChild = child; })
            }
        };
        (global as any).document = documentMock;

        // Mock window
        windowMock = {};
        (global as any).window = windowMock;
    });

    after(() => {
        // Restore original globals
        if (originalWindow) (global as any).window = originalWindow;
        else delete (global as any).window;

        if (originalDocument) (global as any).document = originalDocument;
        else delete (global as any).document;

        if (originalBlob) (global as any).Blob = originalBlob;
        else delete (global as any).Blob;

        if (originalURL) (global as any).URL = originalURL;
        else delete (global as any).URL;
    });

    beforeEach(() => {
        // Reset spies and state variables
        createdElement = null;
        appendedChild = null;
        removedChild = null;
        revokedUrl = null;
        urlMock.createObjectURL.mock.resetCalls();
        urlMock.revokeObjectURL.mock.resetCalls();
        documentMock.createElement.mock.resetCalls();
        documentMock.body.appendChild.mock.resetCalls();
        documentMock.body.removeChild.mock.resetCalls();
    });

    test('downloadTextFile should create anchor, click it, and remove it', () => {
        const content = 'hello world';
        const filename = 'test.txt';

        downloadTextFile(content, filename);

        // Verify URL creation
        assert.strictEqual(urlMock.createObjectURL.mock.calls.length, 1);

        // Verify element creation
        assert.strictEqual(documentMock.createElement.mock.calls.length, 1);
        assert.strictEqual(createdElement.tagName, 'a');
        assert.strictEqual(createdElement.href, 'mock-url');
        assert.strictEqual(createdElement.download, filename);

        // Verify append
        assert.strictEqual(documentMock.body.appendChild.mock.calls.length, 1);
        assert.strictEqual(appendedChild, createdElement);

        // Verify click
        assert.strictEqual(createdElement.click.mock.calls.length, 1);

        // Verify remove
        assert.strictEqual(documentMock.body.removeChild.mock.calls.length, 1);
        assert.strictEqual(removedChild, createdElement);

        // Verify revoke
        assert.strictEqual(urlMock.revokeObjectURL.mock.calls.length, 1);
        assert.strictEqual(revokedUrl, 'mock-url');
    });

    test('downloadChatHistory should trigger download with formatted content and date-stamped filename', () => {
        const messages: Message[] = [
            { role: 'user', text: 'Hello' },
            { role: 'model', text: 'Hi' }
        ];

        downloadChatHistory(messages);

        assert.strictEqual(urlMock.createObjectURL.mock.calls.length, 1);
        assert.strictEqual(createdElement.download.startsWith('charlie-feng-chat-'), true);
        assert.strictEqual(createdElement.download.endsWith('.txt'), true);
    });

    test('downloadChatHistory should do nothing if history is short', () => {
         const messages: Message[] = [
            { role: 'user', text: 'Hello' }
        ];

        downloadChatHistory(messages);

        assert.strictEqual(urlMock.createObjectURL.mock.calls.length, 0);
        assert.strictEqual(documentMock.createElement.mock.calls.length, 0);
    });

    test('downloadTextFile should warn and return if window is undefined', () => {
        // Temporarily hide window
        const tempWindow = (global as any).window;
        delete (global as any).window;

        const consoleSpy = mock.method(console, 'warn', () => {});

        downloadTextFile('content', 'file.txt');

        assert.strictEqual(consoleSpy.mock.calls.length, 1);
        assert.match(consoleSpy.mock.calls[0].arguments[0], /non-browser/);

        // Restore
        (global as any).window = tempWindow;
        consoleSpy.mock.restore();
    });
});
