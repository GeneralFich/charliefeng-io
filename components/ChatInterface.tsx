import React, { useRef, useEffect, useState } from 'react';
import { Loader2, RotateCcw, Download, Copy, Check } from 'lucide-react';
import { View } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatWelcome } from './ChatWelcome';
import { ChatInput, ChatInputHandle } from './ChatInput';
import { useChat } from '../hooks/useChat';

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

  const [isCopied, setIsCopied] = useState(false);
  const isInitialState = messages.length === 1 && messages[0].role === 'model';
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<ChatInputHandle>(null);

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

  const handleDownloadChat = () => {
    if (messages.length <= 1) return;

    const chatContent = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'You' : 'Charlie (AI)';
        return `[${role}]:\n${msg.text}\n`;
      })
      .join('\n' + '-'.repeat(40) + '\n\n');

    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `charlie-feng-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyChat = async () => {
    if (messages.length <= 1) return;

    const chatContent = messages
      .map(msg => {
        const role = msg.role === 'user' ? 'You' : 'Charlie (AI)';
        return `**${role}**:\n${msg.text}\n`;
      })
      .join('\n---\n\n');

    try {
      await navigator.clipboard.writeText(chatContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy chat:', err);
    }
  };

  const handleClearChat = () => {
    clearChat();
    inputRef.current?.clear();
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
                onClick={handleCopyChat}
                aria-label={isCopied ? "Copied chat to clipboard" : "Copy chat to clipboard"}
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-all shrink-0 group relative"
                title="Copy chat to clipboard"
              >
                {isCopied ? (
                  <Check size={20} className="text-green-400 transition-all duration-300" />
                ) : (
                  <Copy size={20} className="group-hover:scale-110 transition-transform duration-300" />
                )}
              </button>

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
                aria-label="Clear chat"
                className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all shrink-0 group"
                title="Clear chat history"
              >
                <RotateCcw size={20} className="group-hover:-rotate-180 transition-transform duration-500" />
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
