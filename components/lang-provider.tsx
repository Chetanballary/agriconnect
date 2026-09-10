'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type Lang, t as translate, LANGS } from '@/lib/i18n';

type LangContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
};

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const t = useCallback((key: string) => translate(lang, key), [lang]);
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used within LangProvider');
  return ctx;
}

export { LANGS };
