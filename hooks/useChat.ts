import { useState, useRef } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { parseFollowUpPrompts } from '../lib/utils';
import { checkRateLimit } from '../lib/security';

const INITIAL_SUGGESTED_PROMPTS = [
  "Who is Charlie?",
  "What is his work experience?",
  "Show me his resume.",
  "What are his core skills?",
  "What projects has he worked on?",
  "How can I contact him?",
];

const INITIAL_MESSAGE_TEXT = "Hello! I can answer questions about Charlie's work, writing, and research. What would you like to know?";

// Rate Limit: 10 requests per minute
const RATE_LIMIT_WINDOW = 60000;
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
export const useChat = (context?: string) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: INITIAL_MESSAGE_TEXT }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTED_PROMPTS);
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  // We ref context to ensure the latest value is used in the async handleSend without closure staleness issues
  // although handleSend is recreated if dependencies change, useRef is safer for "background" context.
  const contextRef = useRef(context);
  contextRef.current = context;

  /**
   * Resets the chat to its initial state.
   *
   * Why: We need to ensure that any pending API requests are aborted to prevent
   * a race condition where a response arrives after the chat has been cleared.
   */
  const clearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([{ role: 'model', text: INITIAL_MESSAGE_TEXT }]);
    setSuggestedPrompts(INITIAL_SUGGESTED_PROMPTS);
    setIsLoading(false);
  };

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
  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Security: Input length validation
    if (text.length > 2000) {
      const errorMsg: Message = { role: 'model', text: "Error: Message exceeds 2000 character limit." };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Security: Rate limiting
    const { allowed, newTimestamps } = checkRateLimit(requestTimestamps, RATE_LIMIT_WINDOW, MAX_REQUESTS);
    setRequestTimestamps(newTimestamps);

    if (!allowed) {
      const errorMsg: Message = { role: 'model', text: "System: Rate limit exceeded. Please wait a moment before sending more messages." };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setSuggestedPrompts([]); // Clear suggestions while loading

    // Filter out the initial greeting from the history sent to API to save tokens/clean context
    // strictly keeping user/model pairs after system prompt is handled in service
    const apiHistory = messages.slice(1);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const rawResponse = await sendMessageToGemini(apiHistory, text, contextRef.current, controller.signal);

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
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return {
    messages,
    isLoading,
    suggestedPrompts,
    sendMessage: handleSend,
    clearChat
  };
};
