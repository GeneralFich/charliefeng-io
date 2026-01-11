import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Send, Loader2 } from 'lucide-react';

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

    useImperativeHandle(ref, () => ({
      clear: () => setValue(''),
      setValue: (val: string) => setValue(val)
    }));

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
        <input
          type="text"
          aria-label="Chat message"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isLoading ? "Thinking..." : placeholder}
          maxLength={maxLength}
          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl py-3.5 pl-4 pr-32 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
          disabled={isLoading}
        />

        {value.length > 0 && (
          <span
            className={`absolute right-12 top-1/2 -translate-y-1/2 text-xs font-mono tabular-nums pointer-events-none transition-colors ${
              value.length >= maxLength ? 'text-red-500 font-bold' :
              value.length > (maxLength * 0.9) ? 'text-amber-500' :
              'text-slate-400'
            }`}
            aria-hidden="true"
          >
            {value.length}/{maxLength}
          </span>
        )}

        <button
          onClick={handleSend}
          disabled={!value.trim() || isLoading}
          aria-label={isLoading ? "Sending message..." : "Send message"}
          title={isLoading ? "Sending message..." : "Send message"}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all"
        >
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    );
  }
);

ChatInput.displayName = 'ChatInput';
