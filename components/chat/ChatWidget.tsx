'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { TextStreamChatTransport } from 'ai';
import { useTranslations } from 'next-intl';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/cn';

const suggestionKeys = ['suggestion1', 'suggestion2', 'suggestion3'] as const;

const transport = new TextStreamChatTransport({ api: '/api/chat' });

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const t = useTranslations('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({ transport });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const msg = text || inputValue.trim();
    if (!msg || isLoading) return;
    sendMessage({ text: msg });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-colors no-print',
          isOpen
            ? 'bg-charcoal text-ghost border border-silver/20'
            : 'bg-sapphire text-white hover:bg-sapphire/90'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[70vh] bg-obsidian border border-silver/20 rounded-lg shadow-2xl flex flex-col overflow-hidden no-print">
          {/* Header */}
          <div className="px-4 py-3 border-b border-silver/10">
            <h3 className="font-heading text-sm font-semibold text-ghost">
              {t('heading')}
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-steel">
                  {t('placeholder')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestionKeys.map((key) => (
                    <button
                      key={key}
                      onClick={() => handleSend(t(key))}
                      className="text-xs text-sapphire border border-sapphire/20 rounded-full px-3 py-1.5 hover:bg-sapphire/10 transition-colors text-left"
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'text-sm leading-relaxed whitespace-pre-wrap',
                  msg.role === 'user'
                    ? 'bg-charcoal rounded-lg px-3 py-2 text-ghost ml-8'
                    : 'text-ghost/90 mr-8'
                )}
              >
                {msg.parts
                  .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
                  .map((p, i) => <span key={i}>{p.text}</span>)}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="text-xs font-mono text-steel animate-pulse">
                Thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-silver/10 flex gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('placeholder')}
              className="flex-1 bg-charcoal border border-silver/20 rounded-lg px-3 py-2 text-sm text-ghost placeholder:text-steel focus:outline-none focus:border-sapphire/50"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !inputValue.trim()}
              className="shrink-0 w-9 h-9 rounded-lg bg-sapphire text-white flex items-center justify-center hover:bg-sapphire/90 transition-colors disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
