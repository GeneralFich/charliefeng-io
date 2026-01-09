import React, { useEffect, useRef } from 'react';
import { X, Keyboard } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcuts = [
    { keys: ['G', 'H'], description: 'Go to Home / Chat' },
    { keys: ['G', 'A'], description: 'Go to About / Resume' },
    { keys: ['G', 'E'], description: 'Go to Essays' },
    { keys: ['?'], description: 'Open this help menu' },
    { keys: ['Esc'], description: 'Close this menu' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-md w-full m-4 relative animate-in zoom-in-95 duration-200 outline-none ring-1 ring-slate-700"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        role="dialog"
        aria-label="Keyboard Shortcuts"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-full"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Keyboard className="text-blue-400" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Keyboard Shortcuts</h2>
            <p className="text-sm text-slate-400">Navigate quickly with these commands</p>
          </div>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between group p-2 hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="text-slate-300 font-medium group-hover:text-white transition-colors">
                {shortcut.description}
              </span>
              <div className="flex items-center gap-1.5">
                {shortcut.keys.map((key, kIndex) => (
                  <React.Fragment key={kIndex}>
                    <kbd className="min-w-[2rem] h-8 px-2 flex items-center justify-center bg-slate-800 border-b-2 border-slate-700 rounded text-sm text-slate-300 font-mono shadow-sm group-hover:border-slate-600 group-hover:text-white transition-all">
                      {key}
                    </kbd>
                    {kIndex < shortcut.keys.length - 1 && (
                      <span className="text-slate-600 text-xs font-medium">then</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
