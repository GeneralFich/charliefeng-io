import React, { useRef, useEffect, useState } from 'react';
import { Loader2, RotateCcw, Download, Trash2, AlertCircle } from 'lucide-react';
import { View } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatWelcome } from './ChatWelcome';
import { ChatInput, ChatInputHandle } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { downloadChatHistory } from '../lib/download';

interface ChatInterfaceProps {
  onNavigate?: (view: View, slug?: string) => void;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate, className }) => {
  const {
    messages,
    isLoading,
    suggestedPrompts,
    sendMessage,
    clearChat
  } = useChat();

  const isInitialState = messages.length === 1 && messages[0].role === 'model';
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);

  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const clearConfirmTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clearConfirmTimeoutRef.current) {
        clearTimeout(clearConfirmTimeoutRef.current);
      }
    };
  }, []);

  const handleDownloadChat = () => {
    downloadChatHistory(messages);
  };

  const handleClearChat = () => {
    if (isConfirmingClear) {
      clearChat();
      inputRef.current?.clear();
      setIsConfirmingClear(false);
      if (clearConfirmTimeoutRef.current) {
        clearTimeout(clearConfirmTimeoutRef.current);
      }
    } else {
      setIsConfirmingClear(true);
      if (clearConfirmTimeoutRef.current) {
        clearTimeout(clearConfirmTimeoutRef.current);
      }
      clearConfirmTimeoutRef.current = setTimeout(() => {
        setIsConfirmingClear(false);
      }, 3000);
    }
  };

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
              <div
                className="flex items-center gap-3"
                role="status"
                aria-live="polite"
              >
                <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <Loader2 size={16} className="text-blue-400 animate-spin" />
                </div>
                <div className="text-slate-500 text-xs tracking-widest animate-pulse">
                  THINKING...
                </div>
                <span className="sr-only">Charlie is thinking...</span>
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
            <>
              <button
                onClick={handleDownloadChat}
                aria-label="Download chat"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all shrink-0 group"
                title="Download chat history"
              >
                <Download size={20} className="group-hover:scale-110 transition-transform duration-300" />
              </button>

              <button
                onClick={handleClearChat}
                aria-label={isConfirmingClear ? "Confirm clear chat" : "Clear chat"}
                aria-pressed={isConfirmingClear}
                className={`p-3.5 rounded-xl border transition-all shrink-0 group relative overflow-hidden ${
                  isConfirmingClear
                    ? "bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10"
                }`}
                title={isConfirmingClear ? "Click again to confirm" : "Clear chat history"}
              >
                 <div className="relative">
                    <div className={`transition-all duration-300 ${isConfirmingClear ? 'opacity-0 scale-50 rotate-180 absolute inset-0' : 'opacity-100 scale-100 rotate-0'}`}>
                       <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
                    </div>
                    <div className={`transition-all duration-300 ${isConfirmingClear ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-180 absolute inset-0'}`}>
                       <Trash2 size={20} className="animate-pulse" />
                    </div>
                 </div>
              </button>
            </>
          )}

          <ChatInput
            ref={inputRef}
            onSend={sendMessage}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};
