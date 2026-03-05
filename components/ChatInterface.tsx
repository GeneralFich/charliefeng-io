import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Download, Trash2 } from 'lucide-react';
import { View } from '../types';
import { ChatMessage } from './ChatMessage';
import { ChatWelcome } from './ChatWelcome';
import { ChatInput, ChatInputHandle } from './ChatInput';
import { useChat } from '../hooks/useChat';
import { downloadChatHistory } from '../lib/download';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface ChatInterfaceProps {
  onNavigate?: (view: View, slug?: string, hash?: string) => void;
  className?: string;
  onFocusRef?: React.MutableRefObject<(() => void) | null>;
}

const springSnap = { type: 'spring' as const, stiffness: 500, damping: 28 };

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onNavigate, className, onFocusRef }) => {
  const { t } = useLanguage();
  const {
    messages,
    isLoading,
    isStreaming,
    suggestedPrompts,
    sendMessage,
    clearChat,
  } = useChat();

  const isInitialState  = messages.length === 1 && messages[0].role === 'model';
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef         = useRef<ChatInputHandle>(null);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const clearTimeoutRef = useRef<NodeJS.Timeout>(undefined);

  useEffect(() => {
    return () => { clearTimeout(clearTimeoutRef.current); };
  }, []);

  // Expose focus method to parent (e.g. App.tsx focuses chat input when "Chat" nav is clicked on desktop)
  useEffect(() => {
    if (onFocusRef) {
      onFocusRef.current = () => inputRef.current?.focus();
    }
  }, [onFocusRef]);

  const scrollToBottom = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  const handleDownloadChat = () => { downloadChatHistory(messages); };

  const handleClearChat = () => {
    if (isConfirmingClear) {
      clearChat();
      inputRef.current?.clear();
      setIsConfirmingClear(false);
      clearTimeout(clearTimeoutRef.current);
    } else {
      setIsConfirmingClear(true);
      clearTimeoutRef.current = setTimeout(() => setIsConfirmingClear(false), 3000);
    }
  };

  return (
    <div className={`flex flex-col w-full ${className ?? 'h-full'}`}>
      {/* Chat Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-6"
      >
        {isInitialState ? (
          <ChatWelcome
            heading={t.chat.heading}
            message={messages[0].text}
            suggestedPrompts={suggestedPrompts}
            onPromptClick={sendMessage}
          />
        ) : (
          <>
            {messages.map((msg, idx) => {
              // While loading (before streaming starts), the last message is an empty model
              // placeholder. Skip it — the thinking indicator below handles this state visually,
              // preventing two bot avatars from appearing simultaneously.
              const isEmptyLoadingPlaceholder =
                isLoading && !isStreaming &&
                idx === messages.length - 1 &&
                msg.role === 'model' &&
                msg.text === '';
              if (isEmptyLoadingPlaceholder) return null;
              return (
                <ChatMessage
                  key={idx}
                  message={msg}
                  onNavigate={onNavigate}
                  isStreaming={isStreaming && idx === messages.length - 1 && msg.role === 'model'}
                />
              );
            })}

            {/* ── Bouncing-dot thinking indicator ──────────────────────── */}
            {isLoading && !isStreaming && (
              <div className="flex items-center gap-3" role="status" aria-live="polite">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                  <span className="flex gap-[5px] items-end h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400 block"
                        style={{
                          animation: `bounce-dot 1.1s ease-in-out ${i * 0.16}s infinite`,
                        }}
                      />
                    ))}
                  </span>
                </div>
                <span className="sr-only">Charlie is thinking…</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Input Area ─────────────────────────────────────────────────── */}
      <div className="px-6 py-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">

        {/* Suggested follow-up chips */}
        {!isInitialState && suggestedPrompts.length > 0 && (
          <div
            className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar"
            role="region"
            aria-label="Suggested follow-up questions"
          >
            {suggestedPrompts.map((prompt, idx) => (
              <motion.button
                key={`${prompt}-${idx}`}
                onClick={() => sendMessage(prompt)}
                whileHover={{ scale: 1.07, y: -2 }}
                whileTap={{ scale: 0.94 }}
                transition={springSnap}
                className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-3">
          {!isInitialState && (
            <>
              {/* Download button */}
              <motion.button
                onClick={handleDownloadChat}
                whileHover={{ scale: 1.1,  y: -2 }}
                whileTap={{   scale: 0.9,  y: 2  }}
                transition={springSnap}
                aria-label={t.chat.download}
                className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 transition-colors shrink-0"
                title={t.chat.download}
              >
                <Download size={20} />
              </motion.button>

              {/* Clear / confirm-clear button */}
              <motion.button
                onClick={handleClearChat}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={springSnap}
                aria-label={isConfirmingClear ? t.chat.confirmClear : t.chat.clear}
                className={`p-3.5 rounded-xl border transition-colors shrink-0 ${
                  isConfirmingClear
                    ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10'
                }`}
                title={isConfirmingClear ? t.chat.confirmClear : t.chat.clear}
              >
                {isConfirmingClear ? (
                  <Trash2 size={20} className="animate-pulse" />
                ) : (
                  <motion.div
                    whileHover={{ rotate: -180 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                  >
                    <RotateCcw size={20} />
                  </motion.div>
                )}
              </motion.button>
            </>
          )}

          <ChatInput
            ref={inputRef}
            onSend={sendMessage}
            isLoading={isLoading}
            placeholder={t.chat.inputPlaceholder}
          />
        </div>
      </div>
    </div>
  );
};
