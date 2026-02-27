import { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Language } from '../types';
import { streamMessageToGemini, sendMessageToGemini } from '../services/geminiService';
import { streamMessageToDeepSeek, sendMessageToDeepSeek } from '../services/deepseekService';
import { detectProvider, AIProvider } from '../lib/providerDetection';
import { parseFollowUpPrompts } from '../lib/utils';
import { checkRateLimit, validateChatInput } from '../lib/security';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { saveChatState, loadChatState, clearChatState } from '../lib/chatStorage';
import { TRANSLATIONS } from '../lib/i18n/translations';

// Rate Limit Configuration
// Why: 10 requests per minute is a balanced threshold that allows for natural
// conversation flow (bursts of questions) while effectively mitigating automated
// abuse or accidental "enter key" spamming that could drain API quotas.
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

/**
 * Builds the initial greeting message with translations pre-populated for both
 * languages so the greeting always renders correctly without an API call.
 */
export function makeGreeting(currentLang: Language): Message {
  return {
    role: 'model',
    id: 'greeting',
    text: TRANSLATIONS[currentLang].chat.greeting,
    translations: {
      [Language.EN]: TRANSLATIONS[Language.EN].chat.greeting,
      [Language.ZH]: TRANSLATIONS[Language.ZH].chat.greeting,
    },
  };
}

/**
 * Custom hook to manage the chat interface state and interaction with the Gemini AI.
 *
 * Dual-language design:
 * After every streaming response, a silent background call fires in the *other*
 * language.  The result is stored in `message.translations[otherLang]`.
 * ChatMessage reads `translations[currentLang] ?? text` so toggling the
 * language switcher immediately surfaces the alternate response without clearing
 * the conversation.
 *
 * @returns An object containing:
 * - `messages`: Array of chat messages (user and model).
 * - `isLoading`: Boolean indicating if the model is currently generating a response.
 * - `isStreaming`: Boolean indicating if a streaming response is in progress.
 * - `suggestedPrompts`: Array of suggested follow-up questions in the current language.
 * - `sendMessage`: Function to send a user message.
 * - `clearChat`: Function to reset the chat history.
 */
export const useChat = () => {
  const { t, language } = useLanguage();

  const stored = loadChatState();

  const [messages, setMessages] = useState<Message[]>(
    stored?.messages ?? [makeGreeting(language)]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    stored?.suggestedPromptsPerLang?.[language] ??
    (stored ? [] : t.chat.suggestions)
  );

  // Use refs to keep track of latest state without causing re-renders in callbacks.
  // This allows handleSend to be stable (memoized) while accessing fresh data.
  const messagesRef = useRef(messages);
  const isLoadingRef = useRef(isLoading);
  const requestTimestampsRef = useRef<number[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Provider detection: probe Google API connectivity on mount.
  // Resolves to 'gemini' or 'deepseek'.  A single Promise is shared so that
  // rapid sends all await the same in-flight probe rather than re-probing.
  const providerPromiseRef = useRef<Promise<AIProvider>>(detectProvider());

  // Per-language prompt chips, kept in a ref to avoid stale closures in the
  // background translation callback without triggering unnecessary re-renders.
  const suggestedPromptsPerLangRef = useRef<Partial<Record<string, string[]>>>(
    stored?.suggestedPromptsPerLang ?? {}
  );

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // When the language toggle fires, switch the displayed suggested prompts to
  // whatever was stored for that language (if the background call has already
  // completed), or clear them if we don't have a translation yet.
  // We do NOT clear the conversation — ChatMessage handles rendering the right
  // language via message.translations[language].
  useEffect(() => {
    const prompts = suggestedPromptsPerLangRef.current[language];
    const isInitialState = messagesRef.current.length <= 1;
    setSuggestedPrompts(prompts ?? (isInitialState ? t.chat.suggestions : []));
  }, [language, t]);

  // Persist chat state whenever messages or prompts settle (skip mid-stream).
  useEffect(() => {
    if (isStreaming) return;
    saveChatState(messages, suggestedPromptsPerLangRef.current);
  }, [messages, isStreaming]); // intentionally omit suggestedPromptsPerLangRef (ref, not state)

  /**
   * Resets the chat to its initial state.
   */
  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    const freshGreeting = makeGreeting(language);
    setMessages([freshGreeting]);
    setSuggestedPrompts(t.chat.suggestions);
    suggestedPromptsPerLangRef.current = {};
    setIsLoading(false);
    clearChatState();
  }, [language, t]);

  /**
   * Sends a message to the AI model.
   *
   * Flow:
   * 1. Validates and rate-limits the input.
   * 2. Captures the current conversation snapshot (apiHistorySnapshot) so both
   *    the primary streaming call and the background call share the same history.
   * 3. Streams the primary response in the current language.
   * 4. After streaming completes, fires a background non-streaming call in the
   *    other language and stores the result in message.translations[otherLang].
   *
   * @param text - The message text to send.
   */
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoadingRef.current) return;

    const validation = validateChatInput(messagesRef.current, text);
    if (!validation.valid) {
      const errorMsg: Message = { role: 'model', text: `Error: ${validation.error || "Invalid input."}` };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Security: Rate limiting with multi-tab synchronisation via localStorage
    let currentTimestamps = requestTimestampsRef.current;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('chat_rate_limit_timestamps');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) currentTimestamps = parsed;
        }
      } catch (e) {
        console.warn('Failed to load rate limit timestamps:', e);
      }
    }

    const { allowed, newTimestamps } = checkRateLimit(currentTimestamps, RATE_LIMIT_WINDOW, MAX_REQUESTS);
    requestTimestampsRef.current = newTimestamps;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('chat_rate_limit_timestamps', JSON.stringify(newTimestamps));
      } catch (e) {
        console.warn('Failed to save rate limit timestamps:', e);
      }
    }

    if (!allowed) {
      const errorMsg: Message = { role: 'model', text: "System: Rate limit exceeded. Please wait a moment before sending more messages." };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // ── Snapshot current history before adding new messages ───────────────────
    // messagesRef.current still reflects state from before this render cycle,
    // so both the primary and background calls share the same consistent baseline.
    const apiHistorySnapshot = messagesRef.current.slice(1); // exclude greeting

    // Build history for the primary call: use the current-language translation
    // for model turns so the conversation context is in the right language.
    const primaryApiHistory: Message[] = apiHistorySnapshot.map(msg =>
      msg.role === 'model'
        ? { ...msg, text: msg.translations?.[language] ?? msg.text }
        : msg
    );

    // Build history for the background call: use the other-language translation
    // (falling back to current language if the background hasn't run yet).
    const otherLanguage: Language = language === Language.EN ? Language.ZH : Language.EN;
    const otherApiHistory: Message[] = apiHistorySnapshot.map(msg =>
      msg.role === 'model'
        ? { ...msg, text: msg.translations?.[otherLanguage] ?? msg.translations?.[language] ?? msg.text }
        : msg
    );

    // ── Optimistic UI updates ─────────────────────────────────────────────────
    const userMsg: Message = { role: 'user', text, id: crypto.randomUUID() };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedPrompts([]);

    const modelMsgId = crypto.randomUUID();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Add an empty model placeholder — streaming chunks will fill it in.
    // We pre-seed translations as an empty object (not undefined) so that
    // ChatMessage can detect a pending translation vs a message that was
    // never meant to have one (e.g. error messages without an id).
    setMessages(prev => [...prev, { role: 'model', text: '', id: modelMsgId, translations: {} }]);

    // ── Resolve AI provider (Gemini or DeepSeek fallback) ────────────────────
    // The probe started on mount; by the time the user has typed and sent a
    // message it will almost always have already resolved.
    const provider = await providerPromiseRef.current;
    const streamFn = provider === 'deepseek' ? streamMessageToDeepSeek : streamMessageToGemini;
    const sendFn   = provider === 'deepseek' ? sendMessageToDeepSeek   : sendMessageToGemini;

    // ── Background translation call — starts CONCURRENTLY with streaming ─────
    // Firing here rather than after streaming means the ~2-5s translation call
    // runs in parallel with the ~5-15s streaming response.  By the time the
    // user finishes reading and reaches for the language toggle, the translation
    // is almost always already waiting in message.translations[otherLanguage].
    // If it fails or the user clears the chat, the stale setMessages update is
    // harmless — the message won't be found by ID.
    void (async () => {
      try {
        const otherRaw = await sendFn(otherApiHistory, text, otherLanguage);
        const { cleanText: otherClean, prompts: otherPrompts } = parseFollowUpPrompts(otherRaw);

        setMessages(prev => prev.map(msg =>
          msg.id === modelMsgId
            ? { ...msg, translations: { ...(msg.translations ?? {}), [otherLanguage]: otherClean } }
            : msg
        ));

        suggestedPromptsPerLangRef.current = {
          ...suggestedPromptsPerLangRef.current,
          [otherLanguage]: otherPrompts,
        };
      } catch (e) {
        console.warn('Background translation call failed:', e);
      }
    })();

    let firstChunk = true;

    try {
      // ── Primary streaming call (current language) ─────────────────────────
      const rawResponse = await streamFn(
        primaryApiHistory,
        text,
        language,
        (chunk: string) => {
          if (controller.signal.aborted) return;
          if (firstChunk) {
            firstChunk = false;
            setIsLoading(false);
            setIsStreaming(true);
          }
          setMessages(prev => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last.role === 'model') {
              updated[updated.length - 1] = { ...last, text: last.text + chunk };
            }
            return updated;
          });
        },
        controller.signal
      );

      if (controller.signal.aborted) return;

      const { cleanText, prompts } = parseFollowUpPrompts(rawResponse);

      // Finalise: store cleanText in both text and translations[currentLanguage]
      // so ChatMessage always resolves displayText correctly.
      setMessages(prev => prev.map(msg =>
        msg.id === modelMsgId
          ? { ...msg, text: cleanText, translations: { ...(msg.translations ?? {}), [language]: cleanText } }
          : msg
      ));

      setSuggestedPrompts(prompts);
      suggestedPromptsPerLangRef.current = {
        ...suggestedPromptsPerLangRef.current,
        [language]: prompts,
      };

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation aborted via clearChat');
        return;
      }
      console.error("Chat error:", error);
      const errorMsg: Message = { role: 'model', text: "Error: Failed to connect to the model. Please try again." };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [language]); // language is the only external value that changes the call behaviour

  return {
    messages,
    isLoading,
    isStreaming,
    suggestedPrompts,
    sendMessage: handleSend,
    clearChat
  };
};

/**
 * Builds the two API history arrays (primary and other-language) from a raw
 * message array.  Extracted from handleSend so the mapping logic is testable
 * without a React harness.
 *
 * @param messages - Full message array (including greeting at index 0).
 * @param currentLanguage - The language of the primary streaming call.
 * @returns primaryApiHistory and otherApiHistory arrays.
 */
export function buildApiHistories(
  messages: Message[],
  currentLanguage: Language,
): { primaryApiHistory: Message[]; otherApiHistory: Message[] } {
  const apiHistorySnapshot = messages.slice(1); // exclude greeting

  const primaryApiHistory: Message[] = apiHistorySnapshot.map(msg =>
    msg.role === 'model'
      ? { ...msg, text: msg.translations?.[currentLanguage] ?? msg.text }
      : msg
  );

  const otherLanguage: Language = currentLanguage === Language.EN ? Language.ZH : Language.EN;
  const otherApiHistory: Message[] = apiHistorySnapshot.map(msg =>
    msg.role === 'model'
      ? { ...msg, text: msg.translations?.[otherLanguage] ?? msg.translations?.[currentLanguage] ?? msg.text }
      : msg
  );

  return { primaryApiHistory, otherApiHistory };
}
