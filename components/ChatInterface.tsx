import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

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

// Memoized Markdown components to prevent re-renders on every keystroke
const MARKDOWN_COMPONENTS: Components = {
  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
  ul: ({node, ...props}) => <ul className="list-disc list-outside ml-4 mb-2" {...props} />,
  ol: ({node, ...props}) => <ol className="list-decimal list-outside ml-4 mb-2" {...props} />,
  li: ({node, ...props}) => <li className="mb-1" {...props} />,
  a: ({node, ...props}) => <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
  strong: ({node, ...props}) => <strong className="font-bold text-slate-100" {...props} />,
  code: ({node, ...props}) => {
    return <code className="bg-slate-800 px-1 py-0.5 rounded text-xs font-mono text-slate-200" {...props} />
  },
  blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-600 pl-4 italic text-slate-400 my-2" {...props} />,
  h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2 text-slate-100" {...props} />,
  h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2 text-slate-100" {...props} />,
  h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 text-slate-100" {...props} />,
  table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full divide-y divide-slate-700" {...props} /></div>,
  thead: ({node, ...props}) => <thead className="bg-slate-800" {...props} />,
  tbody: ({node, ...props}) => <tbody className="divide-y divide-slate-700" {...props} />,
  tr: ({node, ...props}) => <tr {...props} />,
  th: ({node, ...props}) => <th className="px-3 py-2 text-left text-xs font-medium text-slate-300 uppercase tracking-wider" {...props} />,
  td: ({node, ...props}) => <td className="px-3 py-2 whitespace-nowrap text-sm text-slate-300" {...props} />,
};

const REMARK_PLUGINS = [remarkGfm];

// Memoized message component to prevent re-rendering all messages when input changes
const ChatMessage = React.memo(({ msg }: { msg: Message }) => {
  return (
    <div
      className={`flex items-start gap-3 ${
        msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700 border border-slate-600'
        }`}
      >
        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-blue-400" />}
      </div>
      <div
        className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
          msg.role === 'user'
            ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-sm'
            : 'bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-sm shadow-xl'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={REMARK_PLUGINS}
          components={MARKDOWN_COMPONENTS}
        >
          {msg.text}
        </ReactMarkdown>
      </div>
    </div>
  );
});

ChatMessage.displayName = 'ChatMessage';

export const ChatInterface: React.FC = () => {
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
          <ChatMessage key={idx} msg={msg} />
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ask Charlie's Digital Twin..."
            className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
