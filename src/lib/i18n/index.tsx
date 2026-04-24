'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Locale, Translation, translations } from './translations';

interface LangContextType {
  lang: Locale;
  setLang: (lang: Locale) => void;
  t: Translation;
}

export const LangContext = createContext<LangContextType>({
  lang: 'es',
  setLang: () => null,
  t: translations.es as Translation,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Locale>('es');

  useEffect(() => {
    const saved = localStorage.getItem('conectar-locale') as Locale | null;
    if (saved === 'es' || saved === 'en') {
      setLangState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLang = (newLang: Locale) => {
    setLangState(newLang);
    localStorage.setItem('conectar-locale', newLang);
    document.documentElement.lang = newLang;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] as Translation }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);

// Re-export for consumers that use the locale-named hook
export { LangProvider as LocaleProvider };
export const useLocale = () => {
  const { lang, setLang, t } = useContext(LangContext);
  return { locale: lang, setLocale: setLang, t };
};
