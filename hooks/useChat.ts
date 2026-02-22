import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { streamMessageToGemini } from '../services/geminiService';
import { parseFollowUpPrompts } from '../lib/utils';
import { checkRateLimit, validateChatInput } from '../lib/security';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { saveChatState, loadChatState, clearChatState } from '../lib/chatStorage';

// Rate Limit Configuration
// Why: 10 requests per minute is a balanced threshold that allows for natural
// conversation flow (bursts of questions) while effectively mitigating automated
// abuse or accidental "enter key" spamming that could drain API quotas.
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;

/**
 * Custom hook to manage the chat interface state and interaction with the Gemini AI.
 *
 * Why: This separates the state management (messages, input, loading) from the UI components.
 * It encapsulates the complex logic of sending messages, handling streaming/responses,
 * parsing follow-up prompts, and managing the AbortController for cancellation.
 *
 * @returns An object containing:
 * - `messages`: Array of chat messages (user and model).
 * - `input`: Current value of the input field.
 * - `setInput`: Setter for the input field.
 * - `isLoading`: Boolean indicating if the model is currently generating a response.
 * - `suggestedPrompts`: Array of suggested follow-up questions.
 * - `sendMessage`: Function to send a user message.
 * - `clearChat`: Function to reset the chat history.
 */
export const useChat = () => {
  const { t, language } = useLanguage();
  const stored = loadChatState();
  const [messages, setMessages] = useState<Message[]>(
    stored?.messages ?? [{ role: 'model', text: t.chat.greeting }]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(
    stored?.suggestedPrompts.length ? stored.suggestedPrompts : t.chat.suggestions
  );

  // Use refs to keep track of latest state without causing re-renders in callbacks
  // This allows handleSend to be stable (memoized) while accessing fresh data.
  const messagesRef = useRef(messages);
  const isLoadingRef = useRef(isLoading);
  const requestTimestampsRef = useRef<number[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Handle language switch: Update greeting and prompts if chat is in initial state
  useEffect(() => {
    if (messagesRef.current.length <= 1 && messagesRef.current[0].role === 'model') {
       setMessages([{ role: 'model', text: t.chat.greeting }]);
       setSuggestedPrompts(t.chat.suggestions);
    }
  }, [language, t]);

  // Persist chat state to localStorage (skip during streaming to avoid saving partial messages)
  useEffect(() => {
    if (isStreaming) return;
    saveChatState(messages, suggestedPrompts);
  }, [messages, suggestedPrompts, isStreaming]);

  /**
   * Resets the chat to its initial state.
   *
   * Why: We need to ensure that any pending API requests are aborted to prevent
   * a race condition where a response arrives after the chat has been cleared.
   */
  const clearChat = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([{ role: 'model', text: t.chat.greeting }]);
    setSuggestedPrompts(t.chat.suggestions);
    setIsLoading(false);
    clearChatState();
  }, [t]);

  /**
   * Sends a message to the AI model.
   *
   * Flow:
   * 1. Validates input length.
   * 2. Optimistically adds the user's message to the UI.
   * 3. Creates an AbortController for the request.
   * 4. Calls the Gemini service.
   * 5. Parses the response for follow-up prompts (JSON format).
   * 6. Updates the UI with the model's response and new suggestions.
   *
   * @param text - The message text to send.
   */
  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || isLoadingRef.current) return;

    // Security: Input validation (length, content safety, spam)
    // We validate against the *current* history (messagesRef.current) which is the state before this new message
    const validation = validateChatInput(messagesRef.current, text);
    if (!validation.valid) {
      const errorMsg: Message = { role: 'model', text: `Error: ${validation.error || "Invalid input."}` };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Security: Rate limiting
    // Load latest timestamps from storage to handle multi-tab synchronization
    let currentTimestamps = requestTimestampsRef.current;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('chat_rate_limit_timestamps');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            currentTimestamps = parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load rate limit timestamps:', e);
      }
    }

    const { allowed, newTimestamps } = checkRateLimit(currentTimestamps, RATE_LIMIT_WINDOW, MAX_REQUESTS);
    requestTimestampsRef.current = newTimestamps;

    // Persist to local storage
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

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedPrompts([]); // Clear suggestions while loading

    // Context Optimization: Filter out the initial "Hello!" greeting.
    // Why: The static greeting adds no semantic value to the LLM's context window.
    // Removing it saves tokens and prevents the model from being biased by its own
    // hardcoded initial output.
    const apiHistory = messagesRef.current.slice(1);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Optimistically add an empty model message — chunks will fill it in
    setMessages(prev => [...prev, { role: 'model', text: '' }]);

    let firstChunk = true;

    try {
      const rawResponse = await streamMessageToGemini(
        apiHistory,
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

      // Parse follow-up prompts from the fully assembled response
      const { cleanText, prompts } = parseFollowUpPrompts(rawResponse);

      // Replace last message with clean text (strips the JSON prompt block)
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === 'model') {
          updated[updated.length - 1] = { ...last, text: cleanText };
        }
        return updated;
      });
      setSuggestedPrompts(prompts);
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
  }, [language]); // Depends on language

  return {
    messages,
    isLoading,
    isStreaming,
    suggestedPrompts,
    sendMessage: handleSend,
    clearChat
  };
};
