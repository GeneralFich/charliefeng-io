import React, { useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import { View } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatWelcome } from './ChatWelcome';
import { useChat } from '../hooks/useChat';

interface ChatInterfaceProps {
  onNavigate?: (view: View, slug?: string) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate, className }) => {
  const {
    messages,
    input,
    setInput,
    isLoading,
    suggestedPrompts,
    sendMessage,
    clearChat
  } = useChat();

  const isInitialState = messages.length === 1 && messages[0].role === 'model';
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className={`flex flex-col w-full ${className || 'h-[calc(100vh-140px)] max-w-4xl mx-auto'}`}>
      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6"
      >
        {isInitialState ? (
          <ChatWelcome
            message={messages[0].text}
            suggestedPrompts={suggestedPrompts}
            onPromptClick={sendMessage}
          />
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} onNavigate={onNavigate} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <Loader2 size={16} className="text-blue-400 animate-spin" />
                </div>
                <div className="text-slate-500 text-xs tracking-widest animate-pulse">
                  THINKING...
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-950/50 backdrop-blur-md border-t border-slate-800">
        {!isInitialState && suggestedPrompts.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar" role="region" aria-label="Suggested follow-up questions">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={`${prompt}-${idx}`}
                onClick={() => sendMessage(prompt)}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-700 bg-slate-900/50 text-xs text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-3">
          {!isInitialState && (
            <button
              onClick={clearChat}
              aria-label="Clear chat"
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all shrink-0 group"
              title="Clear chat history"
            >
              <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
            </button>
          )}

          <div className="relative flex-1">
            <input
              type="text"
              aria-label="Chat message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder={isLoading ? "Thinking..." : "Ask anything..."}
              maxLength={2000}
              className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-32 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
              disabled={isLoading}
            />

            {input.length > 0 && (
              <span
                className={`absolute right-12 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums pointer-events-none transition-colors ${
                  input.length >= 2000 ? 'text-red-500 font-bold' :
                  input.length > 1800 ? 'text-amber-500' :
                  'text-slate-400'
                }`}
                aria-hidden="true"
              >
                {input.length}/2000
              </span>
            )}

            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              aria-label={isLoading ? "Sending message..." : "Send message"}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
