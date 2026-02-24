import React, { useState, useRef, useEffect } from 'react';
import { Monitor, Sun, Moon } from 'lucide-react';
import { useTheme, ThemeMode } from '../lib/ThemeContext';

const OPTIONS: { mode: ThemeMode; icon: React.FC<{ size?: number; className?: string }>; label: string }[] = [
  { mode: 'system', icon: Monitor, label: 'System' },
  { mode: 'light',  icon: Sun,     label: 'Light' },
  { mode: 'dark',   icon: Moon,    label: 'Dark' },
];

export const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const currentOption = OPTIONS.find((o) => o.mode === mode) || OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <CurrentIcon size={20} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-36 z-50" role="menu">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
            {OPTIONS.map(({ mode: optMode, icon: Icon, label }) => (
              <button
                key={optMode}
                role="menuitem"
                onClick={() => { setMode(optMode); setIsOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                  mode === optMode
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
