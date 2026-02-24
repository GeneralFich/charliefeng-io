import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';

/**
 * @fileoverview Tests for lib/chatStorage.ts
 *
 * Tests all branches of the persistence layer: save, load, clear,
 * including version migration, schema validation, and error handling.
 * Uses a minimal localStorage mock since Node.js has no built-in one.
 */

// ── localStorage mock ────────────────────────────────────────────────────────
function createLocalStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
    _store: store, // Expose for assertions
  };
}

// Install before any imports that touch localStorage
const storageMock = createLocalStorageMock();
(globalThis as any).localStorage = storageMock;

const { saveChatState, loadChatState, clearChatState } = await import('../lib/chatStorage');

describe('chatStorage', () => {
  beforeEach(() => {
    storageMock.clear();
  });

  // ── saveChatState ──────────────────────────────────────────────────────────

  describe('saveChatState', () => {
    it('stores messages and prompts as versioned JSON', () => {
      const msgs = [{ role: 'user' as const, text: 'hello' }];
      const prompts = { en: ['Follow-up 1'] };

      saveChatState(msgs, prompts);

      const raw = storageMock.getItem('charliefeng-chat-history');
      assert.ok(raw, 'Should have stored a value');

      const parsed = JSON.parse(raw!);
      assert.strictEqual(parsed.version, 3);
      assert.deepStrictEqual(parsed.messages, msgs);
      assert.deepStrictEqual(parsed.suggestedPromptsPerLang, prompts);
    });

    it('overwrites previous state', () => {
      saveChatState([{ role: 'user' as const, text: 'first' }], {});
      saveChatState([{ role: 'model' as const, text: 'second' }], { zh: ['prompt'] });

      const parsed = JSON.parse(storageMock.getItem('charliefeng-chat-history')!);
      assert.strictEqual(parsed.messages.length, 1);
      assert.strictEqual(parsed.messages[0].text, 'second');
    });

    it('silently handles QuotaExceededError', () => {
      // Replace setItem with a throwing version
      const original = storageMock.setItem.bind(storageMock);
      storageMock.setItem = () => { throw new DOMException('quota exceeded', 'QuotaExceededError'); };

      // Should not throw
      assert.doesNotThrow(() => {
        saveChatState([{ role: 'user' as const, text: 'x' }], {});
      });

      storageMock.setItem = original;
    });
  });

  // ── loadChatState ──────────────────────────────────────────────────────────

  describe('loadChatState', () => {
    it('returns null when storage is empty', () => {
      assert.strictEqual(loadChatState(), null);
    });

    it('returns null and clears for wrong version', () => {
      storageMock.setItem(
        'charliefeng-chat-history',
        JSON.stringify({ version: 1, messages: [{ role: 'user', text: 'old' }], suggestedPromptsPerLang: {} })
      );

      const result = loadChatState();
      assert.strictEqual(result, null);
      // Should have called clearChatState
      assert.strictEqual(storageMock.getItem('charliefeng-chat-history'), null);
    });

    it('returns null for empty messages array', () => {
      storageMock.setItem(
        'charliefeng-chat-history',
        JSON.stringify({ version: 3, messages: [], suggestedPromptsPerLang: {} })
      );

      assert.strictEqual(loadChatState(), null);
    });

    it('returns null and clears for invalid message schema (missing role)', () => {
      storageMock.setItem(
        'charliefeng-chat-history',
        JSON.stringify({
          version: 3,
          messages: [{ text: 'no role' }],
          suggestedPromptsPerLang: {},
        })
      );

      const result = loadChatState();
      assert.strictEqual(result, null);
      assert.strictEqual(storageMock.getItem('charliefeng-chat-history'), null);
    });

    it('returns null and clears for invalid message schema (bad role value)', () => {
      storageMock.setItem(
        'charliefeng-chat-history',
        JSON.stringify({
          version: 3,
          messages: [{ role: 'admin', text: 'hacked' }],
          suggestedPromptsPerLang: {},
        })
      );

      const result = loadChatState();
      assert.strictEqual(result, null);
    });

    it('returns null and clears for invalid message schema (non-string text)', () => {
      storageMock.setItem(
        'charliefeng-chat-history',
        JSON.stringify({
          version: 3,
          messages: [{ role: 'user', text: 42 }],
          suggestedPromptsPerLang: {},
        })
      );

      const result = loadChatState();
      assert.strictEqual(result, null);
    });

    it('returns null and clears for corrupt JSON', () => {
      storageMock.setItem('charliefeng-chat-history', '{not valid json');

      const result = loadChatState();
      assert.strictEqual(result, null);
      assert.strictEqual(storageMock.getItem('charliefeng-chat-history'), null);
    });

    it('loads valid state correctly', () => {
      const state = {
        version: 3,
        messages: [
          { role: 'user', text: 'hi' },
          { role: 'model', text: 'hello' },
        ],
        suggestedPromptsPerLang: { en: ['Q1', 'Q2'] },
      };
      storageMock.setItem('charliefeng-chat-history', JSON.stringify(state));

      const result = loadChatState();
      assert.ok(result);
      assert.strictEqual(result!.messages.length, 2);
      assert.strictEqual(result!.messages[0].text, 'hi');
      assert.deepStrictEqual(result!.suggestedPromptsPerLang, { en: ['Q1', 'Q2'] });
    });

    it('defaults suggestedPromptsPerLang to {} when missing', () => {
      const state = {
        version: 3,
        messages: [{ role: 'user', text: 'hi' }],
        // suggestedPromptsPerLang is absent
      };
      storageMock.setItem('charliefeng-chat-history', JSON.stringify(state));

      const result = loadChatState();
      assert.ok(result);
      assert.deepStrictEqual(result!.suggestedPromptsPerLang, {});
    });

    it('defaults suggestedPromptsPerLang to {} when not an object', () => {
      const state = {
        version: 3,
        messages: [{ role: 'model', text: 'yo' }],
        suggestedPromptsPerLang: 'invalid',
      };
      storageMock.setItem('charliefeng-chat-history', JSON.stringify(state));

      const result = loadChatState();
      assert.ok(result);
      assert.deepStrictEqual(result!.suggestedPromptsPerLang, {});
    });
  });

  // ── clearChatState ─────────────────────────────────────────────────────────

  describe('clearChatState', () => {
    it('removes the storage key', () => {
      storageMock.setItem('charliefeng-chat-history', '{"version":3}');
      clearChatState();
      assert.strictEqual(storageMock.getItem('charliefeng-chat-history'), null);
    });

    it('does not throw when storage is already empty', () => {
      assert.doesNotThrow(() => clearChatState());
    });

    it('silently handles storage errors', () => {
      const original = storageMock.removeItem.bind(storageMock);
      storageMock.removeItem = () => { throw new Error('SecurityError'); };

      assert.doesNotThrow(() => clearChatState());

      storageMock.removeItem = original;
    });
  });
});
