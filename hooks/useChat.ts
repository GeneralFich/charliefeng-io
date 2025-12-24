import { useState, useRef } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { parseFollowUpPrompts } from '../lib/utils';

const INITIAL_SUGGESTED_PROMPTS = [
  "Who is Charlie?",
  "What is his work experience?",
  "When will AGI arrive?",
  "How will AGI impact jobs?",
  "Explain 'Agentic Inflection Point'.",
  "Show me his resume.",
  "What are his core skills?",
  "Tell me about 'Climate Intelligence'.",
];

const INITIAL_MESSAGE_TEXT = "Hi! I'm Charlie's digital twin. I can answer questions about his work, writing, and research. What would you like to know?";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: INITIAL_MESSAGE_TEXT }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTED_PROMPTS);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setMessages([{ role: 'model', text: INITIAL_MESSAGE_TEXT }]);
    setSuggestedPrompts(INITIAL_SUGGESTED_PROMPTS);
    setInput('');
    setIsLoading(false);
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Security: Input length validation
    if (text.length > 2000) {
      const errorMsg: Message = { role: 'model', text: "Error: Message exceeds 2000 character limit." };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setSuggestedPrompts([]); // Clear suggestions while loading

    // Filter out the initial greeting from the history sent to API to save tokens/clean context
    // strictly keeping user/model pairs after system prompt is handled in service
    const apiHistory = messages.slice(1);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const stream = await sendMessageToGemini(apiHistory, text, controller.signal);
      const reader = stream.getReader();

      // Create a placeholder message for the incoming stream
      const modelMsg: Message = { role: 'model', text: '' };
      setMessages(prev => [...prev, modelMsg]);

      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        fullText += value;

        // Update the last message with the accumulated text
        setMessages(prev => {
          const newMsgs = [...prev];
          if (newMsgs.length > 0) {
             newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: fullText };
          }
          return newMsgs;
        });
      }

      // After streaming is complete, parse follow-up prompts from the full text
      const { cleanText, prompts } = parseFollowUpPrompts(fullText);

      // Update the message one last time with the clean text (removing the JSON block)
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs.length > 0) {
           newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], text: cleanText };
        }
        return newMsgs;
      });

      setSuggestedPrompts(prompts);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Generation aborted via clearChat');
        return;
      }
      console.error("Chat error:", error);
      // Ensure we append an error message if something failed drastically without streaming anything
      setMessages(prev => {
         const lastMsg = prev[prev.length - 1];
         if (lastMsg.role === 'model' && lastMsg.text === '') {
             // If we have an empty placeholder, update it to error
             const newMsgs = [...prev];
             newMsgs[newMsgs.length - 1] = { role: 'model', text: "An error occurred while generating response." };
             return newMsgs;
         } else if (lastMsg.role === 'user') {
             // If we haven't added the model message yet
             return [...prev, { role: 'model', text: "An error occurred." }];
         }
         return prev;
      });

    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    suggestedPrompts,
    sendMessage: handleSend,
    clearChat
  };
};
