import React from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { Language } from '../types';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 rounded-md hover:bg-slate-800/50"
        aria-label="Select Language"
      >
        <Globe size={20} />
        <span className="uppercase text-xs font-bold">{language}</span>
      </button>

      <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden hidden group-hover:block z-50">
        <button
          onClick={() => setLanguage(Language.EN)}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${language === Language.EN ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
        >
          English
        </button>
        <button
          onClick={() => setLanguage(Language.ZH)}
          className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-800 transition-colors ${language === Language.ZH ? 'text-blue-400 font-bold' : 'text-slate-300'}`}
        >
          中文 (Chinese)
        </button>
      </div>
    </div>
  );
};
