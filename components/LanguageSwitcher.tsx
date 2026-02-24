import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Language } from '../types';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
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

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/50"
        aria-label="Select Language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={20} />
        <span className="uppercase text-xs font-bold">{language}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-32 z-50" role="menu">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden">
            <button
              role="menuitem"
              onClick={() => selectLanguage(Language.EN)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${language === Language.EN ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
            >
              English
            </button>
            <button
              role="menuitem"
              onClick={() => selectLanguage(Language.ZH)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${language === Language.ZH ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-300'}`}
            >
              中文 (Chinese)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
