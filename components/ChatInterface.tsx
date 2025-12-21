import React, { useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Terminal, ToggleLeft, ToggleRight, Bot } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { ChatMessage } from './ChatMessage';
import { View } from '../types';
import { ArchitectureMap } from './ArchitectureMap';

interface ChatInterfaceProps {
  onNavigate: (view: View, slug?: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate }) => {
  const { messages, input, setInput, isLoading, sendMessage, suggestedPrompts, devMode, setDevMode } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // We use the container ref to scroll specifically the message list, not the whole window
    if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current;
        containerRef.current.scrollTo({
            top: scrollHeight - clientHeight,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        sendMessage(input);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
       {/* Header Controls */}
       <div className="flex items-center justify-end space-x-4 mb-2 px-2">
            <ArchitectureMap />
            <button
                onClick={() => setDevMode(!devMode)}
                className={`flex items-center space-x-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    devMode
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300'
                }`}
            >
                <Terminal size={12} />
                <span>Dev Mode</span>
                {devMode ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            </button>
       </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-6 p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {messages.length === 0 ? (
           // This state is effectively unreachable now due to initial message, but kept for safety
           <div className="flex flex-col items-center justify-center h-full text-slate-500">
             <p>No messages yet.</p>
           </div>
        ) : (
            <>
                {messages.length === 1 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6 animate-fade-in">
                        <div className="relative">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full"></div>
                            <img src="/favicon.svg" alt="Logo" className="relative w-24 h-24 text-emerald-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">
                            Hello, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Charlie's Digital Twin</span>.
                        </h2>
                        <p className="max-w-md text-slate-400">
                             I'm an Interactive Knowledge Model trained on his resume, writing, and worldview. Ask me anything about his work in Infrastructure, Product, or AGI.
                        </p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                  <ChatMessage
                    key={idx}
                    message={msg}
                    onNavigate={onNavigate}
                    devMode={devMode}
                  />
                ))}
            </>
        )}

        {isLoading && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                <Bot size={16} className="text-blue-400" />
             </div>
             <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl rounded-tl-sm text-slate-400 text-sm flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                    {devMode ? "Retrieving context vectors..." : "Thinking..."}
                </span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 space-y-4">
        {suggestedPrompts.length > 0 && !isLoading && (
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(prompt)}
                className="flex items-center space-x-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/30 rounded-lg text-xs text-slate-300 transition-all group"
              >
                <Sparkles size={12} className="text-emerald-500 opacity-50 group-hover:opacity-100" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative group">
            <div className={`absolute -top-6 right-0 text-[10px] font-mono transition-opacity ${input.length > 0 ? 'opacity-100' : 'opacity-0'} ${input.length > 1800 ? 'text-red-400' : 'text-slate-500'}`}>
                {input.length}/2000
            </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="Ask me about product strategy, infrastructure, or AGI..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-lg"
            disabled={isLoading}
            aria-label="Chat input"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-600 text-white rounded-lg opacity-0 group-focus-within:opacity-100 transition-all disabled:opacity-0 disabled:cursor-not-allowed hover:bg-emerald-500"
            aria-label={isLoading ? "Sending message..." : "Send message"}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
        <div className="text-center">
            <p className="text-[10px] text-slate-600">
                AI can make mistakes. Please verify important information.
            </p>
        </div>
      </div>
    </div>
  );
};
