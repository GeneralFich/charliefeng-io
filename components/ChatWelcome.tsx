import React from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChatWelcomeProps {
  message: string;
  suggestedPrompts: string[];
  onPromptClick: (prompt: string) => void;
}

// Shared spring presets
const springBounce = { type: 'spring' as const, stiffness: 320, damping: 20 };
const springSnappy = { type: 'spring' as const, stiffness: 500, damping: 28 };

export const ChatWelcome: React.FC<ChatWelcomeProps> = ({
  message,
  suggestedPrompts,
  onPromptClick,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px]">

      {/* ── Avatar ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.35, opacity: 0, y: 24 }}
        animate={{ scale: 1,    opacity: 1, y: 0  }}
        transition={{ type: 'spring', stiffness: 260, damping: 17, delay: 0.05 }}
        className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6"
      >
        <span className="text-white font-bold text-3xl select-none">CF</span>

        {/* Orbiting glow dot — mirrors the logo animation */}
        <motion.span
          className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
          style={{ top: 0, left: '50%', x: '-50%', y: '-50%', originX: '50%', originY: '50px' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <motion.h2
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ ...springBounce, delay: 0.15 }}
        className="text-2xl font-bold text-slate-200 mb-3 text-center"
      >
        Charlie's Digital Twin
      </motion.h2>

      {/* ── Greeting message ────────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ ...springBounce, delay: 0.23 }}
        className="text-slate-400 text-center max-w-md mb-8 leading-relaxed"
      >
        {message}
      </motion.p>

      {/* ── Suggested prompt cards — staggered spring entrance ──────────── */}
      {/* Single-column grid fits the narrow chat sidebar panel */}
      <div className="grid grid-cols-1 gap-3 w-full max-w-sm">
        {suggestedPrompts.map((prompt, idx) => (
          <motion.button
            key={`${prompt}-${idx}`}
            onClick={() => onPromptClick(prompt)}
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            transition={{ ...springBounce, delay: 0.32 + idx * 0.07 }}
            whileHover={{
              y: -5,
              scale: 1.025,
              boxShadow: '0 10px 28px rgba(59,130,246,0.18)',
            }}
            whileTap={{ scale: 0.96 }}
            className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-blue-500/30 transition-colors text-left group"
          >
            <div className="flex items-center gap-2 mb-1">
              {/* Sparkle icon springs in on hover */}
              <motion.div
                whileHover={{ rotate: 18, scale: 1.35 }}
                transition={springSnappy}
              >
                <Sparkles
                  size={14}
                  className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </motion.div>
              <span className="text-slate-300 text-sm font-medium group-hover:text-blue-400 transition-colors">
                {prompt}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
