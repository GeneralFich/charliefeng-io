import { Message } from '../types';

const STORAGE_KEY = 'charliefeng-chat-history';
// Version 3: messages now carry per-language translations; suggestedPrompts
// is replaced with suggestedPromptsPerLang so both EN and ZH chips are persisted.
const STORAGE_VERSION = 3;

interface StoredChatState {
  version: number;
  messages: Message[];
  suggestedPromptsPerLang: Partial<Record<string, string[]>>;
}

export function saveChatState(
  messages: Message[],
  suggestedPromptsPerLang: Partial<Record<string, string[]>>,
): void {
  try {
    const state: StoredChatState = {
      version: STORAGE_VERSION,
      messages,
      suggestedPromptsPerLang,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // QuotaExceededError or SecurityError (e.g., private browsing)
  }
}

export function loadChatState(): {
  messages: Message[];
  suggestedPromptsPerLang: Partial<Record<string, string[]>>;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: StoredChatState = JSON.parse(raw);

    if (parsed.version !== STORAGE_VERSION) {
      clearChatState();
      return null;
    }

    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) {
      return null;
    }

    const isValid = parsed.messages.every(
      (msg) =>
        msg &&
        typeof msg === 'object' &&
        (msg.role === 'user' || msg.role === 'model') &&
        typeof msg.text === 'string'
    );

    if (!isValid) {
      clearChatState();
      return null;
    }

    return {
      messages: parsed.messages,
      suggestedPromptsPerLang:
        parsed.suggestedPromptsPerLang &&
        typeof parsed.suggestedPromptsPerLang === 'object'
          ? parsed.suggestedPromptsPerLang
          : {},
    };
  } catch {
    clearChatState();
    return null;
  }
}

export function clearChatState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
