import { useState, useRef, useEffect, useCallback } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { parseFollowUpPrompts } from '../lib/utils';
import { checkRateLimit, MAX_NEW_MESSAGE_LENGTH } from '../lib/security';

/**
 * Curated list of initial prompts to guide the user towards the persona's core competencies.
 *
 * Why: Users often don't know what to ask a "Digital Twin". These specific questions
 * act as signposts to the high-value content (Resume, Projects, Contact info)
 * and help establish the professional, "Strategic Thought Partner" persona immediately.
 */
const INITIAL_SUGGESTED_PROMPTS = [
  "Who is Charlie?",
  "What is his work experience?",
  "Show me his resume.",
  "What are his core skills?",
  "What projects has he worked on?",
  "How can I contact him?",
];

const INITIAL_MESSAGE_TEXT = "Hello! I can answer questions about Charlie's work, writing, and research. What would you like to know?";

// Rate Limit Configuration
// Why: 10 requests per minute is a balanced threshold that allows for natural
// conversation flow (bursts of questions) while effectively mitigating automated
// abuse or accidental "enter key" spamming that could drain API quotas.
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 10;
const STORAGE_KEY = 'chat_rate_limit_timestamps';

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
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: INITIAL_MESSAGE_TEXT }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTED_PROMPTS);

  // Use refs to keep track of latest state without causing re-renders in callbacks
  // This allows handleSend to be stable (memoized) while accessing fresh data.
  const messagesRef = useRef(messages);
  const isLoadingRef = useRef(isLoading);
  const requestTimestampsRef = useRef<number[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Initialize rate limit timestamps from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const timestamps = JSON.parse(stored);
        if (Array.isArray(timestamps)) {
          // Only keep valid timestamps within the window to prune old data
          const now = Date.now();
          requestTimestampsRef.current = timestamps.filter((t: number) => now - t < RATE_LIMIT_WINDOW);
        }
      }
    } catch (e) {
      console.warn('Failed to load rate limit timestamps:', e);
    }
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

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
    setMessages([{ role: 'model', text: INITIAL_MESSAGE_TEXT }]);
    setSuggestedPrompts(INITIAL_SUGGESTED_PROMPTS);
    setIsLoading(false);
  }, []);

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

    // Security: Input length validation
    if (text.length > MAX_NEW_MESSAGE_LENGTH) {
      const errorMsg: Message = { role: 'model', text: `Error: Message exceeds ${MAX_NEW_MESSAGE_LENGTH} character limit.` };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Security: Rate limiting
    const { allowed, newTimestamps } = checkRateLimit(requestTimestampsRef.current, RATE_LIMIT_WINDOW, MAX_REQUESTS);
    requestTimestampsRef.current = newTimestamps;

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTimestamps));
    } catch (e) {
      console.warn('Failed to save rate limit timestamps:', e);
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

    try {
      const rawResponse = await sendMessageToGemini(apiHistory, text, controller.signal);

      // If aborted during processing (race condition check)
      if (controller.signal.aborted) return;

      const { cleanText, prompts } = parseFollowUpPrompts(rawResponse);

      const modelMsg: Message = { role: 'model', text: cleanText };
      setMessages(prev => [...prev, modelMsg]);
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
      abortControllerRef.current = null;
    }
  }, []); // Stable dependency

  return {
    messages,
    isLoading,
    suggestedPrompts,
    sendMessage: handleSend,
    clearChat
  };
};
