import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <Keyboard size={20} className="text-blue-400" />
            </div>
            <h2 id="shortcuts-title" className="text-lg font-semibold tracking-tight">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close shortcuts"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Navigation Section */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                Navigation
              </h3>
              <div className="space-y-3">
                <ShortcutItem keys={['G', 'H']} description="Go to Chat (Home)" />
                <ShortcutItem keys={['G', 'A']} description="Go to About" />
                <ShortcutItem keys={['G', 'E']} description="Go to Essays" />
                <ShortcutItem keys={['G', 'C']} description="Go to Contact" />
              </div>
            </div>

            {/* General Section */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                General
              </h3>
              <div className="space-y-3">
                <ShortcutItem keys={['?']} description="Show Shortcuts" />
                <ShortcutItem keys={['Esc']} description="Close Modal" />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/50 border-t border-slate-800 text-xs text-slate-500 text-center">
          Press <Kbd>Esc</Kbd> to close
        </div>
      </div>
    </div>
  );
};

const ShortcutItem: React.FC<{ keys: string[]; description: string }> = ({ keys, description }) => (
  <div className="flex items-center justify-between group">
    <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{description}</span>
    <div className="flex items-center gap-1.5">
      {keys.map((key, i) => (
        <React.Fragment key={key}>
          <Kbd>{key}</Kbd>
          {i < keys.length - 1 && <span className="text-slate-600 text-xs font-medium">+</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="min-w-[24px] h-6 px-1.5 flex items-center justify-center bg-slate-800 border-b-2 border-slate-700 rounded text-[11px] font-mono font-bold text-slate-300 shadow-sm">
    {children}
  </kbd>
);
