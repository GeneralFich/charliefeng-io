import React, { useState, forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react';
import { Send, Loader2, X } from 'lucide-react';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  placeholder?: string;
  maxLength?: number;
}

export interface ChatInputHandle {
  clear: () => void;
  setValue: (value: string) => void;
}

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  ({ onSend, isLoading, placeholder = "Ask anything...", maxLength = 2000 }, ref) => {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const maxRows = 6;

    const resizeTextarea = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 24;
      const maxHeight = lineHeight * maxRows;
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    }, []);

    useEffect(() => {
      resizeTextarea();
    }, [value, resizeTextarea]);

    useImperativeHandle(ref, () => ({
      clear: () => setValue(''),
      setValue: (val: string) => setValue(val)
    }));

    const handleClear = () => {
      setValue('');
      textareaRef.current?.focus();
    };

    const handleSend = () => {
      if (!value.trim() || isLoading) return;
      onSend(value);
      setValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    };

    return (
      <div className="relative flex-1">
        <textarea
          ref={textareaRef}
          aria-label="Chat message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Thinking..." : placeholder}
          maxLength={maxLength}
          rows={1}
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-32 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600 resize-none overflow-y-auto"
          disabled={isLoading}
        />

        {value.length > 0 && (
          <>
            <span
              className={`absolute right-24 bottom-3 text-xs font-mono tabular-nums pointer-events-none transition-colors ${
                value.length >= maxLength ? 'text-red-500 font-bold' :
                value.length > (maxLength * 0.9) ? 'text-amber-500' :
                'text-slate-400'
              }`}
              aria-hidden="true"
            >
              {value.length}/{maxLength}
            </span>

            {!isLoading && (
              <button
                onClick={handleClear}
                aria-label="Clear input"
                title="Clear input"
                className="absolute right-14 bottom-2.5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </>
        )}

        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          aria-label={isLoading ? "Sending message..." : "Send message"}
          title={isLoading ? "Sending message..." : "Send message"}
          className="absolute right-2 bottom-1.5 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
