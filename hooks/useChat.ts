import { useState } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { parseFollowUpPrompts } from '../lib/utils';

const INITIAL_SUGGESTED_PROMPTS = [
  "Summarize Charlie's experience.",
  "When will AGI arrive?",
  "What is the 'Agentic Inflection Point'?",
  "How should I hedge my portfolio?",
  "How will AGI impact the labor market?",
  "Tell me about your work at Google.",
  "What skills are critical for the AGI era?",
  "Explain your 'Climate Intelligence' work.",
];

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Welcome to the digital extension of my work as an infrastructure product leader. This interactive knowledge model allows you to explore my experience and research through conversation." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTED_PROMPTS);

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
    handleSend
  };
};
