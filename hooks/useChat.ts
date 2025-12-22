import { useState } from 'react';
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

  const clearChat = () => {
    setMessages([{ role: 'model', text: INITIAL_MESSAGE_TEXT }]);
    setSuggestedPrompts(INITIAL_SUGGESTED_PROMPTS);
    setInput('');
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

    const rawResponse = await sendMessageToGemini(apiHistory, text);
    const { cleanText, prompts } = parseFollowUpPrompts(rawResponse);

    const modelMsg: Message = { role: 'model', text: cleanText };
    setMessages(prev => [...prev, modelMsg]);
    setSuggestedPrompts(prompts);
    setIsLoading(false);
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
