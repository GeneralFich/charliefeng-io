import { describe, it, mock } from 'node:test';
import assert from 'node:assert';
import { Language, Message } from '../types';

/**
 * @fileoverview Tests for pure functions extracted from hooks/useChat.ts
 *
 * Tests makeGreeting() and buildApiHistories() — the core logic of the chat
 * hook — without requiring a React test harness.
 */

// Mock the LanguageContext import (used by useChat) and other React-dependent
// modules so we can import the pure functions without side effects.
mock.module('../lib/i18n/LanguageContext', {
  namedExports: {
    useLanguage: () => ({
      language: Language.EN,
      setLanguage: () => {},
      t: { chat: { greeting: 'Test greeting', suggestions: [] } },
    }),
  },
});

mock.module('react', {
  namedExports: {
    useState: (init: any) => [typeof init === 'function' ? init() : init, () => {}],
    useRef: (init: any) => ({ current: init }),
    useEffect: () => {},
    useCallback: (fn: any) => fn,
    createContext: () => ({}),
    useContext: () => ({}),
  },
  defaultExport: {
    createElement: () => null,
  },
});

mock.module('../lib/chatStorage', {
  namedExports: {
    saveChatState: () => {},
    loadChatState: () => null,
    clearChatState: () => {},
  },
});

mock.module('../services/geminiService', {
  namedExports: {
    streamMessageToGemini: async () => '',
    sendMessageToGemini: async () => '',
  },
});

mock.module('../services/deepseekService', {
  namedExports: {
    streamMessageToDeepSeek: async () => '',
    sendMessageToDeepSeek: async () => '',
  },
});

const { makeGreeting, buildApiHistories } = await import('../hooks/useChat');

describe('makeGreeting', () => {
  it('returns a model message with the correct role', () => {
    const msg = makeGreeting(Language.EN);
    assert.strictEqual(msg.role, 'model');
  });

  it('populates both EN and ZH translations', () => {
    const msg = makeGreeting(Language.EN);
    assert.ok(msg.translations);
    assert.ok(msg.translations![Language.EN], 'EN translation should exist');
    assert.ok(msg.translations![Language.ZH], 'ZH translation should exist');
  });

  it('sets text to the current language greeting', () => {
    const enMsg = makeGreeting(Language.EN);
    assert.ok(enMsg.text.length > 0);
    // Text should match the EN translation
    assert.strictEqual(enMsg.text, enMsg.translations![Language.EN]);
  });

  it('sets text to ZH greeting when ZH is current', () => {
    const zhMsg = makeGreeting(Language.ZH);
    assert.strictEqual(zhMsg.text, zhMsg.translations![Language.ZH]);
  });

  it('has a stable id "greeting"', () => {
    const msg = makeGreeting(Language.EN);
    assert.strictEqual(msg.id, 'greeting');
  });
});

describe('buildApiHistories', () => {
  const greeting: Message = {
    role: 'model',
    text: 'Hello',
    id: 'greeting',
    translations: { en: 'Hello', zh: '你好' },
  };

  it('excludes the greeting (index 0) from both histories', () => {
    const messages: Message[] = [greeting];
    const { primaryApiHistory, otherApiHistory } = buildApiHistories(messages, Language.EN);

    assert.strictEqual(primaryApiHistory.length, 0);
    assert.strictEqual(otherApiHistory.length, 0);
  });

  it('uses current-language translation for primary history model messages', () => {
    const messages: Message[] = [
      greeting,
      { role: 'user', text: 'What do you do?' },
      {
        role: 'model',
        text: 'I work in infrastructure.',
        translations: { en: 'I work in infrastructure.', zh: '我从事基础设施工作。' },
      },
    ];

    const { primaryApiHistory } = buildApiHistories(messages, Language.EN);

    assert.strictEqual(primaryApiHistory.length, 2);
    assert.strictEqual(primaryApiHistory[0].text, 'What do you do?'); // user unchanged
    assert.strictEqual(primaryApiHistory[1].text, 'I work in infrastructure.'); // EN translation
  });

  it('uses other-language translation for other history model messages', () => {
    const messages: Message[] = [
      greeting,
      { role: 'user', text: 'What do you do?' },
      {
        role: 'model',
        text: 'I work in infrastructure.',
        translations: { en: 'I work in infrastructure.', zh: '我从事基础设施工作。' },
      },
    ];

    const { otherApiHistory } = buildApiHistories(messages, Language.EN);

    assert.strictEqual(otherApiHistory.length, 2);
    assert.strictEqual(otherApiHistory[0].text, 'What do you do?'); // user unchanged
    assert.strictEqual(otherApiHistory[1].text, '我从事基础设施工作。'); // ZH translation
  });

  it('falls back to text when translations are missing for other language', () => {
    const messages: Message[] = [
      greeting,
      {
        role: 'model',
        text: 'fallback text',
        // no translations
      },
    ];

    const { otherApiHistory } = buildApiHistories(messages, Language.EN);
    assert.strictEqual(otherApiHistory[0].text, 'fallback text');
  });

  it('falls back to current-language translation when other-language is missing', () => {
    const messages: Message[] = [
      greeting,
      {
        role: 'model',
        text: 'raw text',
        translations: { en: 'english only' },
      },
    ];

    const { otherApiHistory } = buildApiHistories(messages, Language.EN);
    // otherLang (ZH) is missing, so should fall back to EN translation
    assert.strictEqual(otherApiHistory[0].text, 'english only');
  });

  it('does not modify user messages', () => {
    const messages: Message[] = [
      greeting,
      { role: 'user', text: 'user input' },
    ];

    const { primaryApiHistory, otherApiHistory } = buildApiHistories(messages, Language.EN);
    assert.strictEqual(primaryApiHistory[0].text, 'user input');
    assert.strictEqual(otherApiHistory[0].text, 'user input');
  });

  it('handles multiple turns correctly', () => {
    const messages: Message[] = [
      greeting,
      { role: 'user', text: 'Q1' },
      { role: 'model', text: 'A1', translations: { en: 'A1-EN', zh: 'A1-ZH' } },
      { role: 'user', text: 'Q2' },
      { role: 'model', text: 'A2', translations: { en: 'A2-EN', zh: 'A2-ZH' } },
    ];

    const { primaryApiHistory, otherApiHistory } = buildApiHistories(messages, Language.ZH);

    // Primary = ZH
    assert.strictEqual(primaryApiHistory[1].text, 'A1-ZH');
    assert.strictEqual(primaryApiHistory[3].text, 'A2-ZH');

    // Other = EN
    assert.strictEqual(otherApiHistory[1].text, 'A1-EN');
    assert.strictEqual(otherApiHistory[3].text, 'A2-EN');
  });
});
