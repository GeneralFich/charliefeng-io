import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatWelcomeProps {
  message: string;
  suggestedPrompts: string[];
  onPromptClick: (prompt: string) => void;
}

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({ message, suggestedPrompts, onPromptClick }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
        <span className="text-white font-bold text-2xl">CF</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-200 mb-3 text-center">Hello! I'm Charlie's AI.</h2>
      <p className="text-slate-400 text-center max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={`${prompt}-${idx}`}
            onClick={() => onPromptClick(prompt)}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/30 transition-all text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-blue-500 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" />
              <span className="text-slate-300 text-sm font-medium group-hover:text-blue-400 transition-colors">
                {prompt}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
