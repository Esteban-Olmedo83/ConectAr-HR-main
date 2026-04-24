'use client';

// Re-export from canonical i18n module so all consumers use one context instance.
export { LangProvider as LocaleProvider, useLocale, useLang } from '@/lib/i18n';
export type { Locale, Translation } from '@/lib/i18n/translations';
