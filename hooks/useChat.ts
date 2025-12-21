import { useState } from 'react';
import { Message } from '../types';
import { sendMessageStreamToGemini } from '../services/geminiService';
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

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm Charlie's digital twin. I can answer questions about his work, writing, and research. What would you like to know?" }
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
    // Create a placeholder for the bot's response
    const botMsgPlaceholder: Message = { role: 'model', text: '' };

    setMessages(prev => [...prev, userMsg, botMsgPlaceholder]);
    setInput('');
    setIsLoading(true);
    setSuggestedPrompts([]); // Clear suggestions while loading

    // Filter out the initial greeting from the history sent to API to save tokens/clean context
    // strictly keeping user/model pairs after system prompt is handled in service
    const apiHistory = messages.slice(1);

    let accumulatedResponse = "";

    try {
        const stream = sendMessageStreamToGemini(apiHistory, text);

        for await (const chunk of stream) {
            accumulatedResponse += chunk;
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === 'model') {
                    // Update the last message (placeholder) with accumulated text
                    newMessages[newMessages.length - 1] = { ...lastMsg, text: accumulatedResponse };
                }
                return newMessages;
            });
        }
    } catch (error) {
        console.error("Streaming error:", error);
        accumulatedResponse += "\n[Error: Connection interrupted]";
    }

    // After stream completes, handle follow-up prompts
    const { cleanText, prompts } = parseFollowUpPrompts(accumulatedResponse);

    setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'model') {
            newMessages[newMessages.length - 1] = { ...lastMsg, text: cleanText };
        }
        return newMessages;
    });

    setSuggestedPrompts(prompts);
    setIsLoading(false);
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    suggestedPrompts,
    sendMessage: handleSend
  };
};
