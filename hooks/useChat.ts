import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { parseFollowUpPrompts } from '../lib/utils';

export const INITIAL_SUGGESTED_PROMPTS = [
  "Who is Charlie?",
  "Show me his resume",
  "What is the 'Interactive Knowledge Model'?",
  "Does he have experience with AGI?"
];

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hello. I am Charlie's digital twin.\n\nI have been trained on his resume, writing, and worldview. I can answer questions about his experience, or we can discuss product strategy and engineering.\n\nHow can I help you?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTED_PROMPTS);
  const [devMode, setDevMode] = useState(false);

  // Ref to track if component is mounted to prevent state updates after unmount
  const isMounted = useRef(true);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = { role: 'user', text: content };

    // Optimistic update
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSuggestedPrompts([]); // Clear prompts while loading

    try {
        // Retrieve current history from state updater to ensure we have it all
        let currentHistory: Message[] = [];
        setMessages(prev => {
            currentHistory = prev;
            return prev; // no-op update just to get state
        });

        // Filter history for API
        const apiHistory = currentHistory.filter(m => !m.isError);

        const { text: responseText, relevantChunks } = await sendMessageToGemini(apiHistory, content);

        if (!isMounted.current) return;

        const { cleanText, prompts } = parseFollowUpPrompts(responseText);

        const modelMsg: Message = {
            role: 'model',
            text: cleanText,
            relevantChunks: relevantChunks
        };
        setMessages((prev) => [...prev, modelMsg]);

        if (prompts && prompts.length > 0) {
            setSuggestedPrompts(prompts);
        }

    } catch (error) {
        console.error("Chat Error:", error);
        if (isMounted.current) {
             setMessages((prev) => [...prev, { role: 'model', text: "I encountered an error processing that request.", isError: true }]);
        }
    } finally {
        if (isMounted.current) {
            setIsLoading(false);
        }
    }
  }, []);

  return {
    messages,
    input,
    setInput,
    isLoading,
    sendMessage,
    suggestedPrompts,
    devMode,
    setDevMode
  };
}
