import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../../types';
import { TRANSLATIONS, Translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = 'app_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(Language.EN);

  useEffect(() => {
    const savedLang = localStorage.getItem(LANGUAGE_KEY) as Language;
    if (savedLang && Object.values(Language).includes(savedLang)) {
      setLanguageState(savedLang);
      document.documentElement.lang = savedLang;
    } else {
      document.documentElement.lang = Language.EN;
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
    localStorage.setItem(LANGUAGE_KEY, lang);
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
