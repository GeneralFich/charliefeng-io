import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { Message, View } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from './ChatMessage';

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

interface ChatInterfaceProps {
  onNavigate?: (view: View, slug?: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Welcome to the digital extension of my work as an infrastructure product leader. This interactive knowledge model allows you to explore my experience and research through conversation." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(INITIAL_SUGGESTED_PROMPTS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    
    let responseText = await sendMessageToGemini(apiHistory, text);

    // Extract follow-up questions
    let newSuggestedPrompts: string[] = [];

    if (responseText.includes('[FOLLOW_UP]')) {
      const parts = responseText.split('[FOLLOW_UP]');
      responseText = parts[0].trim();
      const potentialJson = parts.slice(1).join('[FOLLOW_UP]').trim();

      try {
        newSuggestedPrompts = JSON.parse(potentialJson);
      } catch (e) {
        console.error("Failed to parse follow-up prompts directly", e);
        // Fallback: try to find the array brackets if direct parse fails (e.g. trailing text)
        const firstBracket = potentialJson.indexOf('[');
        const lastBracket = potentialJson.lastIndexOf(']');
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
          try {
            const jsonSubstring = potentialJson.substring(firstBracket, lastBracket + 1);
            newSuggestedPrompts = JSON.parse(jsonSubstring);
          } catch (innerE) {
            console.error("Failed to parse extracted JSON substring", innerE);
          }
        }
      }
    }

    const modelMsg: Message = { role: 'model', text: responseText };
    setMessages(prev => [...prev, modelMsg]);
    setSuggestedPrompts(newSuggestedPrompts);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-4xl mx-auto w-full">
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} onNavigate={onNavigate} />
        ))}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
              <Sparkles size={16} className="text-blue-400 animate-pulse" />
            </div>
            <div className="text-slate-500 text-xs tracking-widest animate-pulse">
              ANALYZING SIGNAL...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/50 backdrop-blur-md border-t border-slate-800">
        {suggestedPrompts.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={`${prompt}-${idx}`}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        <div className="relative flex items-center">
          <input
            type="text"
            aria-label="Chat message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask Charlie's Digital Twin..."
            maxLength={2000} // Security: Prevent large payloads
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-32 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />

          {/* Character Count */}
          {input.length > 0 && (
            <span className="absolute right-12 text-xs text-slate-400 font-mono tabular-nums pointer-events-none">
              {input.length}/2000
            </span>
          )}

          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            aria-label={isLoading ? "Sending message..." : "Send message"}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
